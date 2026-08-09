#!/bin/sh
# The app image's entrypoint. It runs inside the container — `podman compose up` invokes it.
# Every boot: bring the schema up to date and make sure an admin can log in. Both are
# idempotent, so a restart is never destructive. Seeding catalogue data stays manual.
set -e

[ -d node_modules ] || {
	echo "this script is the container entrypoint and only works inside the app image."
	echo "to deploy, run:  podman compose up -d --build"
	exit 1
}

# The database may still be starting: compose healthcheck conditions are honoured by some
# compose implementations and ignored by others, so waiting here is what actually holds.
echo "› applying schema"
tries=0
until node scripts/push-schema.js; do
	tries=$((tries + 1))
	[ "$tries" -lt 30 ] || {
		echo "database unreachable after 60s — check DATABASE_URL and the db container"
		exit 1
	}
	echo "  database not ready, retrying in 2s"
	sleep 2
done

if [ -n "$ADMIN_EMAIL" ]; then
	echo "› ensuring admin account"
	node scripts/ensure-admin.js
fi

echo "› starting server on ${HOST:-0.0.0.0}:${PORT:-3000}"
exec "$@"
