#!/usr/bin/env python3
"""Crea un database.sqlite SINTÉTICO con el mismo esquema (columnas usadas) del European Soccer Database.
Sirve solo para probar el pipeline sin el dataset real. Los números que salen NO tienen significado real.
Uso: python3 crear_db_sintetica.py salida.sqlite
"""
import random
import sqlite3
import sys

CASAS = ["B365", "BW", "IW", "LB", "PS", "WH", "SJ", "VC", "GB", "BS"]
random.seed(7)
db = sys.argv[1]
con = sqlite3.connect(db)
cuotas_cols = ", ".join(f"{c}{s} NUMERIC" for c in CASAS for s in "HDA")
con.executescript(f"""
DROP TABLE IF EXISTS Country; DROP TABLE IF EXISTS League; DROP TABLE IF EXISTS Team;
DROP TABLE IF EXISTS Match; DROP TABLE IF EXISTS Player; DROP TABLE IF EXISTS Player_Attributes;
CREATE TABLE Country (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE League (id INTEGER PRIMARY KEY, country_id INTEGER, name TEXT);
CREATE TABLE Team (id INTEGER PRIMARY KEY, team_api_id INTEGER, team_fifa_api_id INTEGER, team_long_name TEXT, team_short_name TEXT);
CREATE TABLE Match (id INTEGER PRIMARY KEY, country_id INTEGER, league_id INTEGER, season TEXT, stage INTEGER,
  date TEXT, match_api_id INTEGER, home_team_api_id INTEGER, away_team_api_id INTEGER,
  home_team_goal INTEGER, away_team_goal INTEGER, goal TEXT, {cuotas_cols});
CREATE TABLE Player (id INTEGER PRIMARY KEY, player_api_id INTEGER, player_name TEXT);
CREATE TABLE Player_Attributes (id INTEGER PRIMARY KEY, player_api_id INTEGER, date TEXT, overall_rating INTEGER, potential INTEGER);
""")
ligas = ["England Premier League", "Spain LIGA BBVA", "Italy Serie A", "Germany 1. Bundesliga", "France Ligue 1"]
for i, l in enumerate(ligas, 1):
    con.execute("INSERT INTO Country VALUES (?,?)", (i, l.split()[0]))
    con.execute("INSERT INTO League VALUES (?,?,?)", (i, i, l))
fuerza = {}
for t in range(1, 101):
    fuerza[t] = random.uniform(0.6, 1.8)
    con.execute("INSERT INTO Team VALUES (?,?,?,?,?)", (t, 9000 + t, t, f"Equipo {t}", f"E{t}"))
temporadas = [f"{y}/{y+1}" for y in range(2008, 2016)]
filas = []
for mid in range(1, 25980):
    liga = random.randint(1, 5)
    h, a = random.sample(range(1, 101), 2)
    lh, la = fuerza[h] * 1.25, fuerza[a]
    gl, gv = int(random.expovariate(1 / lh)), int(random.expovariate(1 / la))
    ph, pa = lh / (lh + la) * 0.75, la / (lh + la) * 0.75
    pd = 1 - ph - pa
    row = [mid, liga, liga, random.choice(temporadas), random.randint(1, 38), "2010-01-01 00:00:00",
           mid, 9000 + h, 9000 + a, gl, gv, None]
    margen_base = random.uniform(0.04, 0.12)
    for i, c in enumerate(CASAS):
        if (c in ("GB", "BS") and random.random() < 0.4) or random.random() < 0.05:
            row += [None, None, None]
            continue
        k = 1 + margen_base + i * 0.003
        row += [round(k / ph, 2), round(k / pd, 2), round(k / pa, 2)]
    filas.append(row)
con.executemany(f"INSERT INTO Match VALUES ({','.join('?' * (12 + 30))})", filas)
for j in range(1, 11001):
    con.execute("INSERT INTO Player VALUES (?,?,?)", (j, 30000 + j, f"Jugador {j}"))
pid = 0
for j in range(1, 11001):
    base = random.randint(45, 85)
    for _ in range(random.randint(2, 30)):
        pid += 1
        con.execute("INSERT INTO Player_Attributes VALUES (?,?,?,?,?)",
                    (pid, 30000 + j, "2012-01-01", base + random.randint(-4, 4), base + random.randint(0, 8)))
con.commit()
con.close()
print("OK", db)
