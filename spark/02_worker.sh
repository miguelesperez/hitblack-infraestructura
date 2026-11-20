#!/usr/bin/env bash
# Ejecutar en Ubuntu 2: levanta un worker que se une al master de Ubuntu 1.
#   bash 02_worker.sh IP_DEL_MASTER [WORKER_MEMORY] [WORKER_CORES]
set -euo pipefail
cd "$(dirname "$0")"
MASTER="${1:?Uso: bash 02_worker.sh IP_DEL_MASTER [memoria] [núcleos]}"
IP=$(ip -4 addr show eth1 | awk '/inet /{print $2}' | cut -d/ -f1 | head -1)
[ -n "$IP" ] || { echo "No se encontró la IP de eth1 (red 192.168.100.x)"; exit 1; }
export SPARK_MASTER_IP="$MASTER" SPARK_LOCAL_IP="$IP" WORKER_MEMORY="${2:-1g}" WORKER_CORES="${3:-1}"
printf "SPARK_MASTER_IP=%s\nSPARK_LOCAL_IP=%s\nWORKER_MEMORY=%s\nWORKER_CORES=%s\n" "$MASTER" "$IP" "$WORKER_MEMORY" "$WORKER_CORES" > .env
echo "Worker ($IP) uniéndose a spark://$MASTER:7077"
docker compose up -d --build worker
docker compose ps
