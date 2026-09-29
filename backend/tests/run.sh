#!/usr/bin/env bash
# Runs migrations, seed and access-rule tests against a throwaway Postgres 16 database.
# Usage: DATABASE_URL=postgres://postgres@localhost:5432/postgres backend/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?Set DATABASE_URL to a Postgres 16 server you can create databases on}"
DB="dsn_talent_test_$$"
psql "$DATABASE_URL" -q -c "create database $DB"
trap 'psql "$DATABASE_URL" -q -c "drop database if exists $DB" >/dev/null' EXIT
URL="${DATABASE_URL%/*}/$DB"
P="psql $URL -q -v ON_ERROR_STOP=1"
$P -f tests/supabase_stubs.sql
for f in supabase/migrations/*.sql; do echo "migrate $f"; $P -f "$f"; done
$P -f supabase/seed.sql
$P -f tests/access_rules_test.sql
echo "All database checks passed."
