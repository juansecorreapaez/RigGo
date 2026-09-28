# RigGO

Static web application release **12.3.7** (build `2026-09-26-1237-A1`). The deployable files are in `site/`. This repository captures the released assets and the database change scripts associated with Reset and execution run compatibility.

## Repository map

| Path | Contents |
| --- | --- |
| `site/` | HTML, JavaScript, CSS, images, PWA files, and the Excel template served as static assets. |
| `db/` | Two historical SQL changes. Read [db/README.md](db/README.md) before using them. |
| `docs/` | [Architecture](docs/ARCHITECTURE.md), [data and security](docs/DATA_AND_TRUST.md), [operations](docs/OPERATIONS.md), [known limitations](docs/KNOWN_LIMITATIONS.md), and [release notes](docs/releases/12.3.7.md). |
| `scripts/verify_snapshot.py` | Checks the 31 `site/` files against `SITE_SHA256SUMS.txt`. |

## Verify the release

Run from the repository root with Python 3 and Node.js installed:

```bash
python3 scripts/verify_snapshot.py
node --check site/sw.js
node --check site/assets/riggo-app.8fd9790e3793.js
node --check site/assets/riggo-1236-operational.ecf58ba518af.js
node --check site/assets/riggo-1217-field-integrity.ea49ec55f6bc.js
node --check site/assets/riggo-123-move-intelligence.79811e859444.js
node --check site/assets/riggo-1237-field-ux.1b6be3b11202.js
```

There is no build command or dependency installation: `site/` contains the release files. The checksum manifest records their bytes; it does not establish which version is currently deployed. See [operations](docs/OPERATIONS.md) for deployment boundaries and [known limitations](docs/KNOWN_LIMITATIONS.md) for open issues.
