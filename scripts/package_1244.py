#!/usr/bin/env python3
import hashlib,json,re,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
site=root/'site'
pattern=re.compile(r'^(riggo-[^.]+)\.(?:[a-f0-9]{12}|pending)\.(js|css)$')
for _ in range(10):
    mapping={}
    for p in sorted((site/'assets').glob('riggo-*')):
        match=pattern.match(p.name)
        if not match:continue
        digest=hashlib.sha256(p.read_bytes()).hexdigest()[:12]
        name=f'{match[1]}.{digest}.{match[2]}'
        if name!=p.name:mapping[p.name]=name
    if not mapping:break
    for old,new in mapping.items():(site/'assets'/old).rename(site/'assets'/new)
    for p in site.rglob('*'):
        if not p.is_file() or 'vendor' in p.parts:continue
        if p.suffix not in ['.js','.css','.html','.json','.webmanifest'] and p.name!='_headers':continue
        text=p.read_text()
        for old,new in mapping.items():text=text.replace(old,new)
        p.write_text(text)
else:raise RuntimeError('Asset references did not stabilize')
for p in (site/'assets').glob('riggo-*'):
    match=pattern.match(p.name)
    if match:assert p.name.split('.')[-2]==hashlib.sha256(p.read_bytes()).hexdigest()[:12],p.name
for name in ['index.html','sw.js','version.json','_headers']:
    text=(site/name).read_text()
    for ref in re.findall(r'(?:\./)?assets/[A-Za-z0-9_./-]+',text):
        if ref.endswith('/'):continue
        assert (site/ref.removeprefix('./')).is_file(),(name,ref)
manifest=''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(site).as_posix()+'\n' for p in sorted(site.rglob('*')) if p.is_file())
(root/'SITE_SHA256SUMS.txt').write_text(manifest)
output=root/'downloads'/'RigGO_12_4_4_CLOUDFLARE_READY.zip'
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(site.rglob('*')):
        if p.is_file():
            info=zipfile.ZipInfo(p.relative_to(site).as_posix(),date_time=(2026,10,28,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
with zipfile.ZipFile(output) as z:
    assert z.testzip() is None
    assert 'index.html' in z.namelist() and 'version.json' in z.namelist()
    assert set(z.namelist())=={p.relative_to(site).as_posix() for p in site.rglob('*') if p.is_file()}
digest=hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.zip.sha256').write_text(digest+'  '+output.name+'\n')
validation=json.loads((root/'work/validation-1244.json').read_text())
browser=json.loads((root/'work/browser-validation-1244.json').read_text())
sync=json.loads((root/'work/sync-validation-1244.json').read_text())
upgrade=json.loads((root/'work/upgrade-validation-1244.json').read_text())
assert upgrade['ok'] and upgrade['pending_operations_retained'] and upgrade['evidence_retained']
result={'release':'12.4.4-atomic-closure-sync-c1','unit':validation,'browser':browser,'two_user_sync':sync,'service_worker_upgrade':upgrade,'frontend_checks_passed':validation['passed']+browser['passed']+sync['passed']+1,'playwright':'1.62.1','zip_sha256':digest,'zip_bytes':output.stat().st_size,'site_files':len(manifest.splitlines()),'real_emails_sent':False,'server_maintenance':{'reviewed_master_lifecycles_reconciled':5,'execution_records_preserved':True,'private_backups':True,'broad_trigger_change':False}}
(root/'docs/VALIDATION_RESULTS_12.4.4.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'zip':output.name,'sha256':digest,'bytes':output.stat().st_size,'site_files':len(manifest.splitlines())}))
