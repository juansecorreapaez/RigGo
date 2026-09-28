#!/usr/bin/env python3
"""Verify the deployed-asset snapshot against the original 12.3.7 ZIP."""
import hashlib
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
site = root / "site"
manifest = root / "SITE_SHA256SUMS.txt"
expected = {}
for line in manifest.read_text(encoding="utf-8").splitlines():
    digest, name = line.split("  ", 1)
    expected[name] = digest
actual_names = {p.relative_to(site).as_posix() for p in site.rglob("*") if p.is_file()}
missing = sorted(set(expected) - actual_names)
extra = sorted(actual_names - set(expected))
changed = sorted(
    name for name in set(expected) & actual_names
    if hashlib.sha256((site / name).read_bytes()).hexdigest() != expected[name]
)
print(f"Expected {len(expected)} files; actual {len(actual_names)} files")
print(f"Missing: {missing}; extra: {extra}; changed: {changed}")
sys.exit(1 if missing or extra or changed else 0)
