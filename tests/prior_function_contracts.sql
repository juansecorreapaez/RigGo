-- TEST FIXTURE ONLY. Do not execute against production.

create or replace function public.riggo_execution_from_plan_v1(
  p_move_id uuid,
  p_actual_release timestamptz
) returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_plan jsonb;
  v_rd jsonb := '[]'::jsonb;
  v_ru jsonb := '[]'::jsonb;
  v_loads jsonb := '[]'::jsonb;
  v_g jsonb;
  v_qty integer;
  v_i integer;
  v_gi integer := 0;
  v_desc text;
  v_release text;
begin
  select coalesce(m.settings #> '{riggo_payload,plan}','{}'::jsonb)
    into v_plan
  from public.moves m
  where m.id=p_move_id;

  if not found then raise exception 'Move no encontrada'; end if;
  if coalesce((v_plan->>'loaded')::boolean,false) is not true then
    raise exception 'La Move no tiene un Plan importado en servidor';
  end if;

  select coalesce(jsonb_agg(
    (x.value - 'doneAt' - 'doneBy') || jsonb_build_object('doneAt',null,'doneBy','')
    order by x.ord
  ),'[]'::jsonb)
  into v_rd
  from jsonb_array_elements(coalesce(v_plan->'tasksRD','[]'::jsonb)) with ordinality x(value,ord);

  select coalesce(jsonb_agg(
    (x.value - 'doneAt' - 'doneBy') || jsonb_build_object('doneAt',null,'doneBy','')
    order by x.ord
  ),'[]'::jsonb)
  into v_ru
  from jsonb_array_elements(coalesce(v_plan->'tasksRU','[]'::jsonb)) with ordinality x(value,ord);

  for v_g in select value from jsonb_array_elements(coalesce(v_plan->'loadGroups','[]'::jsonb)) loop
    v_gi := v_gi + 1;
    v_qty := greatest(1,coalesce(nullif(v_g->>'quantity','')::integer,1));
    v_desc := coalesce(nullif(trim(v_g->>'description'),''),'Carga '||v_gi::text);
    for v_i in 1..v_qty loop
      v_loads := v_loads || jsonb_build_array(jsonb_build_object(
        'id',p_move_id::text||'-L'||v_gi::text||'-'||v_i::text,
        'plannedDay',greatest(1,coalesce(nullif(v_g->>'day','')::integer,1)),
        'scope',coalesce(nullif(v_g->>'scope',''),'Rig'),
        'description',v_desc || case when v_qty>1 then ' · '||v_i::text||'/'||v_qty::text else '' end,
        'vehicle',coalesce(v_g->>'vehicle',''),
        'loadedAt',null,'transitAt',null,'positionedAt',null,'history','[]'::jsonb
      ));
    end loop;
  end loop;

  v_release := to_char(p_actual_release at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  return jsonb_build_object(
    'actualRelease',v_release,
    'tasksRD',v_rd,
    'tasksRU',v_ru,
    'loads',v_loads,
    'closures','{}'::jsonb,
    'periods','[]'::jsonb,
    'selectedPeriodId',null,
    'actualAcceptance','',
    'cutoffs','{}'::jsonb,
    'cutoffAudit','{}'::jsonb,
    'forcedThroughDay',0,
    'moveClosedAt',''
  );
end $$;

create or replace function public.riggo_activate_move_v2(
  p_move_id uuid,
  p_actual_release timestamptz,
  p_expected_revision bigint,
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
  v_exec_rev bigint;
begin
  if v_actor is null or not public.riggo_user_active(v_actor) then
    return jsonb_build_object('ok',false,'code','not_authorized','message','Usuario no autorizado.');
  end if;
  if p_operation_id is null or p_actual_release is null then
    return jsonb_build_object('ok',false,'code','invalid_activation','message','Falta operation_id o Actual Rig Release.');
  end if;

  select o.result into v_result from public.riggo_operations o
  where o.operation_id=p_operation_id and o.actor=v_actor;
  if v_result is not null then return v_result; end if;

  select * into v_move from public.moves m where m.id=p_move_id for update;
  if not found or v_move.deleted_at is not null then
    return jsonb_build_object('ok',false,'code','move_not_found','message','Move no encontrada.');
  end if;
  if not public.riggo_can_execute_move(v_actor,p_move_id) then
    return jsonb_build_object('ok',false,'code','activation_forbidden','message','No tienes permiso para iniciar esta Move.');
  end if;

  -- Safe recovery for a duplicate tap/retry after a committed activation.
  if v_move.status='active' then
    select * into v_exec from public.riggo_execution_state e where e.move_id=p_move_id;
    if found then
      return jsonb_build_object('ok',true,'no_change',true,'move_id',p_move_id,
        'status','active','master_revision',v_move.revision,'execution_revision',v_exec.revision,
        'execution_payload',v_exec.payload,'updated_at',v_exec.updated_at,'updated_by',v_exec.updated_by);
    end if;
    return jsonb_build_object('ok',false,'code','missing_execution_state','message','Move ACTIVE sin execution_state. Requiere reparación de integridad.');
  end if;

  if v_move.status<>'ready' then
    return jsonb_build_object('ok',false,'code','not_ready','message','La Move debe estar READY antes de iniciar.');
  end if;
  if coalesce(p_expected_revision,0)<>v_move.revision then
    return jsonb_build_object('ok',false,'code','revision_conflict','server_revision',v_move.revision,'message','La Move cambió antes de iniciar.');
  end if;

  v_payload := public.riggo_execution_from_plan_v1(p_move_id,p_actual_release);
  perform set_config('riggo.atomic_activation','1',true);
  update public.moves m set
    status='active',actual_release=p_actual_release,updated_at=clock_timestamp(),updated_by=v_actor,revision=v_move.revision+1
  where m.id=p_move_id
  returning revision into v_master_rev;

  select * into v_exec from public.riggo_execution_state e where e.move_id=p_move_id for update;
  if found then
    insert into public.riggo_execution_history(move_id,revision,payload,actor,operation_id)
    values(v_exec.move_id,v_exec.revision,v_exec.payload,v_actor,p_operation_id);
    update public.riggo_execution_state e set
      revision=v_exec.revision+1,payload=v_payload,updated_at=clock_timestamp(),updated_by=v_actor
    where e.move_id=p_move_id returning * into v_exec;
  else
    insert into public.riggo_execution_state(move_id,revision,payload,updated_at,updated_by)
    values(p_move_id,1,v_payload,clock_timestamp(),v_actor) returning * into v_exec;
  end if;
  v_exec_rev:=v_exec.revision;

  insert into public.riggo_move_audit(move_id,action,actor,revision,details)
  values(p_move_id,'ACTIVATE_12_1',v_actor,v_master_rev,jsonb_build_object('actual_release',p_actual_release,'execution_revision',v_exec_rev));

  v_result:=jsonb_build_object('ok',true,'move_id',p_move_id,'status','active',
    'master_revision',v_master_rev,'execution_revision',v_exec_rev,'execution_payload',v_exec.payload,
    'updated_at',v_exec.updated_at,'updated_by',v_actor);
  insert into public.riggo_operations(operation_id,actor,operation,move_id,result)
  values(p_operation_id,v_actor,'ACTIVATE_12_1',p_move_id,v_result)
  on conflict(operation_id) do nothing;
  return v_result;
exception when others then
  return jsonb_build_object('ok',false,'code','server_error','message',sqlerrm);
end $$;

create or replace function public.riggo_execution_save_v2(
  p_move_id uuid,p_payload jsonb,p_expected_revision bigint,p_operation_id uuid
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_actor citext := public.current_email();
  v_row public.riggo_execution_state%rowtype;
  v_result jsonb;
  v_status text;
  v_deleted timestamptz;
begin
  if v_actor is null or not public.riggo_user_active(v_actor) then return jsonb_build_object('ok',false,'code','not_authorized'); end if;
  if p_operation_id is null then return jsonb_build_object('ok',false,'code','missing_operation_id'); end if;
  select o.result into v_result from public.riggo_execution_operations o where o.operation_id=p_operation_id and o.actor=v_actor;
  if v_result is not null then return v_result; end if;
  if not (public.riggo_can_execute_move(v_actor,p_move_id) or public.has_permission('admin') or public.has_permission('plan')) then
    return jsonb_build_object('ok',false,'code','save_forbidden','message','No tienes permiso para actualizar esta ejecución.');
  end if;
  select m.status,m.deleted_at into v_status,v_deleted from public.moves m where m.id=p_move_id;
  if not found or v_deleted is not null then return jsonb_build_object('ok',false,'code','move_not_found'); end if;
  if v_status not in ('active','completed') then return jsonb_build_object('ok',false,'code','not_active','message','La ejecución solo puede modificarse en una Move iniciada.'); end if;

  select * into v_row from public.riggo_execution_state e where e.move_id=p_move_id for update;
  if not found then return jsonb_build_object('ok',false,'code','missing_execution_state','message','Execution state ausente. No se creará desde un navegador.'); end if;
  if coalesce(p_expected_revision,0)<>v_row.revision then
    return jsonb_build_object('ok',false,'code','revision_conflict','server_revision',v_row.revision,'updated_at',v_row.updated_at,'updated_by',v_row.updated_by);
  end if;

  if coalesce(p_payload,'{}'::jsonb)=v_row.payload then
    v_result:=jsonb_build_object('ok',true,'no_change',true,'move_id',p_move_id,'revision',v_row.revision,'updated_at',v_row.updated_at,'updated_by',v_row.updated_by);
    insert into public.riggo_execution_operations(operation_id,move_id,actor,result)
      values(p_operation_id,p_move_id,v_actor,v_result) on conflict(operation_id) do nothing;
    return v_result;
  end if;

  insert into public.riggo_execution_history(move_id,revision,payload,actor,operation_id)
  values(v_row.move_id,v_row.revision,v_row.payload,v_actor,p_operation_id);
  update public.riggo_execution_state e set
    revision=v_row.revision+1,payload=coalesce(p_payload,'{}'::jsonb),updated_at=clock_timestamp(),updated_by=v_actor
  where e.move_id=p_move_id returning * into v_row;
  v_result:=jsonb_build_object('ok',true,'no_change',false,'move_id',p_move_id,'revision',v_row.revision,'updated_at',v_row.updated_at,'updated_by',v_actor);
  insert into public.riggo_execution_operations(operation_id,move_id,actor,result)
    values(p_operation_id,p_move_id,v_actor,v_result) on conflict(operation_id) do nothing;
  return v_result;
end $$;

create or replace function public.riggo_complete_move_v2(
  p_move_id uuid,
  p_actual_acceptance timestamptz,
  p_expected_master_revision bigint,
  p_expected_execution_revision bigint,
  p_execution_payload jsonb,
  p_closeout_lessons text,
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
  v_completed_at timestamptz := clock_timestamp();
begin
  if v_actor is null or not public.riggo_user_active(v_actor) then
    return jsonb_build_object('ok',false,'code','not_authorized','message','Usuario no autorizado.');
  end if;
  if p_operation_id is null or p_actual_acceptance is null or p_execution_payload is null then
    return jsonb_build_object('ok',false,'code','invalid_completion','message','Faltan datos para cerrar la Move.');
  end if;

  select o.result into v_result from public.riggo_operations o
  where o.operation_id=p_operation_id and o.actor=v_actor;
  if v_result is not null then return v_result; end if;

  select * into v_move from public.moves m where m.id=p_move_id for update;
  if not found or v_move.deleted_at is not null then
    return jsonb_build_object('ok',false,'code','move_not_found','message','Move no encontrada.');
  end if;
  if not (public.riggo_can_execute_move(v_actor,p_move_id) or public.has_permission('admin') or public.has_permission('plan')) then
    return jsonb_build_object('ok',false,'code','completion_forbidden','message','No tienes permiso para cerrar esta Move.');
  end if;

  select * into v_exec from public.riggo_execution_state e where e.move_id=p_move_id for update;
  if not found then
    return jsonb_build_object('ok',false,'code','missing_execution_state','message','Move sin execution_state autoritativo.');
  end if;

  if v_move.status='completed' then
    return jsonb_build_object('ok',true,'no_change',true,'move_id',p_move_id,'status','completed',
      'master_revision',v_move.revision,'execution_revision',v_exec.revision,'execution_payload',v_exec.payload,
      'completed_at',v_move.actual_acceptance,'updated_at',v_exec.updated_at,'updated_by',v_exec.updated_by);
  end if;
  if v_move.status<>'active' then
    return jsonb_build_object('ok',false,'code','not_active','message','La Move debe estar ACTIVE para cerrarse.');
  end if;
  if v_move.actual_release is null or p_actual_acceptance < v_move.actual_release then
    return jsonb_build_object('ok',false,'code','invalid_acceptance','message','Actual Rig Acceptance no puede ser anterior al Actual Rig Release.');
  end if;
  if coalesce(p_expected_master_revision,0)<>v_move.revision then
    return jsonb_build_object('ok',false,'code','master_revision_conflict','server_revision',v_move.revision,'message','La Move cambió antes del cierre.');
  end if;
  if coalesce(p_expected_execution_revision,0)<>v_exec.revision then
    return jsonb_build_object('ok',false,'code','execution_revision_conflict','server_revision',v_exec.revision,'message','La ejecución cambió antes del cierre.');
  end if;

  -- The server stamps lifecycle fields; the client cannot forge them.
  v_payload := coalesce(p_execution_payload,'{}'::jsonb)
    || jsonb_build_object(
      'actualRelease',coalesce(v_exec.payload->>'actualRelease',to_char(v_move.actual_release at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
      'actualAcceptance',to_char(p_actual_acceptance at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'moveClosedAt',to_char(v_completed_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    );

  insert into public.riggo_execution_history(move_id,revision,payload,actor,operation_id)
  values(v_exec.move_id,v_exec.revision,v_exec.payload,v_actor,p_operation_id);
  update public.riggo_execution_state e set
    revision=v_exec.revision+1,payload=v_payload,updated_at=v_completed_at,updated_by=v_actor
  where e.move_id=p_move_id returning * into v_exec;

  perform set_config('riggo.atomic_completion','1',true);
  update public.moves m set
    status='completed',actual_acceptance=p_actual_acceptance,
    settings=jsonb_set(coalesce(m.settings,'{}'::jsonb),'{riggo_payload}',
      (coalesce(m.settings->'riggo_payload','{}'::jsonb)-'exec') || jsonb_build_object('closeoutLessons',coalesce(p_closeout_lessons,'')),true),
    updated_at=v_completed_at,updated_by=v_actor,revision=v_move.revision+1
  where m.id=p_move_id returning revision into v_master_rev;

  insert into public.riggo_move_audit(move_id,action,actor,revision,details)
  values(p_move_id,'COMPLETE_12_1',v_actor,v_master_rev,jsonb_build_object(
    'actual_acceptance',p_actual_acceptance,'execution_revision',v_exec.revision,'lessons_length',length(coalesce(p_closeout_lessons,''))));

  v_result:=jsonb_build_object('ok',true,'move_id',p_move_id,'status','completed',
    'master_revision',v_master_rev,'execution_revision',v_exec.revision,'execution_payload',v_exec.payload,
    'completed_at',v_completed_at,'updated_at',v_exec.updated_at,'updated_by',v_actor);
  insert into public.riggo_operations(operation_id,actor,operation,move_id,result)
  values(p_operation_id,v_actor,'COMPLETE_12_1',p_move_id,v_result)
  on conflict(operation_id) do nothing;
  return v_result;
exception when others then
  return jsonb_build_object('ok',false,'code','server_error','message',sqlerrm);
end $$;