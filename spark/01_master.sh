#!/usr/bin/env bash
# Ejecutar en Ubuntu 1: levanta el master y un worker de Spark.
#   bash 01_master.sh [WORKER_MEMORY] [WORKER_CORES]     (por defecto 1g y 1 núcleo)
set -euo pipefail
cd "$(dirname "$0")"
IP=$(ip -4 addr show eth1 | awk '/inet /{print $2}' | cut -d/ -f1 | head -1)
[ -n "$IP" ] || { echo "No se encontró la IP de eth1 (red 192.168.100.x)"; exit 1; }
export SPARK_MASTER_IP="$IP" SPARK_LOCAL_IP="$IP" WORKER_MEMORY="${1:-1g}" WORKER_CORES="${2:-1}"
printf "SPARK_MASTER_IP=%s\nSPARK_LOCAL_IP=%s\nWORKER_MEMORY=%s\nWORKER_CORES=%s\n" "$IP" "$IP" "$WORKER_MEMORY" "$WORKER_CORES" > .env
echo "Master en spark://$IP:7077  (interfaz web: http://$IP:8090)"
docker compose --profile master up -d --build
docker compose --profile master ps
