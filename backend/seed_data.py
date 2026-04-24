import sqlite3
import uuid
from datetime import datetime
import os

db_path = 'backend/agroanalytics.db'
if not os.path.exists('backend'):
    db_path = 'agroanalytics.db'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Réinitialisation complète de la base de données...")

cursor.execute("DROP TABLE IF EXISTS collectes")

cursor.execute('''
CREATE TABLE collectes (
    id_collecte TEXT PRIMARY KEY,
    culture_type TEXT NOT NULL,
    plantation_name TEXT,
    operator TEXT,
    surface REAL NOT NULL,
    quantite_engrais REAL NOT NULL,
    volume_eau REAL,
    rendement_final REAL NOT NULL,
    date_recolte TEXT,
    nom_lieu TEXT,
    latitude REAL,
    longitude REAL,
    created_at TEXT,
    updated_at TEXT
)
''')

test_data = [
    ('Banane', 'Plantation Njombé 1', 'Jean Dupont', 2.5, 150.0, 500.0, 15.2, '2023-04-15T00:00:00', 'Njombé Centre', 4.5833, 9.6500),
    ('Maïs', 'Champ Douala Est', 'Alice Morel', 1.2, 80.0, 300.0, 4.5, '2023-04-20T00:00:00', 'Douala Nord', 4.0511, 9.7679),
    ('Cacao', 'Ferme Bafoussam', 'Robert King', 5.0, 200.0, 800.0, 3.8, '2023-04-18T00:00:00', 'Bafoussam Ouest', 5.4777, 10.4166),
    ('Riz', 'Plantation Rizière A', 'Marie Curie', 10.0, 300.0, 1200.0, 25.0, '2023-05-10T00:00:00', 'Vallée du Logone', 12.3456, 14.5678),
    ('Manioc', 'Champs de Manioc B', 'Thomas Sankara', 4.0, 100.0, 0.0, 12.0, '2023-06-01T00:00:00', 'Bertoua Sud', 4.5678, 13.4567)
]

for culture, plantation, op, surface, engrais, eau, rendement, date_r, lieu, lat, lon in test_data:
    now = datetime.now().isoformat()
    cursor.execute('''
        INSERT INTO collectes (
            id_collecte, culture_type, plantation_name, operator, surface, 
            quantite_engrais, volume_eau, rendement_final, date_recolte, 
            nom_lieu, latitude, longitude, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (str(uuid.uuid4()), culture, plantation, op, surface, engrais, eau, rendement, date_r, lieu, lat, lon, now, now))

conn.commit()
conn.close()
print("Base de données synchronisée avec le nouveau schéma et données de test insérées !")
