#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-100}

# create group if missing
if ! grep -q ":${PGID}:" /etc/group; then
  addgroup -g "${PGID}" appgroup || true
fi

# create user if missing
if ! id -u appuser >/dev/null 2>&1; then
  adduser -D -u "${PUID}" -G appgroup -h /home/appuser appuser || true
fi

# ensure directories exist and are owned by appuser
mkdir -p /app/data /app/config /app/logs
chown -R appuser:appgroup /app /app/data /app/config /app/logs || true

# if no command provided, run node
if [ "$#" -eq 0 ]; then
  set -- node dist/main.js
fi

# drop privileges and run
exec su-exec appuser "$@"
