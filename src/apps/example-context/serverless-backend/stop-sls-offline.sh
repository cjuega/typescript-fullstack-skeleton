#!/usr/bin/env bash

descendent_pids() {
    pids=$(pgrep -P $1)
    echo $pids
    for pid in $pids; do
        descendent_pids $pid
    done
}

if [ -f .tmp/.offline.pid ]; then

  PID=$(cat .tmp/.offline.pid)
  kill $(descendent_pids $PID) $PID

  rm -f .tmp/.offline.pid
fi
