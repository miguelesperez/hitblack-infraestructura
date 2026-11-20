#!/usr/bin/env bash
# Ejecuta el análisis en el clúster Spark (el driver corre en esta máquina, en un contenedor).
# Uso:
#   bash 03_ejecutar_job.sh                          -> análisis real; guarda los reportes en MySQL
#   bash 03_ejecutar_job.sh --escala 100 --no-guardar -> prueba de escalabilidad (datos replicados x100)
# Variables opcionales:
#   MYSQL_HOST (por defecto 192.168.100.3)  MYSQL_PASSWORD (por defecto hitblack_root_2026)
#   EXEC_MEM (por defecto 512m)   TOTAL_CORES (por defecto 2: usa los núcleos de todos los workers)
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "Falta .env: ejecute antes 01_master.sh"; exit 1; }
set -a; source .env; set +a
IP=$(ip -4 addr show eth1 | awk '/inet /{print $2}' | cut -d/ -f1 | head -1)
docker run --rm --network host \
  -v /vagrant/datos:/datos:ro \
  -v "$PWD/analisis.py":/app/analisis.py:ro \
  -e MYSQL_HOST="${MYSQL_HOST:-192.168.100.3}" -e MYSQL_PORT=3306 -e MYSQL_USER=root \
  -e MYSQL_PASSWORD="${MYSQL_PASSWORD:-hitblack_root_2026}" \
  hitblack/spark:3.5 \
  /opt/spark/bin/spark-submit \
    --master "spark://${SPARK_MASTER_IP}:7077" \
    --conf spark.driver.host="$IP" --conf spark.driver.bindAddress="$IP" \
    --conf spark.executor.memory="${EXEC_MEM:-512m}" \
    --driver-memory "${DRIVER_MEM:-512m}" \
    --total-executor-cores "${TOTAL_CORES:-2}" \
    /app/analisis.py --datos /datos "$@"
