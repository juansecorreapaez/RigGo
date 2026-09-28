# Operations

## Static release

`site/` is the deployable directory for release 12.3.7. It includes `_headers`, `index.html`, assets, `sw.js`, `manifest.webmanifest`, and `version.json`. There is no source build or CI/CD configuration in this repository. A deployment should serve the contents of `site/` at the application origin, preserving file names and cache rules. The existing Cloudflare project settings and deployment history must be checked in that project.

Before using an artifact, run `python3 scripts/verify_snapshot.py` from the repository root. The manifest verifies the local release files, not the contents of a remote deployment. Compare the live `version.json` and asset responses with the intended release and verify the actual deployment identifier in the hosting platform. Browser caches and the Service Worker may retain older assets during rollout; test a fresh session and an updating session.

## Database

The SQL in `db/` is a record of earlier changes. Neither file is part of a static deployment or an automatic migration. Changes to an environment require a schema/grant comparison, a reviewed migration, a rollback plan, and verification of the installed function definitions. A static release alone cannot provision Supabase tables, RLS, functions, Storage, or secrets.

## Runtime checks

For a controlled release, verify sign-in and scoped Move access, ordinary save and revision conflict handling, Reset and reactivation, rejection of a stale second browser, Daily report flows, file uploads and downloads, and email delivery where configured. Record the frontend build, database function versions, environment, and results. No live end-to-end results are included here.

## Ownership and recovery

Access to the hosting and Supabase projects, configuration, backups, logs, and recovery procedure is managed outside this repository. The repository does not include a database backup, a complete schema, or infrastructure configuration. Keep it private while access and ownership are established; review who can change the static release and database scripts.
