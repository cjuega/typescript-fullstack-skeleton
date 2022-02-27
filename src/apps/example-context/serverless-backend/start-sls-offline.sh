#!/usr/bin/env bash

if [ -f .tmp/.offline.log ]; then
  rm -f .tmp/.offline.log
fi

mkdir -p .tmp

TMPFILE=.tmp/.offline.log
touch $TMPFILE

if [ -f .tmp/.offline.pid ]; then
  echo "Found file .tmp/.offline.pid. Not starting."
  exit 1
fi

# start up serverless
# $! is the pid of the last program your shell ran in the background
yarn dev &> $TMPFILE &
PID=$!

echo $PID > .tmp/.offline.pid

while ! grep "Enter \"rp\" to replay the last request" $TMPFILE
do
  sleep 1;
done

rm -f $TMPFILE
