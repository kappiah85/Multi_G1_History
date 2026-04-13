/**
 * Continent educational content, timeline highlights, quizzes, and lat/lon hit testing.
 * Media URLs are public samples; replace with your own files where needed.
 */

/** @typedef {{ when: string, title: string, text: string }} Highlight */
/** @typedef {{ q: string, options: string[], correct: number }} QuizItem */

/** @type {Array<{ id: string, label: string, overview: string, highlights: Highlight[], stats: [string, string][], images: {src: string, alt: string}[], video: string, youtubeId?: string, mediaNote: string, quiz: QuizItem[] }>} */
export const CONTINENTS = [
  {
    id: 'africa',
    label: 'Africa',
    overview:
      'Africa is often called the cradle of humankind: the continent holds the deepest record of our species ' +
      'and hosts extraordinary diversity in languages, ecologies, and states. The Nile corridor sustained ' +
      'Pharaonic Egypt for millennia, while the Sahel and savannas saw powerful kingdoms—Ghana, Mali, Songhai, ' +
      'Ethiopia—that controlled gold, salt, and trade routes. The Atlantic slave trade and European colonial ' +
      'partition reshaped polities and economies; independence movements from the 1950s onward rebuilt nations ' +
      'that today anchor regional bodies like the African Union and drive global culture, resources, and innovation.',
    highlights: [
      {
        when: 'c. 3100–30 BCE',
        title: 'Ancient Egypt along the Nile',
        text: 'Pharaohs, monumental architecture, and hieroglyphic writing linked Upper and Lower Egypt into a state that influenced neighbors across the Mediterranean and Red Sea.',
      },
      {
        when: 'c. 100–1500 CE',
        title: 'Kingdoms of the Sahel and Horn',
        text: 'Ghana, Mali, and Songhai controlled trans-Saharan commerce; Ethiopian Christianity and literate institutions endured as a distinctive highland empire.',
      },
      {
        when: '1500s–1800s',
        title: 'Atlantic trade and resistance',
        text: 'European forts on the coast fed the transatlantic slave system; African polities and leaders both participated in and resisted these extractive networks.',
      },
      {
        when: '1880s–1914',
        title: 'Scramble for Africa',
        text: 'European powers drew new borders at conferences; conquest, taxation, and forced labor disrupted societies but also sparked early nationalist and pan-African ideas.',
      },
      {
        when: '1950s–1980s',
        title: 'Independence and decolonization',
        text: 'Ghana’s 1957 independence became a symbol; dozens of new states joined the UN, navigating Cold War alignments, nation-building, and sometimes coup cycles.',
      },
      {
        when: '1990s–today',
        title: 'Recovery, integration, and youth',
        text: 'Multiparty transitions, mobile connectivity, urban growth, and AU-led diplomacy sit alongside ongoing conflicts, climate stress, and vibrant arts and diaspora ties.',
      },
    ],
    stats: [
      ['Population (approx.)', '~1.4 billion'],
      ['Area', '~30.4 million km²'],
      ['Major languages', 'Arabic, Swahili, English, French, Portuguese, Hausa, Amharic, Zulu, and hundreds more'],
      ['Notable eras', 'Ancient Egypt, Bantu expansions, Atlantic trade, independence movements'],
    ],
    images: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Africa_%28orthographic_projection%29.svg',
        alt: 'Africa — orthographic political map (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Africa_in_the_world_%28red%29_%28W3%29.svg',
        alt: 'Africa — location in the world (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Africa_satellite_plane.jpg',
        alt: 'Africa — satellite mosaic (NASA / Wikimedia Commons)',
      },
    ],
    video: '',
    youtubeId: 'ucW4SP5Bu0k',
    mediaNote:
      'Region history video (YouTube). Order: Africa → Asia → Europe → Americas → Australia → Antarctica.',
    quiz: [
      {
        q: 'Which river was central to ancient Egyptian civilization?',
        options: ['Niger', 'Nile', 'Congo', 'Zambezi'],
        correct: 1,
      },
      {
        q: 'The Mali Empire was especially famous in global history for which trade good?',
        options: ['Silver', 'Salt and gold', 'Tea', 'Spices only'],
        correct: 1,
      },
      {
        q: 'The late-19th-century “Scramble for Africa” mainly involved:',
        options: [
          'African states dividing Europe',
          'European powers competing to claim African territory',
          'A single treaty that freed all colonies instantly',
          'The founding of the African Union',
        ],
        correct: 1,
      },
      {
        q: 'Ghana’s independence in 1957 is often remembered as a milestone because it:',
        options: [
          'Ended World War II',
          'Was among the first Sub-Saharan colonies to gain independence',
          'Created the Nile dams',
          'Founded the Roman Empire',
        ],
        correct: 1,
      },
    ],
  },
  {
    id: 'europe',
    label: 'Europe',
    overview:
      'Europe’s history is tightly braided with its neighbors: classical Greece and Rome spread law, literature, ' +
      'and empire; medieval Christianity and feudalism framed kingdoms and crusading; the Renaissance, Reformation, ' +
      'and Enlightenment reworked art, faith, and science. The Industrial Revolution began reshaping work and ' +
      'environment in Britain and beyond, while two world wars and the Holocaust scarred the 20th century. After ' +
      '1945, institutions like the Council of Europe and the European Union aimed at peace, rights, and shared markets—' +
      'even as eastern enlargement, Brexit, and security crises keep the continent in flux.',
    highlights: [
      {
        when: 'c. 800 BCE–476 CE',
        title: 'Classical Greece and Rome',
        text: 'City-states, republican experiments, and empire spread Latin, roads, and legal ideas across the Mediterranean basin.',
      },
      {
        when: 'c. 500–1500 CE',
        title: 'Medieval Christendom and crusades',
        text: 'Feudal hierarchies, monastic learning, Viking and Magyar pressures, and crusading expeditions linked Europe to the Levant and Byzantium.',
      },
      {
        when: '14th–17th centuries',
        title: 'Renaissance, Reformation, and print',
        text: 'Humanist art and scholarship, Protestant fractures, and movable type accelerated debate and state-building.',
      },
      {
        when: '18th–19th centuries',
        title: 'Enlightenment and industrial takeoff',
        text: 'Revolutions in America and France echoed in Europe; steam power, factories, and railways transformed cities and global trade.',
      },
      {
        when: '1914–1945',
        title: 'World wars and mass violence',
        text: 'Trench stalemate, treaty resentments, fascism, and the Second World War—including the Holocaust—reshaped borders and moral memory.',
      },
      {
        when: '1945–today',
        title: 'Cold War division and European integration',
        text: 'NATO and Warsaw Pact blocs, decolonization’s shadow, the EU project, and post-1989 enlargement define the modern map.',
      },
    ],
    stats: [
      ['Population (approx.)', '~750 million'],
      ['Area', '~10.2 million km²'],
      ['Major languages', 'Russian, German, French, English, Italian, Spanish, Polish, Ukrainian, and others'],
      ['Notable eras', 'Classical antiquity, Middle Ages, Enlightenment, world wars, European Union'],
    ],
    images: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Europe_%28orthographic_projection%29.svg',
        alt: 'Europe — orthographic map (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Europe_in_the_world_%28red%29_%28W3%29.svg',
        alt: 'Europe — location in the world (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Blank_map_of_Europe_%28with_disputed_regions%29.svg',
        alt: 'Europe — blank outline map with disputed regions (Wikimedia Commons)',
      },
    ],
    video: '',
    youtubeId: 'FGmLlNK0pPs',
    mediaNote: 'Region history video (YouTube embed).',
    quiz: [
      {
        q: 'Which ancient polis is especially associated with early democratic experiments?',
        options: ['Sparta only', 'Athens', 'Carthage', 'Byzantium (at founding)'],
        correct: 1,
      },
      {
        q: 'The Protestant Reformation is most closely linked to which figure?',
        options: ['Voltaire', 'Martin Luther', 'Isaac Newton', 'Catherine the Great'],
        correct: 1,
      },
      {
        q: 'The Industrial Revolution is often said to have begun strongly in:',
        options: ['Portugal', 'Great Britain', 'Ottoman heartlands', 'Iceland'],
        correct: 1,
      },
      {
        q: 'The European Coal and Steel Community (1951) is a forerunner of:',
        options: ['NATO only', 'Today’s European Union', 'The League of Nations', 'The Warsaw Pact'],
        correct: 1,
      },
    ],
  },
  {
    id: 'asia',
    label: 'Asia',
    overview:
      'Asia spans the world’s largest landmass and majority of human population. Mesopotamia and the Indus Valley ' +
      'offer some of the earliest urban and literate societies; Chinese dynasties developed bureaucratic states, ' +
      'canals, and examinations over millennia. The Silk Road and Indian Ocean networks moved goods, faiths, and ' +
      'germs. Mongol conquests briefly linked Eurasia; later, gunpowder empires (Ottoman, Safavid, Mughal) and ' +
      'East Asian states faced European intrusion, Japanese industrialization, decolonization, and today’s ' +
      'technology-heavy economies and geopolitical rivalries.',
    highlights: [
      {
        when: 'c. 3000 BCE onward',
        title: 'River-basin civilizations',
        text: 'Mesopotamia, the Indus, and the Yellow River nurtured cities, bronze technologies, and early states.',
      },
      {
        when: 'c. 200 BCE–1500 CE',
        title: 'Silk Roads and Indian Ocean trade',
        text: 'Caravans and monsoon shipping moved silk, spices, ceramics, Buddhism, Islam, and disease vectors across continents.',
      },
      {
        when: '13th–14th centuries',
        title: 'Mongol world empire',
        text: 'Chinggisid rule connected East and West, accelerating transfers—and devastating some regions with conquest.',
      },
      {
        when: '16th–19th centuries',
        title: 'Gunpowder empires and European footholds',
        text: 'Mughal India, Safavid Iran, Ottoman West Asia, and Ming/Qing China interacted with trading companies and missionaries.',
      },
      {
        when: '1850s–1945',
        title: 'Imperialism and Asian responses',
        text: 'Meiji Japan industrialized; China faced the Opium Wars; Southeast and South Asia were colonized or dominated; WWII engulfed the Pacific.',
      },
      {
        when: '1945–today',
        title: 'Decolonization, development, and rivalry',
        text: 'New nations, partition traumas, Korean and Vietnam conflicts, China’s rise, and Gulf energy politics shape the region.',
      },
    ],
    stats: [
      ['Population (approx.)', '~4.7 billion'],
      ['Area', '~44.6 million km²'],
      ['Major languages', 'Mandarin, Hindi, Arabic, Bengali, Japanese, Korean, Indonesian, Urdu, and many more'],
      ['Notable eras', 'Silk Road, major empires, decolonization, tech-led growth'],
    ],
    images: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Asia_%28orthographic_projection%29.svg',
        alt: 'Asia — orthographic map (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Asia_in_the_world_%28red%29_%28W3%29.svg',
        alt: 'Asia — location in the world (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/4/49/LocationAsia.svg',
        alt: 'Asia — regional location map (Wikimedia Commons)',
      },
    ],
    video: '',
    youtubeId: 'P3Nb48rjqxA',
    mediaNote: 'Region history video (YouTube embed).',
    quiz: [
      {
        q: 'Which network historically connected Chang’an (Xi’an) to Central Asia and beyond?',
        options: ['The Oregon Trail', 'The Silk Road', 'The Appian Way', 'The Erie Canal'],
        correct: 1,
      },
      {
        q: 'The Mughal Empire is most associated with which subregion?',
        options: ['Japan', 'South Asia (Indian subcontinent)', 'Siberia', 'Korea'],
        correct: 1,
      },
      {
        q: 'Japan’s rapid industrialization and state-building drive in the late 19th century is called the:',
        options: ['Meiji Restoration', 'Glorious Revolution', 'Great Leap Forward', 'Tulip Period'],
        correct: 0,
      },
      {
        q: 'Which 20th-century conflict is especially tied to Cold War proxy struggle in Southeast Asia?',
        options: ['The Hundred Years’ War', 'The Vietnam War', 'The Punic Wars', 'The War of 1812'],
        correct: 1,
      },
    ],
  },
  {
    id: 'northAmerica',
    label: 'North America',
    overview:
      'North America’s human story begins with diverse Indigenous nations—Mississippian mound builders, Haudenosaunee ' +
      'diplomacy, Navajo and Inuit adaptations, and many more—who engineered landscapes and trade for thousands of years. ' +
      'European contact brought epidemic disease and colonial projects; independence movements produced the United States, ' +
      'Haiti (Caribbean edge), and later Mexico and Canada in modern forms. The 19th century saw U.S. expansion, the U.S. ' +
      'Civil War, and Canadian confederation; the 20th brought world wars, civil rights struggles, NAFTA-era integration, ' +
      'and today’s debates over migration, indigenous sovereignty, and climate on coasts and in the Arctic.',
    highlights: [
      {
        when: 'Pre-contact millennia',
        title: 'Indigenous polities and engineering',
        text: 'Cahokia, Haudenosaunee confederacy practices, Pacific Northwest potlatch economies, and Arctic technologies show deep regional variety.',
      },
      {
        when: '1492–1700s',
        title: 'Encounter, missions, and enslavement',
        text: 'Spanish, French, English, and Dutch colonies competed; African slavery took root especially in plantation zones.',
      },
      {
        when: '1776–1820s',
        title: 'Independence and constitution-making',
        text: 'The American Revolution and early U.S. republic; Haitian revolution nearby; Latin American wars of independence later reshape the hemisphere.',
      },
      {
        when: '1861–1865',
        title: 'U.S. Civil War',
        text: 'Union versus Confederacy over slavery’s future; emancipation redefined citizenship though equality remained contested.',
      },
      {
        when: '1867–1914',
        title: 'Expansion, rails, and Canada',
        text: 'Canadian confederation, treaties with First Nations under strain, U.S. westward movement, and industrial trusts.',
      },
      {
        when: '20th century–today',
        title: 'Superpower, rights, and neighbors',
        text: 'WWI/WWII mobilization, civil rights movements, NAFTA/USMCA trade, and ongoing Indigenous-led land and water advocacy.',
      },
    ],
    stats: [
      ['Population (approx.)', '~600 million'],
      ['Area', '~24.7 million km²'],
      ['Major languages', 'English, Spanish, French, and Indigenous languages'],
      ['Notable eras', 'Pre-Columbian civilizations, colonial era, independence, 20th-century superpower era'],
    ],
    images: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Northern_America_including_Mexico_%28orthographic_projection%29.svg',
        alt: 'North America (incl. Mexico) — orthographic map (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Location_North_America.svg',
        alt: 'North America — location on world map (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/North_America_in_the_world_%28red%29_%28W3%29.svg',
        alt: 'North America — highlighted on world map (Wikimedia Commons)',
      },
    ],
    video: '',
    youtubeId: '5Pm_s2wzxo0',
    mediaNote: 'Region history video (YouTube embed).',
    quiz: [
      {
        q: 'Cahokia (near modern St. Louis) is especially known for:',
        options: ['Viking longhouses', 'Large earthen mounds and a Mississippian city', 'Inca terraces', 'Roman forums'],
        correct: 1,
      },
      {
        q: 'The primary issue at the center of the U.S. Civil War was:',
        options: ['Tea taxes only', 'The future of slavery and union', 'Canadian confederation', 'The moon landing'],
        correct: 1,
      },
      {
        q: 'Canada’s federal Dominion under the British Crown began in:',
        options: ['1492', '1867', '1945', '2001'],
        correct: 1,
      },
      {
        q: 'NAFTA (1994) primarily aimed to:',
        options: [
          'Ban all trade in North America',
          'Lower trade barriers among Mexico, Canada, and the United States',
          'Found the United Nations',
          'End the Cold War in Europe only',
        ],
        correct: 1,
      },
    ],
  },
  {
    id: 'southAmerica',
    label: 'South America',
    overview:
      'Before Iberian arrival, South America hosted states such as the Inca (Tawantinsuyu) with road systems and ' +
      'highland agriculture, alongside Amazonian and Atlantic societies often overlooked in older textbooks. Spanish ' +
      'and Portuguese conquest forged colonial hierarchies; Potosí silver and plantation economies tied the continent ' +
      'to global circuits. Independence wars of the early 1800s produced new republics; the 20th century saw ' +
      'populism, dictatorships, debt crises, and democratization. Today Indigenous movements, urban culture, commodity ' +
      'exports, and Amazon conservation debates sit at the center of regional politics.',
    highlights: [
      {
        when: 'Pre-1532',
        title: 'Inca and diverse nations',
        text: 'The Inca linked the Andes by road and labor tax (mit’a); lowland and southern societies maintained distinct economies and languages.',
      },
      {
        when: '1530s–1700s',
        title: 'Conquest and colonial silver',
        text: 'Pizarro’s seizure of the Inca capital and Potosí mining integrated Andean labor into Spanish imperial finance.',
      },
      {
        when: '1808–1820s',
        title: 'Independence wars',
        text: 'Napoleonic crises in Spain and Portugal helped trigger campaigns by Bolívar, San Martín, and others.',
      },
      {
        when: '19th century',
        title: 'Caudillos, coffee, and borders',
        text: 'New states fought over boundaries; export booms in guano, rubber, or coffee shaped elites and labor.',
      },
      {
        when: '1960s–1980s',
        title: 'Cold War dictatorships',
        text: 'Military regimes in several countries repressed dissent; debt crises followed global shocks.',
      },
      {
        when: '1990s–today',
        title: 'Democracy, commodities, and Amazon stakes',
        text: 'Elections and social programs in many states; soy and copper exports; rainforest governance and Indigenous land claims.',
      },
    ],
    stats: [
      ['Population (approx.)', '~430 million'],
      ['Area', '~17.8 million km²'],
      ['Major languages', 'Portuguese, Spanish, Quechua, Guarani, and others'],
      ['Notable eras', 'Pre-Columbian empires, colonial extraction economies, nation-building, regional integration'],
    ],
    images: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/South_America_%28orthographic_projection%29.svg',
        alt: 'South America — orthographic map (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/2/28/South_America_in_the_world_%28red%29_%28W3%29.svg',
        alt: 'South America — location in the world (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/5/54/South_America_-_Blue_Marble_orthographic.jpg',
        alt: 'South America — Blue Marble satellite mosaic (NASA / Wikimedia Commons)',
      },
    ],
    video: '',
    youtubeId: 'KvoMLsiHrKQ',
    mediaNote: 'Region history video (YouTube Shorts embed).',
    quiz: [
      {
        q: 'The Inca Empire was centered primarily in:',
        options: ['The Amazon lowlands only', 'The Andes mountain region', 'Patagonian steppe only', 'Greenland'],
        correct: 1,
      },
      {
        q: 'Which European empire ruled colonial Brazil?',
        options: ['Spain', 'Portugal', 'France', 'Netherlands'],
        correct: 1,
      },
      {
        q: 'Simón Bolívar is most associated with:',
        options: ['Japanese modernization', 'Independence campaigns in northern South America', 'Russian serf emancipation', 'Australian federation'],
        correct: 1,
      },
      {
        q: 'Potosí (in modern Bolivia) became famous colonial-era wealth because of:',
        options: ['Coffee exports', 'Silver mining', 'Whale oil', 'Silk weaving'],
        correct: 1,
      },
    ],
  },
  {
    id: 'australia',
    label: 'Australia',
    overview:
      'Australia’s Indigenous peoples maintain continuous cultures tied to Country for tens of thousands of years, ' +
      'with sophisticated law, trade, and land-management knowledge. Dutch and British navigators mapped coasts; ' +
      'from 1788 a British penal colony grew into six colonies, federating in 1901. Gold rushes, sheep stations, ' +
      'and later mining defined exports; ANZAC participation in world wars shaped national mythologies. Since the ' +
      '1970s, land rights cases, the Mabo decision recognizing native title, and truth-telling processes confront ' +
      'colonial legacies while migration from Asia and the Pacific diversifies cities.',
    highlights: [
      {
        when: '65,000+ years ago–today',
        title: 'Indigenous Australia',
        text: 'Songlines, trade networks, and fire-stick farming shaped ecosystems long before British settlement.',
      },
      {
        when: '1606–1770',
        title: 'European coastal mapping',
        text: 'Dutch voyagers charted north and west; Cook’s 1770 east coast survey set the stage for British claims.',
      },
      {
        when: '1788 onward',
        title: 'Convict colony and frontier conflict',
        text: 'Sydney Cove became a beachhead; expansion brought disease, dispossession, and resistance across regions.',
      },
      {
        when: '1850s',
        title: 'Gold rushes',
        text: 'Victoria’s fields drew global diggers, accelerating population, railways, and democratic experiments.',
      },
      {
        when: '1901',
        title: 'Federation',
        text: 'Six colonies united as the Commonwealth of Australia within the British Empire.',
      },
      {
        when: '1992–today',
        title: 'Native title and reconciliation debates',
        text: 'Mabo v Queensland (1992) rejected terra nullius for native title law; ongoing treaty and Voice discussions continue.',
      },
    ],
    stats: [
      ['Population (approx.)', '~27 million'],
      ['Area', '~7.7 million km²'],
      ['Major languages', 'English, Indigenous Australian languages, Mandarin, Arabic, Vietnamese'],
      ['Notable eras', 'Indigenous deep time, British colonization, federation, multicultural migration'],
    ],
    images: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Australia_with_AAT_%28orthographic_projection%29.svg',
        alt: 'Australia — orthographic map with Australian Antarctic Territory (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Oceania_%28orthographic_projection%29.svg',
        alt: 'Oceania — orthographic map (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Australia_satellite_plane.jpg',
        alt: 'Australia — satellite view (NASA Visible Earth / Wikimedia Commons)',
      },
    ],
    video: '',
    youtubeId: '-3C4xy6VtTU',
    mediaNote: 'Region history video (YouTube Shorts embed).',
    quiz: [
      {
        q: 'Australia’s six colonies federated into the Commonwealth in:',
        options: ['1788', '1901', '1967', '2000'],
        correct: 1,
      },
      {
        q: 'The Mabo decision (1992) is significant because it:',
        options: [
          'Declared Australia uninhabited before 1788',
          'Rejected the fiction of terra nullius for native title purposes',
          'Abolished the monarchy',
          'Founded the ANZAC corps',
        ],
        correct: 1,
      },
      {
        q: 'British settlement began as a penal colony at roughly:',
        options: ['Perth in 1851', 'Sydney Cove (1788)', 'Canberra in 1820', 'Darwin in 1606'],
        correct: 1,
      },
      {
        q: 'The Eureka Stockade (1854) is associated with:',
        options: ['Whaling disputes', 'Gold-field miners protesting licenses', 'Federation convention', 'Pacific nuclear tests'],
        correct: 1,
      },
    ],
  },
  {
    id: 'antarctica',
    label: 'Antarctica',
    overview:
      'Antarctica has no indigenous human population; its recorded history is one of maritime sighting, sealing and ' +
      'whaling, national expeditions, international science, and legal instruments. The “Heroic Age” of Amundsen, Scott, ' +
      'and Shackleton captured public imagination; the International Geophysical Year (1957–58) spurred permanent ' +
      'stations. The 1959 Antarctic Treaty demilitarizes the continent and foregrounds science; later agreements ' +
      'address seals, minerals (currently restricted), and environmental protection. Today climate cores and ice-sheet ' +
      'studies make Antarctica central to understanding global warming and sea-level rise.',
    highlights: [
      {
        when: '1820 onward',
        title: 'First confirmed sightings',
        text: 'Naval expeditions established Antarctica as a continent, not mythic Terra Australis alone.',
      },
      {
        when: '1890s–1920s',
        title: 'Heroic Age expeditions',
        text: 'Race to the South Pole, tragic losses, and advances in sledging, nutrition, and navigation.',
      },
      {
        when: '1957–58',
        title: 'International Geophysical Year',
        text: 'Coordinated science pushed year-round bases and Cold War–era US/Soviet presence.',
      },
      {
        when: '1959',
        title: 'Antarctic Treaty',
        text: 'Peaceful use, freedom of scientific investigation, and a freeze on territorial claims rhetoric in practice.',
      },
      {
        when: '1991',
        title: 'Madrid Protocol',
        text: 'Environmental protection principles; mining ban with review mechanism—shaping conservation norms.',
      },
      {
        when: '2000s–today',
        title: 'Climate science hub',
        text: 'Ice cores, oceanography, and satellite data link Antarctic change to global sea-level and weather patterns.',
      },
    ],
    stats: [
      ['Population', 'No permanent residents; seasonal research staff (~1,000–5,000)'],
      ['Area', '~14.2 million km² (ice-covered)'],
      ['Languages', 'English, Russian, Spanish, and others at research stations'],
      ['Notable eras', 'Exploration, International Geophysical Year, Antarctic Treaty System'],
    ],
    images: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Antarctica_%28orthographic_projection%29.svg',
        alt: 'Antarctica — orthographic map (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Antarctica_in_the_world_%28red%29_%28W3%29.svg',
        alt: 'Antarctica — location in the world (Wikimedia Commons)',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Transantarctic_Mountains.jpg',
        alt: 'Transantarctic Mountains — NASA photograph (Wikimedia Commons)',
      },
    ],
    video: '',
    youtubeId: 'fvfAj-vCsxg',
    mediaNote: 'Region history video (YouTube Shorts embed).',
    quiz: [
      {
        q: 'The Antarctic Treaty (1959) emphasizes primarily:',
        options: [
          'Military bases and nuclear testing',
          'Peaceful use and scientific cooperation',
          'Permanent colonization by one state',
          'Commercial whaling without limits',
        ],
        correct: 1,
      },
      {
        q: 'Roald Amundsen is famous for reaching:',
        options: ['The North Pole only', 'The South Pole in 1911', 'The summit of Everest', 'The Mariana Trench'],
        correct: 1,
      },
      {
        q: 'Ice cores from Antarctica are valuable because they:',
        options: [
          'Prove the continent has no ice',
          'Record past climate and greenhouse gas levels',
          'Replace all weather satellites',
          'Show ancient dinosaur DNA only',
        ],
        correct: 1,
      },
      {
        q: 'The Madrid Protocol (1991) is best known for strengthening:',
        options: ['Territorial claims wars', 'Environmental protection norms', 'Commercial seal hunting quotas only', 'Desert irrigation'],
        correct: 1,
      },
    ],
  },
];

/**
 * Vertical timeline nodes per continent (normalized wy in [0,1] = top→bottom time flow).
 * Used by the continent timeline panel (DDA/Bresenham spine + midpoint circles + Bézier).
 */
export const CONTINENT_TIMELINES = {
  africa: [
    { wy: 0.1, label: 'Ancient Egypt', era: 'c. 3100 BCE' },
    { wy: 0.28, label: 'Sahel empires', era: '100–1500 CE' },
    { wy: 0.46, label: 'Atlantic era', era: '1500s–1800s' },
    { wy: 0.64, label: 'Scramble', era: '1880s–1914' },
    { wy: 0.82, label: 'Independence', era: '1950s–1980s' },
  ],
  europe: [
    { wy: 0.1, label: 'Greece & Rome', era: '800 BCE–476 CE' },
    { wy: 0.3, label: 'Medieval', era: '500–1500 CE' },
    { wy: 0.48, label: 'Renaissance', era: '14th–17th c.' },
    { wy: 0.62, label: 'Industrial age', era: '18th–19th c.' },
    { wy: 0.8, label: 'EU & peace project', era: '1945–today' },
  ],
  asia: [
    { wy: 0.12, label: 'River civilizations', era: '3000 BCE+' },
    { wy: 0.3, label: 'Silk Roads', era: '200 BCE–1500 CE' },
    { wy: 0.48, label: 'Gunpowder empires', era: '16th–19th c.' },
    { wy: 0.64, label: 'Imperialism & war', era: '1850–1945' },
    { wy: 0.82, label: 'Rise & integration', era: '1945–today' },
  ],
  northAmerica: [
    { wy: 0.12, label: 'Indigenous nations', era: 'pre-contact' },
    { wy: 0.32, label: 'Colonial Americas', era: '1492–1776' },
    { wy: 0.5, label: 'Independence & expansion', era: '1776–1865' },
    { wy: 0.68, label: 'Industrial superpower', era: '1865–1945' },
    { wy: 0.86, label: 'Rights & trade blocs', era: '1945–today' },
  ],
  southAmerica: [
    { wy: 0.14, label: 'Inca & neighbors', era: 'pre-1532' },
    { wy: 0.34, label: 'Silver & colonies', era: '1530s–1800s' },
    { wy: 0.52, label: 'Independence wars', era: '1808–1820s' },
    { wy: 0.7, label: 'Boom & bust', era: '19th–20th c.' },
    { wy: 0.86, label: 'Democracy wave', era: '1980s–today' },
  ],
  australia: [
    { wy: 0.14, label: 'Indigenous deep time', era: '65k+ years' },
    { wy: 0.36, label: 'British colony', era: '1788–1900' },
    { wy: 0.54, label: 'Federation', era: '1901' },
    { wy: 0.72, label: 'World wars & ANZAC', era: '1914–1945' },
    { wy: 0.88, label: 'Native title & voice', era: '1992–today' },
  ],
  antarctica: [
    { wy: 0.18, label: 'First sightings', era: '1820+' },
    { wy: 0.4, label: 'Heroic Age', era: '1890s–1920s' },
    { wy: 0.58, label: 'IGY bases', era: '1957–58' },
    { wy: 0.74, label: 'Antarctic Treaty', era: '1959' },
    { wy: 0.9, label: 'Climate science', era: '2000s–today' },
  ],
};

/**
 * Flatten quiz items for the world quiz hub (optional continent filter).
 * @param {string | null} continentId
 */
export function getQuizPool(continentId = null) {
  const list =
    continentId && String(continentId).length
      ? CONTINENTS.filter((c) => c.id === continentId)
      : CONTINENTS;
  return list.flatMap((c) =>
    (c.quiz || []).map((q) => ({
      ...q,
      continentId: c.id,
      continentLabel: c.label,
    }))
  );
}

/**
 * Equirectangular UV from Three.js raycast (u,v in [0,1]) → latitude/longitude in degrees.
 * Aligns picking with the Earth texture.
 */
export function latLonFromUV(u, v) {
  const lon = u * 360 - 180;
  const lat = 90 - v * 180;
  return { lat, lon };
}

/**
 * Ordered region tests (more specific regions first). Approximate; oceans return null.
 */
export function continentFromLatLon(lat, lon) {
  if (lat < -60) return 'antarctica';
  if (lat >= -52 && lat <= -9 && lon >= 112 && lon <= 154) return 'australia';
  if (lat >= -56 && lat <= 14 && lon >= -81 && lon <= -34) return 'southAmerica';
  if (lat >= 10 && lat <= 83 && lon >= -168 && lon <= -52) return 'northAmerica';
  if (lat >= 12 && lat <= 45 && lon >= 34 && lon <= 63) return 'asia';
  if (lat >= 35 && lat <= 72 && lon >= -25 && lon <= 45) return 'europe';
  if (lat >= -38 && lat <= 38 && lon >= -25 && lon <= 55) return 'africa';
  if (lat >= -12 && lat <= 78 && lon > 40 && lon <= 180) return 'asia';
  if (lat >= 50 && lat <= 75 && lon >= -180 && lon <= -168) return 'asia';
  return null;
}
