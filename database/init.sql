CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs pour l'authentification
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des collectes enrichie
CREATE TABLE IF NOT EXISTS collectes (
    id_collecte UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    culture_type VARCHAR(100) NOT NULL,
    plantation_name VARCHAR(255),
    operator VARCHAR(255),
    surface FLOAT NOT NULL CHECK (surface > 0),
    quantite_engrais FLOAT NOT NULL CHECK (quantite_engrais >= 0),
    volume_eau FLOAT,
    rendement_final FLOAT NOT NULL CHECK (rendement_final >= 0),
    date_recolte TIMESTAMP WITH TIME ZONE,
    
    -- Géolocalisation
    latitude FLOAT,
    longitude FLOAT,
    
    -- Traçabilité
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fonction pour mettre à jour automatiquement 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collectes_updated_at
BEFORE UPDATE ON collectes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
