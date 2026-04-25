// Mapping of Cameroon cities, towns, and areas to their regions
export const LOCATION_TO_REGION = {
  // Centre Region
  'yaoundé': 'Centre',
  'yaounde': 'Centre',
  'yaoundé 1': 'Centre',
  'yaoundé 2': 'Centre',
  'yaoundé 3': 'Centre',
  'yaoundé 4': 'Centre',
  'yaoundé 5': 'Centre',
  'yaoundé 6': 'Centre',
  'yaoundé 7': 'Centre',
  'efoulan': 'Centre',
  'soa': 'Centre',
  'mezam': 'Centre',
  'mbalmayo': 'Centre',
  'evodoula': 'Centre',
  'awae': 'Centre',
  'akonolinga': 'Centre',
  'obala': 'Centre',
  'okola': 'Centre',
  'monatélé': 'Centre',
  'monatele': 'Centre',
  'mbalmayo': 'Centre',
  'nan-anga eboko': 'Centre',
  'esse': 'Centre',

  // Littoral Region
  'douala': 'Littoral',
  'douala 1': 'Littoral',
  'douala 2': 'Littoral',
  'douala 3': 'Littoral',
  'douala 4': 'Littoral',
  'douala 5': 'Littoral',
  'douala 6': 'Littoral',
  'douala 7': 'Littoral',
  'buea': 'Littoral',
  'limbe': 'Littoral',
  'tiko': 'Littoral',
  'kumba': 'Littoral',
  'edéa': 'Littoral',
  'edea': 'Littoral',
  'nkongsamba': 'Littoral',
  'manyu': 'Littoral',
  'njombé': 'Littoral',
  'njombe': 'Littoral',

  // West Region
  'bafoussam': 'Ouest',
  'dschang': 'Ouest',
  'dschang': 'Ouest',
  'mbouda': 'Ouest',
  'foumban': 'Ouest',
  'foumbot': 'Ouest',
  'bangangté': 'Ouest',
  'bangangte': 'Ouest',
  'baleng': 'Ouest',
  'batié': 'Ouest',
  'batie': 'Ouest',
  'kaberry': 'Ouest',
  'koutaba': 'Ouest',
  'bandenkop': 'Ouest',
  'mangoum': 'Ouest',
  'menoua': 'Ouest',
  'noun': 'Ouest',
  'koung-khi': 'Ouest',
  'baham': 'Ouest',

  // North Region (Nord)
  'garoua': 'Nord',
  'garua': 'Nord',
  'ngaoundéré': 'Nord',
  'ngaoundere': 'Nord',
  'maroua': 'Nord',
  'marua': 'Nord',
  'garoua boulai': 'Nord',
  'meiganga': 'Nord',
  'banyo': 'Nord',
  'tibati': 'Nord',
  'tignère': 'Nord',
  'tignere': 'Nord',
  'belel': 'Nord',

  // South Region
  'ebolowa': 'Sud',
  'eboulowa': 'Sud',
  'sangmélima': 'Sud',
  'sangmelima': 'Sud',
  'kribi': 'Sud',
  'kribi': 'Sud',
  'djoum': 'Sud',
  'ayos': 'Sud',
  'dja et lobo': 'Sud',
  'océan': 'Sud',
  'ocean': 'Sud',
  'vallée du ntem': 'Sud',
  'vallee du ntem': 'Sud',

  // East Region
  'bertoua': 'Est',
  'batouri': 'Est',
  'batouri': 'Est',
  'abong-mbang': 'Est',
  'abong-mbang': 'Est',
  'abong mbang': 'Est',
  'dimako': 'Est',
  'atok': 'Est',
  'kette': 'Est',
  'bétaré oya': 'Est',
  'betare oya': 'Est',
  'nguti': 'Est',

  // Adamawa Region
  'adamaoua': 'Adamaoua',
  'ngaoundéré': 'Adamaoua',
  'ngaoundere': 'Adamaoua',
  'garoua': 'Adamaoua',
  'garua': 'Adamaoua',
  'meiganga': 'Adamaoua',
  'tibati': 'Adamaoua',
  'banyo': 'Adamaoua',
  'belel': 'Adamaoua',
  'mayo-banyo': 'Adamaoua',
  'mayo-laddé': 'Adamaoua',
  'mayo-louti': 'Adamaoua',
  'djerem': 'Adamaoua',

  // Far North Region
  'extrême-nord': 'Extrême-Nord',
  'extreme-nord': 'Extrême-Nord',
  'extrême nord': 'Extrême-Nord',
  'maroua': 'Extrême-Nord',
  'kousseri': 'Extrême-Nord',
  'kousséri': 'Extrême-Nord',
  'guider': 'Extrême-Nord',
  'garoua': 'Extrême-Nord',
  'garua': 'Extrême-Nord',
  'kaélé': 'Extrême-Nord',
  'kaele': 'Extrême-Nord',
  'mayo-tsanaga': 'Extrême-Nord',
  'mayo-danay': 'Extrême-Nord',
  'mayo-sava': 'Extrême-Nord',
  'logone-et-chari': 'Extrême-Nord',
  'logone et chari': 'Extrême-Nord',
  'mayo-louti': 'Extrême-Nord',

  // North-West Region
  'nord-ouest': 'Nord-Ouest',
  'nord ouest': 'Nord-Ouest',
  'bamenda': 'Nord-Ouest',
  'bali': 'Nord-Ouest',
  'ndop': 'Nord-Ouest',
  'nkambe': 'Nord-Ouest',
  'kumbe': 'Nord-Ouest',
  'bamenda': 'Nord-Ouest',
  'kumba': 'Nord-Ouest',
  'kumba': 'Nord-Ouest',
  'buea': 'Nord-Ouest',
  'tiko': 'Nord-Ouest',
  'limbe': 'Nord-Ouest',
  'kumbo': 'Nord-Ouest',
  'wum': 'Nord-Ouest',
  'menchum': 'Nord-Ouest',
  'bui': 'Nord-Ouest',
  'manyu': 'Nord-Ouest',
  'mezam': 'Nord-Ouest',
  'boyo': 'Nord-Ouest',
  'bafut': 'Nord-Ouest',
  'nkwen': 'Nord-Ouest',
  'nso': 'Nord-Ouest',
  'fungom': 'Nord-Ouest',

  // South-West Region
  'sud-ouest': 'Sud-Ouest',
  'sud ouest': 'Sud-Ouest',
  'buea': 'Sud-Ouest',
  'limbe': 'Sud-Ouest',
  'tiko': 'Sud-Ouest',
  'kumba': 'Sud-Ouest',
  'muyuka': 'Sud-Ouest',
  'muea': 'Sud-Ouest',
  'idenau': 'Sud-Ouest',
  'jufuari': 'Sud-Ouest',
  'fako': 'Sud-Ouest',
  'bangem': 'Sud-Ouest',
  'balondo': 'Sud-Ouest',
  'meme': 'Sud-Ouest',
};

/**
 * Get region from location name
 * @param {string} locationName - The name of the location
 * @returns {string|null} - The region name or null if not found
 */
export function getRegionFromLocation(locationName) {
  if (!locationName) return null;
  
  // Normalize the location name
  const normalized = locationName
    .toLowerCase()
    .trim()
    .split(',')[0] // Take first part if it's a full address
    .trim();

  // Try exact match first
  if (LOCATION_TO_REGION[normalized]) {
    return LOCATION_TO_REGION[normalized];
  }

  // Try substring matching for variations
  for (const [location, region] of Object.entries(LOCATION_TO_REGION)) {
    if (normalized.includes(location) || location.includes(normalized)) {
      return region;
    }
  }

  return null;
}
