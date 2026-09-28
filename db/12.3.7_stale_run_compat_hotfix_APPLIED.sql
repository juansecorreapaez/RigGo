-- RigGO 12.3.7 · stale_execution_run compatibility hotfix
-- MINIMAL SERVER PATCH. Review 01_STALE_RUN_DIAGNOSTIC_READONLY.sql output first.
-- This script does NOT reset a Move, does NOT delete execution state, does NOT
-- clear history, and does NOT modify any current payload.
--
-- Invariant after this patch:
--   * existing row has no _riggoRunId -> legacy/never-reset behavior remains unchanged;
--   * same _riggoRunId -> ordinary save is allowed to proceed through existing
--     permissions/CAS/RPC rules, whether caller is v2 or v3;
--   * missing/different _riggoRunId -> trigger raises stale_execution_run;
--   * riggo.atomic_reset=1 -> reset RPC may establish the reset baseline token;
--   * riggo.atomic_activation=1 -> activation rotates token atomically;
--   * COMPLETED lifecycle semantics remain owned by the existing lifecycle trigger/RPCs.

begin;

-- Fail closed if production no longer matches the 12.3.6 contract family.
do $$
begin
  if to_regprocedure('public.riggo_execution_run_guard_1236()') is null then
    raise exception 'RigGO 12.3.7 preflight: riggo_execution_run_guard_1236() missing';
  end if;
  if to_regprocedure('public.riggo_execution_save_v2(uuid,jsonb,bigint,uuid)') is null then
    raise exception 'RigGO 12.3.7 preflight: riggo_execution_save_v2 missing';
  end if;
  if to_regprocedure('public.riggo_execution_save_v3(uuid,jsonb,bigint,uuid)') is null then
    raise exception 'RigGO 12.3.7 preflight: riggo_execution_save_v3 missing';
  end if;
  if to_regprocedure('public.riggo_reset_move_to_ready_v1(uuid,bigint,bigint,uuid)') is null then
    raise exception 'RigGO 12.3.7 preflight: reset RPC missing';
  end if;
  if to_regprocedure('public.riggo_activate_move_v2(uuid,timestamptz,bigint,uuid)') is null then
    raise exception 'RigGO 12.3.7 preflight: activation RPC missing';
  end if;
  if position('riggo.atomic_reset' in pg_get_functiondef('public.riggo_reset_move_to_ready_v1(uuid,bigint,bigint,uuid)'::regprocedure))=0 then
    raise exception 'RigGO 12.3.7 preflight: reset RPC no longer exposes atomic_reset contract';
  end if;
  if position('riggo.atomic_activation' in pg_get_functiondef('public.riggo_activate_move_v2(uuid,timestamptz,bigint,uuid)'::regprocedure))=0 then
    raise exception 'RigGO 12.3.7 preflight: activation RPC no longer exposes atomic_activation contract';
  end if;
  if not exists (
    select 1
    from pg_trigger t
    where t.tgrelid='public.riggo_execution_state'::regclass
      and t.tgname='trg_riggo_execution_run_guard_1236'
      and t.tgfoid='public.riggo_execution_run_guard_1236()'::regprocedure
      and not t.tgisinternal
  ) then
    raise exception 'RigGO 12.3.7 preflight: run guard trigger missing or points to another function';
  end if;
end $$;

create or replace function public.riggo_execution_run_guard_1236()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  -- Atomic reset owns the READY baseline and its run token.
  if coalesce(current_setting('riggo.atomic_reset',true),'')='1' then
    return new;
  end if;

  -- Atomic activation is the only normal lifecycle path allowed to rotate the
  -- token. If the previous baseline had a token, generate the new run ID on
  -- the server; never trust a client-provided token for a new run.
  if coalesce(current_setting('riggo.atomic_activation',true),'')='1' then
    if old.payload ? '_riggoRunId' then
      new.payload := new.payload || jsonb_build_object('_riggoRunId',gen_random_uuid()::text);
    end if;
    return new;
  end if;

  -- Compatibility-safe guard. Token identity, not RPC wrapper identity, defines
  -- whether this write belongs to the current execution run.
  if old.payload ? '_riggoRunId'
     and new.payload->>'_riggoRunId' is distinct from old.payload->>'_riggoRunId' then
    raise exception 'stale_execution_run: actualiza RigGO antes de guardar esta Move reiniciada';
  end if;

  return new;
end $$;

comment on function public.riggo_execution_run_guard_1236() is
'RigGO 12.3.7: same _riggoRunId allowed across v2/v3; missing/different token blocked; atomic reset/activation remain exceptions.';

commit;

-- READ-ONLY post-install verification. Save/export these results.
select pg_get_functiondef('public.riggo_execution_run_guard_1236()'::regprocedure) as installed_definition;
select pg_get_triggerdef(t.oid) as trigger_definition
from pg_trigger t
where t.tgrelid='public.riggo_execution_state'::regclass
  and t.tgname='trg_riggo_execution_run_guard_1236'
  and not t.tgisinternal;
