# Known limitations

| Area | Finding | Next step |
| --- | --- | --- |
| Source and build | `site/` is a release snapshot with inline logic and bundled JavaScript. No original modular source, build recipe, lockfile, or automated pipeline is included. | Recover the source project and document a reproducible build before changing application behavior. |
| Database coverage | Only two historical SQL scripts are present; schema, RLS, grants, Storage policies, and earlier RPC implementations are incomplete here. | Inspect and export the actual service configuration; test direct access with restricted roles. |
| Privileged functions | The 12.3.6 scripts define `SECURITY DEFINER` functions with `search_path=public` and grants to `authenticated`. | Review the effective owner, callable dependencies, name resolution, and permissions in the deployed database. |
| Release identity | `site/manifest.webmanifest` still identifies a 12.3.5 app while `version.json` identifies 12.3.7. | Correct the manifest in a new release and verify PWA update behavior. |
| External libraries | Supabase JS is loaded with a floating `@2` selector; PDF/canvas libraries are CDN dependencies. | Pin exact versions and review integrity and availability as part of the build. |
| Test coverage | The previous local browser harness used a simulated backend and unavailable fixtures, so it was removed from this repository. There is no runnable end-to-end suite here. | Add tests backed by maintained fixtures and verify a two-browser Reset/Reactivate flow against a controlled environment. |
| Deployment state | The checksum manifest covers local files only. The current live frontend version and its rollout history are not established by this repository. | Compare the deployed build and asset hashes in the hosting environment. |
| External services | Email delivery code, Cloudflare project configuration, backup and monitoring settings are not included. | Record the actual service inventory and recovery procedure. |
