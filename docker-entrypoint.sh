#!/bin/sh
# Every boot: bring the schema up to date and make sure an admin can log in. Both are
# idempotent, so a restart is never destructive. Seeding catalogue data stays manual.
set -e

echo "› applying schema"
node scripts/push-schema.js

if [ -n "$ADMIN_EMAIL" ]; then
  echo "› ensuring admin account"
  node scripts/ensure-admin.js
fi

echo "› starting server on ${HOST:-0.0.0.0}:${PORT:-3000}"
exec "$@"
