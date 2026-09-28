# Database changes

`db/` contains **SQL scripts**, not a database file, database backup, full schema, or setup procedure. The application uses a hosted Supabase PostgreSQL database. These files record changes associated with releases 12.3.6 and 12.3.7; they are separate from the static files in `site/`.

| File | What it does |
| --- | --- |
| `12.3.6_reset_baseline_APPLIED_DO_NOT_RERUN.sql` | Adds the Reset-to-Ready RPC, lifecycle/run guards, v3 save and completion wrappers, and function grants. The Reset RPC can clear execution-related records for an authorized active Move when invoked. |
| `12.3.7_stale_run_compat_hotfix_APPLIED.sql` | Replaces the run guard so a save with the current `_riggoRunId` can proceed through the usual permission and revision checks; missing or different run IDs remain blocked. It does not update existing Move or execution rows. |

The filenames indicate that these changes were reported as applied to production. This repository cannot independently prove the current database state. **Do not execute either file as a fresh install, deploy step, or routine reapply.** The 12.3.6 file drops and recreates triggers and changes lifecycle functions; it is especially unsuitable for blind reruns.

For a different environment, first inspect its schema, existing functions, triggers, grants, and migration history. Create and review an environment-specific migration. The 12.3.7 file includes a preflight that requires the expected earlier functions and trigger; its header also refers to a read-only diagnostic that is not included here.

These scripts do not include all tables, RLS policies, Storage policies, or earlier function definitions. See [data and security](../docs/DATA_AND_TRUST.md).
