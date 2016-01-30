#!/bin/bash

echo "** armchair: spinning up"

command="$1"

if [ x"$command" = x"uwsgi" ]; then
    mkdir -p /data/cache /data/locks
    cd /app/limaproxy &&
        gunicorn -k eventlet -w 2 -b 0.0.0.0:8081 config:application
    while true; do
        echo "** uwsgi has quit: sleep 30 **"
        sleep 30
    done
fi

echo "executing: $*"
exec $*
