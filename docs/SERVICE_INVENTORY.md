# Service inventory

RigGO release 12.4.1 uses a browser client and managed services. This table distinguishes code present in the repository from configuration that must be inspected in the running environment.

| Component | Role | Evidence in this repository | Configuration outside the repository |
| --- | --- | --- | --- |
| Cloudflare | Serves the static website and PWA files. | `site/` contains the release, `_headers`, and Service Worker. | Project ownership, routes, deployment history, access, logs, and rollback settings. |
| Supabase Auth | Signs users in. The client reads approved-user and permission data. | Browser calls and permission names `plan`, `execute`, `overall`, and `admin`. | Identity configuration, user provisioning, and actual authentication policies. |
| Supabase PostgreSQL and RPC | Stores Move plans, execution, daily records, revisions, and server-side operations. | Browser calls and the two historical SQL changes under `db/`. | Complete schema, RLS policies, function owners and grants, backups, and earlier migrations. |
| Supabase Storage | Holds files associated with Moves and reports. | Browser references to the `riggo-files` bucket. | Bucket configuration, access policies, retention, and backup behavior. |
| Supabase Edge Functions | Handles administrative and email requests invoked by the browser. | Calls to `riggo-admin-users` and `riggo-send-email`. | Function source, deployed versions, authorization, logs, and secrets. |
| Email delivery | Sends operational emails through a service described as Resend in the current workflow. | The browser invokes the email function. | Provider account, function implementation, credentials, delivery settings, and logs. |
| GitHub | Stores this release snapshot and documentation. | `site/`, `db/`, `docs/`, and the checksum manifest. | Repository visibility, organizational ownership, access rules, and any future CI/CD pipeline. |

The browser embeds a Supabase project URL and publishable client key. Service credentials and private keys are not supplied by this repository. The original modular frontend source and a reproducible build process are also absent.

This inventory describes the observed release and the service roles reported for the current pilot. It does not establish which frontend build is live or certify the configuration of the managed services.
