CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collectes (
    id_collecte VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    culture_type VARCHAR(100) NOT NULL,
    plantation_name VARCHAR(255),
    operator VARCHAR(255),
    surface FLOAT NOT NULL,
    quantite_engrais FLOAT NOT NULL,
    volume_eau FLOAT,
    rendement_final FLOAT NOT NULL,
    date_recolte TIMESTAMP,
    region VARCHAR(100),
    soil_type VARCHAR(100),
    nom_lieu VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

INSERT INTO users (id, email, hashed_password, full_name, created_at) VALUES ('2b572168-c533-43c1-b165-15d94dad40c5', 'admin00', '1234', 'Admin', '2026-04-24T11:14:03.037856') ON CONFLICT DO NOTHING;
INSERT INTO users (id, email, hashed_password, full_name, created_at) VALUES ('5d8a9c48-22af-4e8d-8d2d-e0e0df5f3928', 'willy00', '4321', 'Willy00', '2026-04-24 12:07:13.371690') ON CONFLICT DO NOTHING;
INSERT INTO users (id, email, hashed_password, full_name, created_at) VALUES ('0c62274f-ee0d-46b6-a31e-7ff408364cb0', 'admin', '1234', 'Admin', '2026-04-24 12:53:57.989105') ON CONFLICT DO NOTHING;

INSERT INTO collectes VALUES ('59d9d109-82b3-4fc8-b1ed-3aa3c6a8a445', 'Banane', 'Plantation Njombé 1', 'Jean Dupont', 2.5, 150.0, 500.0, 15.2, '2023-04-14 00:00:00.000000', 'Littoral', 'Argileux', 'Njombé Centre', 4.5833, 9.65, '2026-04-24T03:08:39.144150', '2026-04-24 19:48:09.939589', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('d33f32b7-9366-42b7-9de1-d031e9f3cf4e', 'Maïs', 'Champ Douala Est', 'Alice Morel', 1.2, 80.0, 300.0, 4.5, '2023-04-20T00:00:00', 'Centre', 'Sablonneux', 'Douala Nord', 4.0511, 9.7679, '2026-04-24T03:08:39.144921', '2026-04-24T03:08:39.144921', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('f23803c8-8158-4a2d-942f-04817852cec5', 'Cacao', 'Ferme Bafoussam', 'Robert King', 5.0, 200.0, 800.0, 3.8, '2023-04-18T00:00:00', 'Ouest', 'Volcanique', 'Bafoussam Ouest', 5.4777, 10.4166, '2026-04-24T03:08:39.145094', '2026-04-24T03:08:39.145094', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('4fe00190-3b17-47ed-ac3d-2f1f3d5a8e13', 'Riz', 'Plantation Rizière A', 'Marie Curie', 10.0, 300.0, 1200.0, 25.0, '2023-05-10T00:00:00', 'Nord', 'Limoneux', 'Vallée du Logone', 12.3456, 14.5678, '2026-04-24T03:08:39.145196', '2026-04-24T03:08:39.145196', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('b15a798b-55b4-416d-b166-3fe2f090f7c5', 'Manioc', 'Champs de Manioc B', 'Thomas Sankara', 4.0, 100.0, 0.0, 12.0, '2023-06-01T00:00:00', 'Est', 'Ferralitique', 'Bertoua Sud', 4.5678, 13.4567, '2026-04-24T03:08:39.145274', '2026-04-24T03:08:39.145274', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('8b8cb818-18d6-4617-802a-645ba4be2659', 'Café', 'Plantation Inconnue', 'Inconnu', 3.0, 50.0, NULL, 2.1, '2023-07-15T00:00:00', 'Ouest', 'Inconnu', 'Zone Montagneuse', 5.5, 10.2, '2026-04-24T03:08:39.145370', '2026-04-24T03:08:39.145370', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('454f6be6-2658-4c10-a27b-df8cde0502f7', 'Ananas', 'Champs Test', 'Expert Agre', 1.5, 40.0, NULL, 8.5, '2023-08-20T00:00:00', 'Littoral', NULL, 'Zone Côtière', 4.1, 9.5, '2026-04-24T03:08:39.145432', '2026-04-24T03:08:39.145432', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('910a5abd-41d7-4c05-b786-36b1c83572da', 'poivre blanc', 'ferme foka', 'keubou marko', 2.0, 20.0, 20.0, 0.5, '2027-05-24 00:00:00.000000', 'Centre', 'Inconnu', 'bloc-3', 3.8600704, 11.5146752, '2026-04-24 03:13:01.997044', '2026-04-24 03:13:01.997051', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('39ba0e87-684e-40a5-92a2-934f444912be', 'Café', 'will's farm', 'willy', 1.0, 50.0, 10.0, 1.3, '2026-04-29 00:00:00.000000', 'Littoral', 'Inconnu', 'douala', 3.8600704, 11.5146752, '2026-04-24 12:09:10.171453', '2026-04-24 12:09:10.171459', '5d8a9c48-22af-4e8d-8d2d-e0e0df5f3928') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('f8abb659-aebd-4cb2-8bdf-19064f5e976b', 'haricot', 'prins famer', 'prince armand', 1.0, 20.0, 10.0, 0.69, '2026-06-06 00:00:00.000000', 'Littoral', 'Inconnu', 'Douala', 4.0730624, 9.732096, '2026-04-24 16:13:05.595638', '2026-04-24 16:13:05.595645', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('64628eb7-5e15-4fad-9650-261bfd19f6b8', 'Banane', 'ferme rosi', 'fokam mariline', 1.0, 40.0, 30.0, 1.58, '2026-05-09 00:00:00.000000', 'Est', 'Volcanique', 'Communauté urbaine de Bertoua', 4.5776155, 13.6843792, '2026-04-24 19:38:04.410549', '2026-04-24 19:38:04.410557', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('6d56a2a2-32b7-4e33-900f-13d9f9a7a98c', 'Palmier à huile', 'south farm', 'solange', 7.0, 100.0, NULL, 8.21, NULL, 'Sud', 'Inconnu', 'Sangmélima', 2.936176, 11.975646, '2026-04-24 19:41:47.017747', '2026-04-24 19:41:47.017768', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
INSERT INTO collectes VALUES ('edcc1afb-67e5-4e20-bcc4-a462d12dc064', 'Maïs', '', '', 100.0, 600.0, NULL, 80.07, '2026-04-26 00:00:00.000000', 'Nord-Ouest', '', 'Bamenda', 5.9614117, 10.1516505, '2026-04-24 19:46:20.113590', '2026-04-24 19:46:20.113604', '2b572168-c533-43c1-b165-15d94dad40c5') ON CONFLICT DO NOTHING;
