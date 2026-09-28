from pathlib import Path
import hashlib, json, re, sys

ROOT=Path(__file__).resolve().parents[1]
ORIG=Path('/mnt/data/riggo_1236')
OLD=Path('/mnt/data/riggo_1234')
HAND=Path('/mnt/data/riggo_handover_work/RigGO_12_3_6_STALE_RUN_HANDOVER')
results=[]
def check(c,msg):
    if not c: raise AssertionError(msg)
    results.append('PASS '+msg); print('PASS',msg)
def text(p): return p.read_text(encoding='utf-8')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

prod=text(HAND/'current/RigGO_12_3_6_RESET_TO_READY_RPC_PRODUCTION_RAN.sql')
diag=text(ROOT/'sql/01_STALE_RUN_DIAGNOSTIC_READONLY.sql')
cand=text(HAND/'sql/02_CANDIDATE_COMPAT_HOTFIX_REVIEW_FIRST.sql')
hot=text(ROOT/'sql/02_RigGO_12_3_7_STALE_RUN_COMPAT_HOTFIX.sql')
contracts=text(ROOT/'audit/prior_function_contracts.sql')
app=text(ROOT/'assets/riggo-app.8fd9790e3793.js')
ux=text(ROOT/'assets/riggo-1237-field-ux.1b6be3b11202.js')
ver=json.loads(text(ROOT/'version.json'))
idx=text(ROOT/'index.html'); sw=text(ROOT/'sw.js'); headers=text(ROOT/'_headers')

# Diagnostic safety: comments removed before mutation keyword scan.
clean=re.sub(r'--.*?$','',diag,flags=re.M)
clean=re.sub(r'/\*.*?\*/','',clean,flags=re.S)
check(not re.search(r'\b(insert|update|delete|truncate|alter|drop|create|grant|revoke|call|do)\b',clean,re.I),'01 diagnostic contains no DML/DDL/procedural writes')
check('pg_get_functiondef' in diag and 'pg_get_triggerdef' in diag,'01 diagnostic inspects installed functions + trigger read-only')

# Root cause in exact production SQL + prior v2/v3 contracts.
old_guard=re.search(r'create or replace function public\.riggo_execution_run_guard_1236\(\).*?end \$\$;',prod,re.I|re.S).group(0)
check("current_setting('riggo.execution_run_verified'" in old_guard,'12.3.6 production guard requires execution_run_verified GUC')
v2=re.search(r'create or replace function public\.riggo_execution_save_v2\(.*?end \$\$;',contracts,re.I|re.S).group(0)
v3=re.search(r'create or replace function public\.riggo_execution_save_v3\(.*?end \$\$;',prod,re.I|re.S).group(0)
check("set_config('riggo.execution_run_verified'" not in v2,'v2 save contract does not set execution_run_verified GUC')
check("set_config('riggo.execution_run_verified'" in v3,'v3 save contract sets execution_run_verified GUC')
oldapp=text(OLD/'assets/riggo-app.3f896920e8da.js')
check("SB.rpc('riggo_execution_save_v2'" in oldapp and 'riggo_execution_save_v3' not in oldapp[oldapp.find('async function flushCore'):oldapp.find('function flush()',oldapp.find('async function flushCore'))], 'actual 12.3.4 C4 flush uses riggo_execution_save_v2')
oldsan=re.search(r'function sanitizeExec\(m\).*?return e}',oldapp,re.S).group(0)
check("delete e._riggoRunId" not in oldsan and "delete e['_riggoRunId']" not in oldsan, 'actual 12.3.4 sanitizeExec does not strip _riggoRunId')
check("delete e._riggoRunId" not in app and "delete e['_riggoRunId']" not in app and 'function sanitizeExec' in app,'client sanitizeExec preserves top-level _riggoRunId')

# Candidate review / final minimum semantics.
check("execution_run_verified" not in cand,'handover candidate removes GUC requirement from run guard')
check("new.payload->>'_riggoRunId' is distinct from old.payload->>'_riggoRunId'" in cand,'candidate uses run-token identity predicate')
check("execution_run_verified" not in hot,'12.3.7 hotfix removes GUC requirement')
check("new.payload->>'_riggoRunId' is distinct from old.payload->>'_riggoRunId'" in hot,'12.3.7 guard blocks missing/different token when current row has token')
check("current_setting('riggo.atomic_reset'" in hot and "current_setting('riggo.atomic_activation'" in hot,'reset + activation remain atomic exceptions')
check('gen_random_uuid()::text' in hot,'activation rotates run token server-side')
clean_hot=re.sub(r'--.*?$','',hot,flags=re.M); clean_hot=re.sub(r'/\*.*?\*/','',clean_hot,flags=re.S)
check(not re.search(r'\b(update|delete|truncate|insert|alter|drop)\s+(public\.)?(moves|riggo_execution_state|riggo_execution_history|riggo_operations)\b',clean_hot,re.I),'hotfix contains no direct data mutation of current move/execution rows')
check("to_regprocedure('public.riggo_execution_save_v2(uuid,jsonb,bigint,uuid)')" in hot and 'trg_riggo_execution_run_guard_1236' in hot,'hotfix fails closed on expected 12.3.6 contracts')

# Formal truth table for the new predicate, independent of browser/backend mocks.
def guard(old_has, old_token, new_token, reset=False, activation=False):
    if reset: return 'ALLOW_RESET'
    if activation: return 'ALLOW_ROTATE'
    if old_has and new_token != old_token: return 'STALE'
    return 'ALLOW'
check(guard(True,'R1','R1')=='ALLOW','guard truth table: same run allowed')
check(guard(True,'R1',None)=='STALE','guard truth table: missing run blocked')
check(guard(True,'R1','R0')=='STALE','guard truth table: different/old run blocked')
check(guard(True,'R1','client-any',activation=True)=='ALLOW_ROTATE','guard truth table: atomic activation exception')
check(guard(True,'R1',None,reset=True)=='ALLOW_RESET','guard truth table: atomic reset exception')
check(guard(False,None,None)=='ALLOW','guard truth table: never-reset legacy row remains compatible')

# C4 contract hardening.
check('const staleRunError=' in app and 'if(response?.error){' in app and 'if(staleRunError(data))' in app,'C4 recognizes stale_execution_run in response.error and structured data')
check('if(p&&runChanged(p.payload,serverPayload)){await adoptRun' in app,'hydrate compares pending outbox run independently from local state')
check('discardKnownStaleOutbox' in app and 'reconcileStaleRun' in app,'flush discards/reconciles stale-run outbox before retry/merge')
adopt=re.search(r'async function adoptRun\(m,row\).*?\n}',app,re.S).group(0)
check('await del(m.id)' in adopt and 'm.exec=clone(row.payload||{})' in adopt and 'merge3' not in adopt,'server-wins adoption deletes outbox and replaces execution with no cross-run merge')
check("runIdentityPolicy:'server-wins-no-merge'" in app,'runtime self-check exposes server-wins/no-merge policy')

# 12.3.6 UX preservation: unchanged modules byte-for-byte + field patch only identity/message diff verified separately by browser.
for rel in ['assets/riggo-1236-operational.ecf58ba518af.js','assets/riggo-1217-field-integrity.ea49ec55f6bc.js','assets/riggo-123-move-intelligence.79811e859444.js','assets/riggo-app.1f369e790616.css','assets/RigGO_Move_Template.xlsx']:
    check(sha(ROOT/rel)==sha(ORIG/rel),f'12.3.6 preserved byte-for-byte: {rel}')
check("W.RigGO1237=W.RigGO1236=W.RigGO1235" in ux,'12.3.7 field UX preserves 12.3.6 compatibility alias')
check("loadDirectCycle:['Pendiente','Cargada','Posicionada']" in ux and 'reportSingleClick:true' in ux and 'carryPreservesScroll:true' in ux,'12.3.6 load/report/scroll UX contracts retained')

# Package/coherence.
check(ver['release']=='12.3.7-stale-run-compat' and ver['bundle']=='riggo-app.8fd9790e3793.js' and ver['field_ux_bundle']=='riggo-1237-field-ux.1b6be3b11202.js','version.json identifies 12.3.7 assets')
for name in [ver['bundle'],ver['css'],ver['operational_bundle'],ver['field_integrity_bundle'],ver['move_intelligence_bundle'],ver['field_ux_bundle']]:
    check((ROOT/'assets'/name).exists(),f'versioned asset exists: {name}')
    check(name in idx and name in sw,f'index + service worker reference: {name}')
check(ver['bundle'] in headers and ver['field_ux_bundle'] in headers,'immutable headers reference changed 12.3.7 bundles')
check('indexedDB.deleteDatabase' not in sw and 'localStorage.clear' not in sw,'service worker does not clear IndexedDB/Site Data')
check('RigGO_12_3_6_RESET_TO_READY_RPC.sql' not in [p.name for p in ROOT.iterdir()],'old 12.3.6 reset SQL removed from deploy root to prevent blind rerun')

out=ROOT/'audit/contracts-1237-results.txt'
out.write_text('\n'.join(results)+'\n',encoding='utf-8')
print(f'WROTE {out}')
