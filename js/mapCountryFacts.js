/**
 * Short historical facts for the 2D map country panel (educational blurbs).
 * Keys use Natural Earth ADM0_A3 codes where possible.
 */

const DEFAULT_FACTS = (name) => [
  `${name} has been shaped by migration, trade, and changing borders over centuries.`,
  'Primary sources and archaeology help historians piece together regional narratives.',
  'Compare this view with the 3D globe to relate shape to climate and neighbors.',
];

/** @type {Record<string, { facts: string[] }>} */
const BY_ADM0 = {
  USA: {
    facts: [
      'Independence (1776) and westward expansion transformed thirteen colonies into a continental republic.',
      'The Civil War (1861–1865) ended slavery in law and redefined federal versus state power.',
      'The 20th century saw the U.S. emerge as a major diplomatic and industrial world power.',
    ],
  },
  CAN: {
    facts: [
      'French and British colonial eras left lasting linguistic and legal traditions.',
      'Confederation in 1867 gradually united provinces into today’s federal Canada.',
      'The War of 1812 and later treaties helped define the long U.S.–Canada border.',
    ],
  },
  MEX: {
    facts: [
      'Mesoamerican civilizations such as the Maya and Aztec flourished long before Spanish contact.',
      'Independence from Spain in 1821 began a long process of nation-building and reform.',
      'The Mexican Revolution (1910–1920) reshaped land, labor, and political participation.',
    ],
  },
  BRA: {
    facts: [
      'Portuguese colonization from 1500 onward created a distinct Lusophone American identity.',
      'The importation of enslaved Africans deeply shaped society, culture, and the economy.',
      'Brasília (1960) symbolized mid-century ambitions to develop the interior.',
    ],
  },
  GBR: {
    facts: [
      'The Norman Conquest (1066) fused Anglo-Saxon and French-Norman institutions.',
      'Parliamentary government and empire expansion marked the early modern and modern eras.',
      'Decolonization after 1945 reconfigured Britain’s global role and trade ties.',
    ],
  },
  FRA: {
    facts: [
      'The French Revolution (1789) spread ideas of citizenship, rights, and secular law.',
      'Napoleonic reforms influenced legal codes across Europe and beyond.',
      'Two world wars on French soil left deep marks on memory, borders, and alliances.',
    ],
  },
  DEU: {
    facts: [
      'The Holy Roman Empire and later German states set the stage for 19th-century unification (1871).',
      'The World Wars and division during the Cold War were pivotal in European history.',
      'Reunification in 1990 reintegrated East and West into a single federal republic.',
    ],
  },
  ITA: {
    facts: [
      'Ancient Rome’s law, engineering, and language echo through later European history.',
      'City-states and the Renaissance made the peninsula a center of art and banking.',
      'Risorgimento nationalism led to unification in the 19th century.',
    ],
  },
  ESP: {
    facts: [
      'Al-Andalus brought Islamic scholarship and architecture to the Iberian Peninsula.',
      'The Reconquista and Columbus-era voyages linked Spain to Atlantic empires.',
      'The 20th-century transition to democracy followed a long civil war and dictatorship.',
    ],
  },
  RUS: {
    facts: [
      'Kievan Rus’ and later Muscovy expanded across northern Eurasia over centuries.',
      'The Russian Empire and Soviet Union both projected power into Central Asia and Europe.',
      '1991 dissolution of the USSR created today’s Russian Federation and independent neighbors.',
    ],
  },
  CHN: {
    facts: [
      'Imperial dynasties standardized writing, bureaucracy, and vast public works.',
      'The 19th-century “century of humiliation” and 20th-century revolutions remade the state.',
      'Reform and opening from 1978 onward transformed China’s economy and global ties.',
    ],
  },
  IND: {
    facts: [
      'Indus Valley and later empires (Maurya, Gupta, Mughal) layered diverse traditions.',
      'British colonial rule and the independence movement culminated in partition (1947).',
      'A democratic constitution (1950) governs the world’s most populous democracy.',
    ],
  },
  JPN: {
    facts: [
      'Heian court culture and later samurai rule shaped distinct political aesthetics.',
      'Meiji restoration (1868) industrialized Japan and ended centuries of shogunal rule.',
      'Post-1945 recovery made Japan a major economy and regional security partner.',
    ],
  },
  AUS: {
    facts: [
      'Indigenous Australians maintain tens of thousands of years of continuous cultures.',
      'British penal colonies from 1788 grew into self-governing settler societies.',
      'Gold rushes, federation (1901), and migration diversified economy and society.',
    ],
  },
  EGY: {
    facts: [
      'Pharaonic Egypt is famous for pyramids, hieroglyphs, and Nile-based agriculture.',
      'Hellenistic, Roman, and Islamic periods each left administrative and cultural layers.',
      'The Suez Canal (1869) made Egypt a strategic hinge between Europe and Asia.',
    ],
  },
  ZAF: {
    facts: [
      'San, Khoi, Bantu-speaking kingdoms, and Dutch-British colonialism shaped the region.',
      'Apartheid (1948–1990s) institutionalized racial segregation until democratic transition.',
      'Nelson Mandela’s presidency (1994) symbolized a new constitutional order.',
    ],
  },
  NGA: {
    facts: [
      'Powerful pre-colonial states (e.g., Hausa, Yoruba, Igbo worlds) traded across West Africa.',
      'British amalgamation (1914) created Nigeria’s modern territorial outline.',
      'Independence (1960) began ongoing nation-building amid oil, diversity, and democracy.',
    ],
  },
  KEN: {
    facts: [
      'Swahili coast trade linked East Africa to the Indian Ocean world for centuries.',
      'The railway from Mombasa helped consolidate British colonial administration.',
      'Independence (1963) and later regional diplomacy made Nairobi a diplomatic hub.',
    ],
  },
  ARG: {
    facts: [
      'Indigenous peoples and Spanish colonization defined colonial Río de la Plata society.',
      '19th-century nation-building included civil wars and European immigration waves.',
      'Peronism in the 20th century left a lasting mark on labor politics and welfare ideas.',
    ],
  },
};

/**
 * @param {string} adm0A3
 * @param {string} adminName — GeoJSON ADMIN / NAME
 */
export function getFactsForCountry(adm0A3, adminName) {
  const name = adminName || adm0A3 || 'This region';
  const key = (adm0A3 || '').toUpperCase();
  const entry = BY_ADM0[key];
  if (entry) return { displayName: name, facts: entry.facts };
  return { displayName: name, facts: DEFAULT_FACTS(name) };
}

/**
 * Short line for optional Web Speech API narration.
 */
export function getNarrationLine(adm0A3, adminName) {
  const { displayName, facts } = getFactsForCountry(adm0A3, adminName);
  return `${displayName}. ${facts[0]}`;
}
