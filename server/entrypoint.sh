#!/bin/bash

set -e

host="$1"
shift
cmd="$@"

until pg_isready -h "$host" -U "postgres"; do
  >&2 echo "Postgres is unavailable - retrying in 5 seconds"
  sleep 5
done

>&2 echo "Postgres is up - executing command"
exec $cmd
