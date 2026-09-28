# Review — `02_CANDIDATE_COMPAT_HOTFIX_REVIEW_FIRST.sql`

## Veredicto técnico

La hipótesis y la modificación central del candidate son correctas: la identidad de la corrida debe depender de `_riggoRunId`, no de qué wrapper RPC estableció una GUC de sesión.

El candidate corrige el falso `stale_execution_run` porque elimina del guard la condición adicional `riggo.execution_run_verified` y conserva el bloqueo cuando el token nuevo es missing/different frente al token autoritativo.

## Lo que se conserva del candidate

- `riggo.atomic_reset` continúa permitiendo el Reset transaccional.
- `riggo.atomic_activation` continúa siendo la única excepción normal que puede rotar el token.
- Activation genera el token nuevo en servidor con `gen_random_uuid()` si la fila previa ya pertenece a una corrida tokenizada.
- Escrituras ordinarias con token distinto/faltante se bloquean.

## Por qué no se ejecuta el candidate tal cual

No se ejecutó. El SQL final `02_RigGO_12_3_7_STALE_RUN_COMPAT_HOTFIX.sql` mantiene la misma corrección semántica, pero añade un preflight fail-closed antes del `CREATE OR REPLACE FUNCTION`:

- exige v2 y v3;
- exige Reset y Activation;
- comprueba que Reset todavía exponga `riggo.atomic_reset`;
- comprueba que Activation todavía exponga `riggo.atomic_activation`;
- comprueba que el trigger esperado siga apuntando al guard esperado.

Si producción divergió del handover, el script final aborta sin reemplazar la función.

## Lo que el candidate no resuelve por sí solo

El error original tiene también implicaciones de cliente. Por eso 12.3.7 añade en C4:

- reconocimiento de stale en `response.error` y `data.code`;
- detección independiente del `_riggoRunId` del outbox durante hydrate;
- descarte/adopción Server Truth para outbox de otra corrida;
- prohibición de merge entre corridas.

El candidate se conserva únicamente en `baseline/handover/` como evidencia revisada y está nombrado `DO_NOT_RUN_BLINDLY`.
