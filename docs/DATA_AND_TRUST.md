# Data and security

## Data used by the application

| Resource | Role |
| --- | --- |
| `moves` | Move master record, Plan, status, and revision. |
| `riggo_execution_state` | Current execution payload and revision. |
| `riggo_execution_history` | Execution snapshots and technical history. |
| `riggo_operations`, `riggo_move_audit` | Operation idempotency and lifecycle audit. |
| `daily_periods`, `daily_closures`, `reports`, `riggo_move_reports` | Daily periods, closures, and reports. |
| `access_list`, `move_assignments` | Access metadata and Move assignments read by the client. |
| `riggo-files` | Supabase Storage bucket used for media and generated files. |

This list comes from the release files and the included SQL. It is not a complete schema or a database export.

## Trust boundaries

- Browser state and IndexedDB are local working copies. The server must enforce permissions, row access, and revision checks regardless of UI controls.
- `site/index.html` embeds a Supabase project URL and a **publishable client key** for browser use. A static scan of the included code found no `service_role` key, `sb_secret_` key, or private key. This finding covers only the files in this repository.
- `_riggoRunId` distinguishes execution runs; it is a data integrity token, not a login credential or permission grant.
- The 12.3.6 SQL defines three `SECURITY DEFINER` RPCs and grants execution to `authenticated`. Their authorization logic, `search_path`, and delegated calls need evaluation against the actual database schema and grants.
- UI checks around `access_list` cannot establish effective access. The deployed RLS policies, function grants, Storage policies, and any Edge Functions must be inspected in the Supabase project.

## C4 write contract

1. Read execution through `riggo_execution_read_c4`.
2. Queue work locally with `operation_id` and an expected revision.
3. Save through v3 for a tokenized execution, or the legacy v2 path when applicable.
4. Reconcile revision conflicts. If the execution run changed, discard the old queued item and replace local execution with server state.

The included 12.3.7 guard prevents a missing or different run ID from replacing tokenized execution. Atomic Reset and Activation use server-side exceptions. The separate recovery RPC and all live table/Storage policies are outside the SQL in this repository. A Reset of database execution does not by itself recall previously delivered email or uploaded files.
