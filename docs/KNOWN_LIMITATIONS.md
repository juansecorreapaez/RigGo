# Known limitations

| Area | Finding | Next step |
| --- | --- | --- |
| Source and build | `site/` is a release snapshot with inline logic and bundled JavaScript. No original modular source, build recipe, lockfile, or automated pipeline is included. | Recover the source project and replace the historical layers with maintained modules; current authorized changes are validated as a release snapshot. |
| Database coverage | Only two historical SQL scripts are present; schema, RLS, grants, Storage policies, and earlier RPC implementations are incomplete here. | Inspect and export the actual service configuration; test direct access with restricted roles. |
| Privileged functions | The 12.3.6 scripts define `SECURITY DEFINER` functions with `search_path=public` and grants to `authenticated`. | Review the effective owner, callable dependencies, name resolution, and permissions in the deployed database. |
| Release identity | The 12.4.2 manifest and version metadata agree; a live deployment has not been verified. | Verify the build and PWA update behavior in the hosting environment. |
| External libraries | 12.4.2 includes exact self-hosted versions and npm integrity provenance. | Keep the verified dependency inventory updated when changing a library. |
| Test coverage | The previous local browser harness used a simulated backend and unavailable fixtures, so it was removed from this repository. A reproducible local regression harness now exercises real scripts with all remote traffic blocked; a live authenticated suite remains absent. | Add tests backed by maintained fixtures and verify a two-browser Reset/Reactivate flow against a controlled environment. |
| Deployment state | The checksum manifest covers local files only. The current live frontend version and its rollout history are not established by this repository. | Compare the deployed build and asset hashes in the hosting environment. |
| External services | Email delivery code, Cloudflare project configuration, backup and monitoring settings are not included. | Record the actual service inventory and recovery procedure. |

| Accessibility coverage | Keyboard, Chromium AX and responsive checks passed for the inspected synthetic states. Native screen readers, physical mobile devices and live permission policies were not tested. | Validate with representative Rig Managers and controlled backend accounts. |
| Immediate correction | Last-event correction is kept in memory for the current session and guarded by period, run and latest history ID. It disappears after reload or a newer event. | Use the established operational review procedure for older history corrections. |
| Remaining density | The first transport action was around 1,092 px from the top in the 390 px confirmation fixture, versus 1,463 px in the previous critique. Plan resources now fit one screen, but transport still requires initial scrolling. | Test the remaining density with field users before another redesign. |
| Offline confirmation | A local record can remain pending until the service confirms it. This release retains the existing queue and does not validate multi-device concurrency against the real server. | Run a controlled offline/reconnect and two-device test before rollout. |
