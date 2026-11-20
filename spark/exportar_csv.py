#!/usr/bin/env python3
"""Exporta las tablas necesarias de database.sqlite (European Soccer Database) a CSV para Spark.

Uso:  python3 exportar_csv.py [ruta/database.sqlite] [carpeta_salida]
Por defecto: ~/datos/database.sqlite  ->  /vagrant/datos  (carpeta compartida entre las dos VMs)
"""
import csv
import os
import sqlite3
import sys

CASAS = ["B365", "BW", "IW", "LB", "PS", "WH", "SJ", "VC", "GB", "BS"]
CUOTAS = ", ".join(f"{c}{s}" for c in CASAS for s in "HDA")

CONSULTAS = {
    "match": ("SELECT id, league_id, season, date, home_team_api_id, away_team_api_id, "
              f"home_team_goal, away_team_goal, {CUOTAS} FROM Match"),
    "league": "SELECT id, name FROM League",
    "team": "SELECT team_api_id, team_long_name FROM Team",
    "player": "SELECT player_api_id, player_name FROM Player",
    "player_attributes": "SELECT player_api_id, overall_rating, potential FROM Player_Attributes",
}


def main():
    db = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/datos/database.sqlite")
    salida = os.path.expanduser(sys.argv[2] if len(sys.argv) > 2 else "/vagrant/datos")
    if not os.path.isfile(db):
        sys.exit(f"No existe {db}")
    os.makedirs(salida, exist_ok=True)

    con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    for nombre, sql in CONSULTAS.items():
        cur = con.execute(sql)
        ruta = os.path.join(salida, f"{nombre}.csv")
        n = 0
        with open(ruta, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow([d[0] for d in cur.description])
            for fila in cur:
                w.writerow(fila)  # None se escribe como campo vacío
                n += 1
        print(f"{ruta}: {n} filas")
    con.close()


if __name__ == "__main__":
    main()
