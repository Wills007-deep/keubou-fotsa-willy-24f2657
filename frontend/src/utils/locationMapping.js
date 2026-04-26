/**
 * Mapping géographique précis et sans ambiguïté des 10 régions du Cameroun.
 * Source : Découpage administratif officiel du Cameroun.
 *
 * Règle : chaque ville/lieu n'appartient qu'à UNE SEULE région.
 * Les capitales régionales et chef-lieux de départements ont été vérifiés.
 */

// ──────────────────────────────────────────────
// NOMS NOMINATIM → NOM APP (source : address.state de l'API Nominatim)
// ──────────────────────────────────────────────
export const NOMINATIM_STATE_TO_REGION = {
  // Français
  'région du centre':      'Centre',
  'region du centre':      'Centre',
  'région du littoral':    'Littoral',
  'region du littoral':    'Littoral',
  "région de l'ouest":    'Ouest',
  "region de l'ouest":    'Ouest',
  'région du nord':        'Nord',
  'region du nord':        'Nord',
  'région du sud':         'Sud',
  'region du sud':         'Sud',
  "région de l'est":      'Est',
  "region de l'est":      'Est',
  "région de l'adamaoua": 'Adamaoua',
  "region de l'adamaoua": 'Adamaoua',
  "région de l'extrême-nord": 'Extrême-Nord',
  "region de l'extreme-nord": 'Extrême-Nord',
  "région de l'extrême nord": 'Extrême-Nord',
  "region de l'extreme nord": 'Extrême-Nord',
  'région du nord-ouest':  'Nord-Ouest',
  'region du nord-ouest':  'Nord-Ouest',
  'région du sud-ouest':   'Sud-Ouest',
  'region du sud-ouest':   'Sud-Ouest',

  // Anglais (OpenStreetMap utilise parfois la version anglaise)
  'centre region':     'Centre',
  'littoral region':   'Littoral',
  'west region':       'Ouest',
  'north region':      'Nord',
  'south region':      'Sud',
  'east region':       'Est',
  'adamawa region':    'Adamaoua',
  'far north region':  'Extrême-Nord',
  'northwest region':  'Nord-Ouest',
  'southwest region':  'Sud-Ouest',

  // Formes courtes
  'centre':     'Centre',
  'littoral':   'Littoral',
  'ouest':      'Ouest',
  'west':       'Ouest',
  'nord':       'Nord',
  'north':      'Nord',
  'sud':        'Sud',
  'south':      'Sud',
  'est':        'Est',
  'east':       'Est',
  'adamaoua':   'Adamaoua',
  'adamawa':    'Adamaoua',
  'extrême-nord':  'Extrême-Nord',
  'extreme-nord':  'Extrême-Nord',
  'far north':     'Extrême-Nord',
  'nord-ouest':    'Nord-Ouest',
  'northwest':     'Nord-Ouest',
  'nord ouest':    'Nord-Ouest',
  'sud-ouest':     'Sud-Ouest',
  'southwest':     'Sud-Ouest',
  'sud ouest':     'Sud-Ouest',
};

// ──────────────────────────────────────────────
// VILLES & LOCALITÉS → RÉGION (fallback si Nominatim ne donne pas state)
// Chaque entrée est vérifiée géographiquement. Une ville = une région.
// ──────────────────────────────────────────────
export const LOCATION_TO_REGION = {

  // ── CENTRE ──────────────────────────────────
  'yaoundé': 'Centre',
  'yaounde': 'Centre',
  'mbalmayo': 'Centre',
  'obala': 'Centre',
  'okola': 'Centre',
  'soa': 'Centre',
  'akonolinga': 'Centre',
  'bafia': 'Centre',
  'eseka': 'Centre',
  'ésékoa': 'Centre',
  'evodoula': 'Centre',
  'monatélé': 'Centre',
  'monatele': 'Centre',
  'nanga eboko': 'Centre',
  'nkolafamba': 'Centre',
  'esse': 'Centre',
  'awae': 'Centre',
  'lobo': 'Centre',
  'ayos': 'Centre',
  'ntui': 'Centre',
  'mbam': 'Centre',

  // ── LITTORAL ────────────────────────────────
  'douala': 'Littoral',
  'edéa': 'Littoral',
  'edea': 'Littoral',
  'nkongsamba': 'Littoral',
  'njombé': 'Littoral',
  'njombe': 'Littoral',
  'loum': 'Littoral',
  'melong': 'Littoral',
  'mbanga': 'Littoral',
  'dizangué': 'Littoral',
  'dizangue': 'Littoral',
  'penja': 'Littoral',
  'manjo': 'Littoral',
  'yabasssi': 'Littoral',
  'yabassi': 'Littoral',
  'ndom': 'Littoral',
  'wouri': 'Littoral',
  'moungo': 'Littoral',
  'nkam': 'Littoral',

  // ── OUEST ───────────────────────────────────
  'bafoussam': 'Ouest',
  'dschang': 'Ouest',
  'mbouda': 'Ouest',
  'foumban': 'Ouest',
  'foumbot': 'Ouest',
  'bangangté': 'Ouest',
  'bangangte': 'Ouest',
  'baham': 'Ouest',
  'bafang': 'Ouest',
  'koutaba': 'Ouest',
  'bandenkop': 'Ouest',
  'tonga': 'Ouest',
  'penka-michel': 'Ouest',
  'penka michel': 'Ouest',
  'batcham': 'Ouest',
  'galim': 'Ouest',
  'noun': 'Ouest',
  'menoua': 'Ouest',
  'bamboutos': 'Ouest',
  'haut-nkam': 'Ouest',
  'nde': 'Ouest',
  'mifi': 'Ouest',

  // ── NORD ────────────────────────────────────
  // Garoua est la capitale du Nord — unique à cette région
  'garoua': 'Nord',
  'guider': 'Nord',
  'poli': 'Nord',
  'figuil': 'Nord',
  'tcholliré': 'Nord',
  'tcholire': 'Nord',
  'lagdo': 'Nord',
  'bibemi': 'Nord',
  'pitoa': 'Nord',
  'mayo-louti': 'Nord',
  'benoué': 'Nord',
  'benouee': 'Nord',
  'mayo-rey': 'Nord',
  'faro': 'Nord',

  // ── SUD ─────────────────────────────────────
  'ebolowa': 'Sud',
  'sangmélima': 'Sud',
  'sangmelima': 'Sud',
  'kribi': 'Sud',
  'ambam': 'Sud',
  'djoum': 'Sud',
  'mvangué': 'Sud',
  'mvangue': 'Sud',
  'lolodorf': 'Sud',
  'meyomessala': 'Sud',
  'ma\'an': 'Sud',
  "ma'an": 'Sud',
  'mvila': 'Sud',
  'océan': 'Sud',
  'ocean': 'Sud',
  'dja et lobo': 'Sud',
  'vallée du ntem': 'Sud',
  'vallee du ntem': 'Sud',

  // ── EST ─────────────────────────────────────
  'bertoua': 'Est',
  'batouri': 'Est',
  'abong-mbang': 'Est',
  'abong mbang': 'Est',
  'lomié': 'Est',
  'lomie': 'Est',
  'dimako': 'Est',
  'doumé': 'Est',
  'doume': 'Est',
  'yokadouma': 'Est',
  'moloundou': 'Est',
  'bétaré oya': 'Est',
  'betare oya': 'Est',
  'ngoyla': 'Est',
  'haut-nyong': 'Est',
  'lom-et-djérem': 'Est',
  'boumba-et-ngoko': 'Est',
  'kadey': 'Est',

  // ── ADAMAOUA ────────────────────────────────
  // Ngaoundéré est la capitale de l'Adamaoua — unique à cette région
  'ngaoundéré': 'Adamaoua',
  'ngaoundere': 'Adamaoua',
  'meiganga': 'Adamaoua',
  'tibati': 'Adamaoua',
  'banyo': 'Adamaoua',
  'tignère': 'Adamaoua',
  'tignere': 'Adamaoua',
  'belel': 'Adamaoua',
  'nganha': 'Adamaoua',
  'martap': 'Adamaoua',
  'ngaoundal': 'Adamaoua',
  'kontcha': 'Adamaoua',
  'mayo-banyo': 'Adamaoua',
  'djerem': 'Adamaoua',
  'vina': 'Adamaoua',
  'mbéré': 'Adamaoua',
  'mbere': 'Adamaoua',
  'faro-et-deo': 'Adamaoua',

  // ── EXTRÊME-NORD ────────────────────────────
  // Maroua est la capitale — unique à cette région
  'maroua': 'Extrême-Nord',
  'kousseri': 'Extrême-Nord',
  'kousséri': 'Extrême-Nord',
  'mora': 'Extrême-Nord',
  'mokolo': 'Extrême-Nord',
  'kaélé': 'Extrême-Nord',
  'kaele': 'Extrême-Nord',
  'yagoua': 'Extrême-Nord',
  'waza': 'Extrême-Nord',
  'meri': 'Extrême-Nord',
  'bogo': 'Extrême-Nord',
  'mindif': 'Extrême-Nord',
  'logone-et-chari': 'Extrême-Nord',
  'logone et chari': 'Extrême-Nord',
  'mayo-danay': 'Extrême-Nord',
  'mayo-kani': 'Extrême-Nord',
  'mayo-sava': 'Extrême-Nord',
  'mayo-tsanaga': 'Extrême-Nord',
  'diamaré': 'Extrême-Nord',
  'diamare': 'Extrême-Nord',

  // ── NORD-OUEST ──────────────────────────────
  // Bamenda est la capitale — unique à cette région
  'bamenda': 'Nord-Ouest',
  'kumbo': 'Nord-Ouest',
  'nkambe': 'Nord-Ouest',
  'wum': 'Nord-Ouest',
  'bafut': 'Nord-Ouest',
  'ndop': 'Nord-Ouest',
  'fundong': 'Nord-Ouest',
  'nwa': 'Nord-Ouest',
  'ako': 'Nord-Ouest',
  'santa': 'Nord-Ouest',
  'jakiri': 'Nord-Ouest',
  'nkwen': 'Nord-Ouest',
  'bui': 'Nord-Ouest',
  'donga-mantung': 'Nord-Ouest',
  'menchum': 'Nord-Ouest',
  'mezam': 'Nord-Ouest',
  'momo': 'Nord-Ouest',
  'boyo': 'Nord-Ouest',
  'ngokentunjia': 'Nord-Ouest',

  // ── SUD-OUEST ───────────────────────────────
  // Buea est la capitale — unique à cette région
  'buea': 'Sud-Ouest',
  'limbe': 'Sud-Ouest',
  'tiko': 'Sud-Ouest',
  'kumba': 'Sud-Ouest',
  'muyuka': 'Sud-Ouest',
  'mundemba': 'Sud-Ouest',
  'bangem': 'Sud-Ouest',
  'mamfe': 'Sud-Ouest',
  'eyumojock': 'Sud-Ouest',
  'idenau': 'Sud-Ouest',
  'muea': 'Sud-Ouest',
  'fako': 'Sud-Ouest',
  'meme': 'Sud-Ouest',
  'kupe-muanenguba': 'Sud-Ouest',
  'lebialem': 'Sud-Ouest',
  'manyu': 'Sud-Ouest',
  'ndian': 'Sud-Ouest',
};

/**
 * Détecte la région du Cameroun depuis le champ "state" retourné par Nominatim.
 * C'est la méthode principale et la plus fiable.
 *
 * @param {string} stateStr - address.state de la réponse Nominatim
 * @returns {string|null} - Nom de région (ex: 'Centre') ou null
 */
export function getRegionFromNominatimState(stateStr) {
  if (!stateStr) return null;
  const normalized = stateStr.toLowerCase().trim();
  return NOMINATIM_STATE_TO_REGION[normalized] || null;
}

/**
 * Détecte la région depuis un nom de lieu (fallback si Nominatim ne retourne pas state).
 * Recherche exacte d'abord, puis recherche par sous-chaîne.
 *
 * @param {string} locationName - display_name ou nom de lieu
 * @returns {string|null}
 */
export function getRegionFromLocation(locationName) {
  if (!locationName) return null;

  const parts = locationName.toLowerCase().split(',').map(p => p.trim());

  for (const part of parts) {
    if (LOCATION_TO_REGION[part]) return LOCATION_TO_REGION[part];
  }

  // Recherche partielle (sous-chaîne) uniquement sur le premier segment
  const firstPart = parts[0];
  for (const [key, region] of Object.entries(LOCATION_TO_REGION)) {
    if (firstPart.includes(key) || key.includes(firstPart)) {
      return region;
    }
  }

  return null;
}
