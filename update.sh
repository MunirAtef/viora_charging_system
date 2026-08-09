#!/bin/sh
# Pull the latest code and roll the containers forward.
#   ./update.sh
# First time on a fresh VPS:
#   git clone https://github.com/MunirAtef/viora_charging_system.git
#
# Schema changes and the admin account are applied by the app's entrypoint on boot, so there is
# nothing to run by hand after this. Catalogue seeding stays manual on purpose.
set -eu

cd "$(dirname "$0")"

[ -d .git ] || {
	echo "not a git checkout — clone it first:"
	echo "  git clone https://github.com/MunirAtef/viora_charging_system.git"
	exit 1
}
[ -f .env ] || {
	echo ".env is missing — copy .env.example and fill it in before deploying"
	exit 1
}

before=$(git rev-parse HEAD)

echo "› pulling"
# --ff-only: a dirty or diverged checkout fails loudly here instead of half-deploying
git pull --ff-only

if [ "$before" = "$(git rev-parse HEAD)" ]; then
	echo "  already up to date — rebuilding anyway in case .env or images changed"
else
	git --no-pager log --oneline "$before"..HEAD
fi

echo "› rebuilding and restarting"
podman compose up -d --build

echo "› waiting for the app"
i=0
until curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-3000}/"; do
	i=$((i + 1))
	[ "$i" -lt 30 ] || {
		echo "app did not come up — podman compose logs app"
		exit 1
	}
	sleep 2
done

# images from previous builds pile up fast on a small VPS
podman image prune -f >/dev/null

echo "✓ deployed $(git rev-parse --short HEAD)"
