# Imagen única para master, workers y driver del clúster Spark (misma versión de Python en todos).
FROM apache/spark:3.5.3-python3
USER root
RUN pip3 install --no-cache-dir pymysql cryptography
USER spark
