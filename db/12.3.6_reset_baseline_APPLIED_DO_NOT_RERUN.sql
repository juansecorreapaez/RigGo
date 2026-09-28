-- RigGO 12.3.6 · Atomic ACTIVE -> READY reset
-- Run ONCE in Supabase SQL Editor before using "Reiniciar Move".
--
-- Purpose:
--   Allow an authorized ACTIVE Move to return to READY / not-started while
--   PRESERVING the server Plan and atomically clearing only that run's execution.
--
-- Preserved:
--   moves.settings -> riggo_payload.plan and all planning/master configuration
--   riggo_move_audit (audit history)
--
-- Reset for this Move:
--   actual_release / actual_acceptance
--   current execution state back to clean Plan baseline
--   daily_periods / daily_closures / reports / riggo_move_reports
--   active Move reactions
--
-- Safety:
--   ACTIVE only. COMPLETED Moves are never reset by this RPC.
--   Master + execution CAS revisions are required.
--   Current execution is snapshotted once into riggo_execution_history first.

begin;

-- Lifecycle trigger: add one narrowly-scoped server flag for the atomic reset RPC.
create or replace function public.riggo_strip_master_execution()
returns trigger language plpgsql as $$
declare
  v_activation boolean := coalesce(current_setting('riggo.atomic_activation',true),'')='1';
  v_completion boolean := coalesce(current_setting('riggo.atomic_completion',true),'')='1';
  v_reset boolean := coalesce(current_setting('riggo.atomic_reset',true),'')='1';
begin
  if tg_op='INSERT' then
    if new.status in ('active','completed') then raise exception 'riggo_atomic_lifecycle_required'; end if;
    new.actual_release:=null;new.actual_acceptance:=null;
  else
    if old.status='ready' and new.status='active' and not v_activation then
      raise exception 'riggo_atomic_activation_required';
    end if;
    if old.status='active' and new.status='completed' and not v_completion then
      raise exception 'riggo_atomic_completion_required';
    end if;

    -- ACTIVE may regress only through riggo_reset_move_to_ready_v1.
    if old.status='active' and new.status in ('draft','ready') and not v_reset then
      new.status:=old.status;
    end if;

    -- COMPLETED remains terminal.
    if old.status='completed' and new.status<>'completed' then new.status:='completed'; end if;

    -- Lifecycle RPCs exclusively own Release / Acceptance.
    if not v_activation and not v_reset then new.actual_release:=old.actual_release; end if;
    if not v_completion and not v_reset then new.actual_acceptance:=old.actual_acceptance; end if;
  end if;

  if new.settings ? 'riggo_payload' then
    new.settings := jsonb_set(
      new.settings,
      '{riggo_payload}',
      coalesce(new.settings->'riggo_payload','{}'::jsonb)-'exec',
      true
    );
  end if;
  return new;
end $$;

-- Trigger already exists in production, but recreate it idempotently so this SQL
-- is independently safe if the trigger was replaced during maintenance.
drop trigger if exists trg_riggo_strip_master_execution on public.moves;
create trigger trg_riggo_strip_master_execution
before insert or update on public.moves
for each row execute function public.riggo_strip_master_execution();

create or replace function public.riggo_reset_move_to_ready_v1(
  p_move_id uuid,
  p_expected_master_revision bigint,
  p_expected_execution_revision bigint,
  p_operation_id uuid
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_actor citext := public.current_email();
  v_move public.moves%rowtype;
  v_exec public.riggo_execution_state%rowtype;
  v_payload jsonb;
  v_result jsonb;
  v_master_rev bigint;
  v_now timestamptz := clock_timestamp();
begin
  if v_actor is null or not public.riggo_user_active(v_actor) then
    return jsonb_build_object('ok',false,'code','not_authorized','message','Usuario no autorizado.');
  end if;
  if p_operation_id is null then
    return jsonb_build_object('ok',false,'code','missing_operation_id','message','Falta operation_id.');
  end if;

  select * into v_move
  from public.moves m
  where m.id=p_move_id
  for update;

  if not found or v_move.deleted_at is not null then
    return jsonb_build_object('ok',false,'code','move_not_found','message','Move no encontrada.');
  end if;

  if not (
    public.riggo_can_execute_move(v_actor,p_move_id)
    or public.has_permission('admin')
    or public.has_permission('plan')
  ) then
    return jsonb_build_object('ok',false,'code','reset_forbidden','message','No tienes permiso para reiniciar esta Move.');
  end if;

  -- Retry only the same actor, Move and operation. A different READY Move
  -- must not be reported as successfully reset by this request.
  select o.result into v_result from public.riggo_operations o
  where o.operation_id=p_operation_id and o.actor=v_actor
    and o.move_id=p_move_id and o.operation='RESET_TO_READY_12_3_6';
  if v_result is not null then return v_result; end if;
  if exists(select 1 from public.riggo_operations where operation_id=p_operation_id) then
    return jsonb_build_object('ok',false,'code','operation_id_reused');
  end if;

  if v_move.status='completed' then
    return jsonb_build_object('ok',false,'code','completed_terminal','message','Una Move COMPLETED no puede reiniciarse.');
  end if;
  if v_move.status<>'active' then
    return jsonb_build_object('ok',false,'code','not_active','message','Solo una Move ACTIVE puede volver a no iniciada.');
  end if;
  if coalesce(p_expected_master_revision,0)<>v_move.revision then
    return jsonb_build_object('ok',false,'code','master_revision_conflict','server_revision',v_move.revision,'message','La Move cambió antes del reinicio. Actualiza e intenta de nuevo.');
  end if;

  select * into v_exec
  from public.riggo_execution_state e
  where e.move_id=p_move_id
  for update;
  if not found then
    return jsonb_build_object('ok',false,'code','missing_execution_state','message','Move ACTIVE sin execution_state autoritativo.');
  end if;
  if coalesce(p_expected_execution_revision,0)<>v_exec.revision then
    return jsonb_build_object('ok',false,'code','execution_revision_conflict','server_revision',v_exec.revision,'message','La ejecución cambió antes del reinicio. Actualiza e intenta de nuevo.');
  end if;

  -- Preserve one auditable pre-reset checkpoint. 12.3.x payloads are compacted.
  insert into public.riggo_execution_history(move_id,revision,payload,actor,operation_id)
  values(v_exec.move_id,v_exec.revision,v_exec.payload,v_actor,p_operation_id);

  -- Rebuild a pristine execution baseline from the authoritative Plan.
  v_payload := public.riggo_execution_from_plan_v1(p_move_id,v_move.actual_release)
    || jsonb_build_object(
      'actualRelease','',
      'actualAcceptance','',
      'moveClosedAt','',
      'closures','{}'::jsonb,
      'periods','[]'::jsonb,
      'selectedPeriodId',null,
      'cutoffs','{}'::jsonb,
      'cutoffEnds','{}'::jsonb,
      'cutoffAudit','{}'::jsonb,
      'forcedThroughDay',0,
      '_riggoRunId',p_operation_id::text
    );

  perform set_config('riggo.atomic_reset','1',true);
  update public.riggo_execution_state e
  set revision=v_exec.revision+1,
      payload=v_payload,
      updated_at=v_now,
      updated_by=v_actor
  where e.move_id=p_move_id
  returning * into v_exec;

  -- Remove only artifacts belonging to the execution run being reset.
  delete from public.reports where move_id=p_move_id;
  delete from public.riggo_move_reports where move_id=p_move_id;
  delete from public.daily_closures where move_id=p_move_id;
  delete from public.daily_periods where move_id=p_move_id;
  delete from public.move_reactions where move_id=p_move_id;

  perform set_config('riggo.atomic_reset','1',true);
  update public.moves m
  set status='ready',
      actual_release=null,
      actual_acceptance=null,
      updated_at=v_now,
      updated_by=v_actor,
      revision=v_move.revision+1
  where m.id=p_move_id
  returning revision into v_master_rev;

  insert into public.riggo_move_audit(move_id,action,actor,revision,details)
  values(
    p_move_id,
    'RESET_TO_READY_12_3_6',
    v_actor,
    v_master_rev,
    jsonb_build_object(
      'prior_master_revision',v_move.revision,
      'prior_execution_revision',p_expected_execution_revision,
      'new_execution_revision',v_exec.revision,
      'plan_preserved',true,
      'execution_cleared',true
    )
  );

  insert into public.riggo_move_audit(move_id,action,actor,revision,details)
  values(p_move_id,'EXECUTION_RESOLVE_C4',v_actor,v_master_rev,jsonb_build_object('source','reset_12_3_6'));

  v_result := jsonb_build_object(
    'ok',true,
    'move_id',p_move_id,
    'status','ready',
    'master_revision',v_master_rev,
    'execution_revision',v_exec.revision,
    'execution_payload',v_exec.payload,
    'updated_at',v_exec.updated_at,
    'updated_by',v_actor
  );

  insert into public.riggo_operations(operation_id,actor,operation,move_id,result)
  values(p_operation_id,v_actor,'RESET_TO_READY_12_3_6',p_move_id,v_result)
  on conflict(operation_id) do nothing;

  return v_result;
exception when others then
  return jsonb_build_object('ok',false,'code','server_error','message',sqlerrm);
end $$;

revoke all on function public.riggo_reset_move_to_ready_v1(uuid,bigint,bigint,uuid) from public,anon;
grant execute on function public.riggo_reset_move_to_ready_v1(uuid,bigint,bigint,uuid) to authenticated;

-- Existing (never-reset) Moves keep using their proven save RPC. Only reset runs
-- require the new wrapper. Old tabs cannot merge stale execution into a new run.
create or replace function public.riggo_execution_run_guard_1236()
returns trigger language plpgsql set search_path=public as $$
begin
  if coalesce(current_setting('riggo.atomic_reset',true),'')='1' then return new; end if;
  if coalesce(current_setting('riggo.atomic_activation',true),'')='1' then
    if old.payload ? '_riggoRunId' then
      new.payload:=new.payload||jsonb_build_object('_riggoRunId',gen_random_uuid()::text);
    end if;
    return new;
  end if;
  if old.payload ? '_riggoRunId' and (
    new.payload->>'_riggoRunId' is distinct from old.payload->>'_riggoRunId'
    or coalesce(current_setting('riggo.execution_run_verified',true),'')<>old.payload->>'_riggoRunId'
  ) then
    raise exception 'stale_execution_run: actualiza RigGO antes de guardar esta Move reiniciada';
  end if;
  return new;
end $$;
drop trigger if exists trg_riggo_execution_run_guard_1236 on public.riggo_execution_state;
create trigger trg_riggo_execution_run_guard_1236 before update on public.riggo_execution_state
for each row execute function public.riggo_execution_run_guard_1236();

create or replace function public.riggo_execution_save_v3(
 p_move_id uuid,p_payload jsonb,p_expected_revision bigint,p_operation_id uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_run text; v_actor citext:=public.current_email(); v_result jsonb;
begin
 if v_actor is null or not public.riggo_user_active(v_actor) or not (
   public.riggo_can_execute_move(v_actor,p_move_id) or public.has_permission('admin') or public.has_permission('plan')
 ) then return jsonb_build_object('ok',false,'code','save_forbidden'); end if;
 -- Use the same lock order as activation/reset: master, then execution.
 perform 1 from public.moves where id=p_move_id for update;
 select payload->>'_riggoRunId' into v_run from public.riggo_execution_state where move_id=p_move_id for update;
 if v_run is distinct from p_payload->>'_riggoRunId' then
   return jsonb_build_object('ok',false,'code','revision_conflict','message','La Move fue reiniciada. Actualiza su ejecución.');
 end if;
 perform set_config('riggo.execution_run_verified',coalesce(v_run,''),true);
 v_result:=public.riggo_execution_save_v2(p_move_id,p_payload,p_expected_revision,p_operation_id);
 perform set_config('riggo.execution_run_verified','',true);
 return v_result;
end $$;
revoke all on function public.riggo_execution_save_v3(uuid,jsonb,bigint,uuid) from public,anon;
grant execute on function public.riggo_execution_save_v3(uuid,jsonb,bigint,uuid) to authenticated;

create or replace function public.riggo_complete_move_v3(
 p_move_id uuid,p_actual_acceptance timestamptz,p_expected_master_revision bigint,
 p_expected_execution_revision bigint,p_execution_payload jsonb,p_closeout_lessons text,p_operation_id uuid
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_run text; v_actor citext:=public.current_email(); v_result jsonb;
begin
 if v_actor is null or not public.riggo_user_active(v_actor) or not (
   public.riggo_can_execute_move(v_actor,p_move_id) or public.has_permission('admin') or public.has_permission('plan')
 ) then return jsonb_build_object('ok',false,'code','complete_forbidden'); end if;
 perform 1 from public.moves where id=p_move_id for update;
 select payload->>'_riggoRunId' into v_run from public.riggo_execution_state where move_id=p_move_id for update;
 if v_run is distinct from p_execution_payload->>'_riggoRunId' then
   return jsonb_build_object('ok',false,'code','execution_revision_conflict','message','La Move fue reiniciada. Actualiza su ejecución.');
 end if;
 perform set_config('riggo.execution_run_verified',coalesce(v_run,''),true);
 v_result:=public.riggo_complete_move_v2(p_move_id,p_actual_acceptance,p_expected_master_revision,p_expected_execution_revision,p_execution_payload,p_closeout_lessons,p_operation_id);
 perform set_config('riggo.execution_run_verified','',true);
 return v_result;
end $$;
revoke all on function public.riggo_complete_move_v3(uuid,timestamptz,bigint,bigint,jsonb,text,uuid) from public,anon;
grant execute on function public.riggo_complete_move_v3(uuid,timestamptz,bigint,bigint,jsonb,text,uuid) to authenticated;


commit;

-- Read-only install check.
select
  to_regprocedure('public.riggo_reset_move_to_ready_v1(uuid,bigint,bigint,uuid)') is not null as reset_rpc_installed,
  to_regprocedure('public.riggo_execution_save_v3(uuid,jsonb,bigint,uuid)') is not null as run_save_installed,
  to_regprocedure('public.riggo_complete_move_v3(uuid,timestamptz,bigint,bigint,jsonb,text,uuid)') is not null as run_completion_installed,
  pg_get_functiondef('public.riggo_strip_master_execution()'::regprocedure) like '%riggo.atomic_reset%' as trigger_reset_gate_installed;
