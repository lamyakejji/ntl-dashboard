/* Growth, agriculture (NDVI), activity by zone (lights + NO₂) and ports (PortWatch) pages — shared by the EN
 * and FR sites (language from <html lang>). Uses the helpers of app.js (S, $, $$, F, esc, plot, C, css, isNum,
 * newMap, RENDER). Data: macro.json, agri.json, zones.json, zones.geojson, ports.json. */
"use strict";
(() => {
const FR = (document.documentElement.lang || "en").toLowerCase().startsWith("fr");
const IMF = { blue: "#004C97", mid: "#5E8AB4", light: "#CAE0FB", red: "#DA291C", green: "#78BE20", gold: "#F2A900", navy: "#001E60",
  grey: "#B1B3B3", purple: "#8031A7", orange: "#FF8200", sky: "#009CDE", teal: "#00B0B9", rust: "#E35205" };
const PAL = [IMF.blue, IMF.orange, IMF.sky, IMF.green, IMF.red, IMF.purple, IMF.gold, IMF.navy];
const dec = (v, d = 1) => (isNum(v) ? (FR ? v.toFixed(d).replace(".", ",") : v.toFixed(d)) : "–");
const sgn = (v, d = 1) => (isNum(v) ? (v > 0 ? "+" : "") + dec(v, d) : "–");
const pc = (v, d = 1) => (isNum(v) ? sgn(v, d) + (FR ? " %" : "%") : "–");
const kpi = (label, value, sub = "") => `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div><div class="sub">${esc(sub)}</div></div>`;
const seg = (id, opts, on) => `<div class="seg" id="${id}">${opts.map(([k, l]) => `<button type="button" data-k="${esc(k)}" class="${k === on ? "on" : ""}">${esc(l)}</button>`).join("")}</div>`;
const segVal = (id) => ($(`#${id} button.on`) || {}).dataset?.k;
const onSeg = (id, fn) => { const el = $("#" + id); if (!el) return; el.onclick = (e) => { const b = e.target.closest("button"); if (!b || b.disabled) return;
  $$(`#${id} button`).forEach((x) => x.classList.toggle("on", x === b)); fn(b.dataset.k); }; };
const COLON = FR ? " : " : ": ";
const qlab = (q) => (FR ? String(q).replace("Q", "T") : String(q));
const empty = (sec, msg) => { sec.innerHTML = `<article class="card"><p class="help">${esc(msg)}</p></article>`; };
const T = FR ? {
  na: "Données non disponibles : relancer la section correspondante du notebook, puis l'export (section 17).",
  // growth
  m_lede: "Ce que disent les comptes nationaux trimestriels de l'ANSADE, et ce qu'en disent les satellites. Les chiffres officiels viennent des notes de croissance publiées ; les indicateurs satellitaires (lumières, NO₂, NDVI, trafic portuaire) servent de recoupement, trimestre par trimestre.",
  k_qoq: "PIB réel, sur un trimestre", k_yoy: "PIB réel, sur un an", k_xg: "Hors gaz, sur un an", k_y: "Croissance annuelle",
  c_h: "Contributions des secteurs à la croissance du PIB", c_help: "Barres : contribution de chaque secteur (points de %) ; ligne : croissance du PIB. 2023–2024 : note du 4e trimestre 2024 ; 2025–2026 : note du 2e trimestre 2026 (millésimes différents).",
  c_qoq: "Sur un trimestre (CVS)", c_yoy: "Sur un an", c_y: "Points de %", gdp: "Croissance du PIB",
  sec: { primary: "Secteur primaire", secondary: "Secteur secondaire", tertiary: "Secteur tertiaire", taxes: "Taxes nettes sur les produits" },
  g_h: "PIB trimestriel depuis 2014", g_help: "Barres : variation sur un trimestre (CVS) ; ligne : glissement annuel (officiel quand publié, sinon calculé à partir de l'indice chaîné). Losanges : millésime précédent (révisions).",
  g_bar: "Sur un trimestre", g_line: "Sur un an", g_prev: "Millésime précédent", g_y: "%",
  i_h: "Indice de la production industrielle (IPI)", i_help: "Indice trimestriel de l'ANSADE (base 100) et sa variation sur un an.", i_idx: "IPI (indice)", i_yoy: "Sur un an (%)",
  b_h: "Croissance par branche", b_help: "Six derniers trimestres publiés. Couleur : rouge = recul, bleu = hausse.", b_col: "Branche",
  a_h: "Croissance annuelle et contributions", a_help: "Comptes annuels 2020–2023 (note 2023) ; 2024 : cumul des quatre trimestres (provisoire). Les barres sont les contributions des secteurs.",
  d_h: "Emplois du PIB (croissance réelle, %)", d_help: "Note sur la croissance 2023.",
  x_h: "Ce que disent les satellites", x_help: "Chaque graphique compare une composante officielle (glissement annuel, %) à son indicateur satellitaire (glissement annuel, %). ρ = corrélation de rang ; « même signe » = part des trimestres où les deux vont dans le même sens. Peu de trimestres : à lire comme un recoupement, pas comme une prévision.",
  x_off: "Officiel (sur un an, %)", x_prx: "Indicateur satellitaire (sur un an, %)", x_rho: "ρ", x_sign: "même signe", x_n: "trimestres",
  n_h: "Ce que disent les notes de l'ANSADE", n_src: "Source",
  meth_m: "Sources et limites", meth_m_txt: `<ul><li><b>Comptes trimestriels</b> — ANSADE : PIB réel corrigé des variations saisonnières, méthode d'étalonnage-calage de Denton (manuel des comptes trimestriels du FMI, 2017). Les tableaux des notes ont été recopiés tels que publiés (une décimale).</li>
    <li><b>Millésimes</b> — la publication la plus récente l'emporte (note T2-2026 > fichier xlsx > note T4-2024). Les révisions peuvent être fortes : 2025T1 passe de −1,8 % à −3,0 %.</li>
    <li><b>Recoupements satellitaires</b> — les lumières mesurent l'éclairage nocturne, le NO₂ la combustion, le NDVI la vigueur de la végétation, PortWatch les tonnages estimés à partir des positions AIS : aucun ne mesure la valeur ajoutée.</li></ul>`,
  // agriculture
  ag_lede: "La vigueur de la végétation sur les zones cultivées, mesurée par le NDVI (indice de végétation par différence normalisée), est un indicateur avancé des récoltes : la saison des pluies (juillet–octobre) décide de l'essentiel de la production pluviale. Les courbes comparent l'année en cours à l'année précédente et à la moyenne de long terme.",
  ag_freq: "Fréquence", f_M: "Mensuelle", f_Q: "Trimestrielle", f_A: "Annuelle", ag_var: "Variable", v_ndvi: "NDVI", v_anom: "Anomalie (%)",
  ag_view: "Vue", vw_season: "Saisonnière (années superposées)", vw_ts: "Série temporelle", ag_base: "Référence", b_lta: "Moyenne de long terme", b_10: "Moyenne des 10 dernières années",
  ag_years: "Années affichées", ag_lta: "Moyenne de long terme", ag_10: "Moyenne 10 ans", ag_country: "Moyenne nationale (zones cultivées)",
  ag_panels: "Par région (wilaya)", ag_top: "culture principale", ag_crops_h: "Cultures principales par région", ag_crops_cols: ["Région", "Culture principale", "Autres cultures", "Système"],
  months: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."], quarters: ["T1", "T2", "T3", "T4"],
  ag_y: "NDVI", ag_ya: "Écart à la référence (%)",
  el_h: "NDVI et croissance : élasticités", el_a: "Valeur ajoutée agricole (Banque mondiale) et NDVI de saison, variations annuelles", el_a_help: "Chaque point est une année : variation (log, %) de la valeur ajoutée agricole (agriculture, élevage, pêche, forêt) contre celle du NDVI de juillet–octobre. La pente est l'élasticité.",
  el_x: "NDVI de saison, variation (%)", el_yy: "Valeur ajoutée agricole, variation (%)", el_fit: "Ajustement",
  el_q: "PIB trimestriel et NDVI : élasticité selon le décalage", el_q_help: "Glissement annuel du PIB (indice ANSADE) sur le glissement annuel du NDVI national, décalé de 0 à 3 trimestres (MCO, erreurs HAC). Barres d'erreur : ±1,96 écart-type.",
  el_lag: "Décalage (trimestres)", el_beta: "Élasticité", el_ansade: "Agriculture (ANSADE) et NDVI de saison", el_ansade_cols: ["Année", "Agriculture, croissance réelle (%)", "NDVI de saison, variation (%)"],
  el_txt: (a) => `Élasticité de la valeur ajoutée agricole au NDVI de saison : <b>${dec(a.beta, 2)}</b> (écart-type ${dec(a.se, 2)}, p = ${dec(a.p, 2)}, R² = ${dec(a.r2, 2)}, ${a.n} années, ${a.years[0]}–${a.years[1]}) : une saison 10 % plus verte va de pair avec une valeur ajoutée agricole ${dec(10 * a.beta, 1)} % plus élevée. Effet décalé d'un an : ${dec(a.beta_l1, 2)} (p = ${dec(a.p_l1, 2)}).`,
  ag_meth_h: "Données et limites", ag_meth: (s) => `<ul><li><b>NDVI</b> — moyenne décadaire sur les zones cultivées de chaque wilaya (capteurs METOP/AVHRR, depuis 1984), avec la moyenne de long terme de la même décade fournie avec les données (${esc(s)}). Moyenne nationale = moyenne simple des wilayas.</li>
    <li><b>Tendance</b> — le NDVI du Sahel augmente depuis les années 1980 (reverdissement, changements de capteurs) : par rapport à la moyenne de long terme, les années récentes paraissent presque toujours « vertes ». La référence « 10 dernières années » corrige ce biais.</li>
    <li><b>Ce que le NDVI ne voit pas</b> — les cultures irriguées et de décrue du fleuve (riz du Trarza, du Brakna, du Gorgol) dépendent de la crue et de l'irrigation plus que de la pluie ; l'élevage et la pêche pèsent plus que les cultures dans le PIB agricole.</li></ul>`,
  // zones
  z_lede: "Où se fait l'activité ? Les lumières nocturnes et le dioxyde d'azote (NO₂) sont mesurés séparément sur les sites extractifs, les zones industrielles, les ports et le reste du pays, chaque mois depuis 2014 (NO₂ : depuis mi-2018).",
  z_ind: "Indicateur", z_ntl: "Lumières nocturnes", z_no2: "NO₂", z_src: "Lumières", z_viirs: "VIIRS (mensuel)", z_bm: "Black Marble (quotidien)",
  z_freq: "Fréquence", z_view: "Affichage", z_idx: "Indice (1re année complète = 100)", z_yoy: "Variation sur un an (%)", z_lvl: "Niveau",
  z_main: "Évolution par zone", z_main_help: "Cliquer sur une zone de la légende pour la masquer. Indice : 100 = moyenne de la première année complète de la zone.",
  z_panels: "Lumières et NO₂, zone par zone", z_panels_help: "Pour chaque groupe de zones : lumières (source choisie) et NO₂, en indice. Une hausse du NO₂ sans hausse des lumières signale plutôt de la combustion (groupes électrogènes, trafic, fours) que de l'éclairage.",
  z_site: "Un site en particulier", z_site_lab: "Site", z_map: "Carte des zones", z_map_help: "Rouge : sites extractifs ; or : zones industrielles ; bleu : zones portuaires.",
  z_share_h: "Poids des zones dans la lumière du pays", z_share_cols: ["Zone", "Surface (km²)", "Part de la lumière", "Variation sur un an"],
  z_meth_h: "Méthode et limites", z_meth: `<ul><li><b>Zones</b> — sites miniers (liste établie, cercles de 3 à 8 km, coordonnées approximatives), zones industrielles candidates (onglet Zones industrielles, hors celles qui touchent une mine), cercles de 3 km autour des ports (PortWatch) ; « pays hors… » = différence géométrique.</li>
    <li><b>VIIRS</b> — composites mensuels VCMSLCFG nettoyés comme la série nationale (couverture sans nuages, valeurs négatives, pics, fond, pixels nuageux remplacés par leur valeur annuelle). <b>Black Marble</b> — moyenne des nuits claires de bonne qualité du mois (VNP46A2, corrigé de l'angle de vue et de la lune), sur les pixels éclairés du composite annuel.</li>
    <li><b>NO₂</b> — colonne troposphérique Sentinel-5P (moyenne mensuelle, ~5 km) : sensible aux nuages et au vent ; à lire en tendance.</li>
    <li>Trimestres et années = moyennes des mois (périodes complètes seulement) ; les mois couverts à moins de 50 % sont écartés.</li></ul>`,
  // ports
  p_lede: "Le trafic des ports mauritaniens vu par les positions des navires (AIS) : escales et tonnages importés et exportés estimés chaque jour par le FMI (PortWatch), par type de navire.",
  p_k_imp: "Importations", p_k_exp: "Exportations", p_k_calls: "Escales", p_k_ports: "Ports suivis",
  p_meas: "Mesure", p_imp: "Importations (t)", p_exp: "Exportations (t)", p_calls: "Escales", p_by: "Détail", p_vessel: "Par type de navire", p_port: "Par port",
  p_main: "Commerce maritime", p_main_help: "Tonnages estimés (tonnes métriques) ou nombre d'escales ; en vue « variation », glissement annuel du total.",
  p_tab: "Ports", p_cols: ["Port", "Escales (total)", "Part des importations maritimes", "Part des exportations maritimes", "Principales marchandises"],
  p_lights: "Lumières de la zone portuaire et escales", p_lights_help: "Lumières nocturnes (VIIRS) dans un cercle de 3 km autour du port, comparées aux escales du même mois.",
  p_meth_h: "Méthode et limites", p_meth: `<ul><li><b>PortWatch</b> (FMI et Université d'Oxford) — escales détectées à partir des positions AIS des navires ; tonnages estimés à partir du tirant d'eau et de la capacité des navires (Arslanalp, Koepke et Verschuur, 2021).</li>
    <li>Ce sont des volumes, pas des valeurs ; la pêche et le cabotage ne sont pas couverts ; les données récentes sont révisées.</li>
    <li>Les exportations de Nouadhibou sont dominées par le minerai de fer de la SNIM (vrac sec).</li></ul>`,
  t_k: "kt",
} : {
  na: "Data not available: run the matching section of the notebook, then the export (section 17).",
  m_lede: "What ANSADE's quarterly national accounts say, and what the satellites say about it. Official figures come from the published growth notes; satellite indicators (lights, NO₂, NDVI, port traffic) serve as quarter-by-quarter cross-checks.",
  k_qoq: "Real GDP, q/q", k_yoy: "Real GDP, y/y", k_xg: "Excluding gas, y/y", k_y: "Annual growth",
  c_h: "Contributions of sectors to GDP growth", c_help: "Bars: contribution of each sector (percentage points); line: GDP growth. 2023–2024: Q4-2024 note; 2025–2026: Q2-2026 note (different vintages).",
  c_qoq: "Quarter on quarter (SA)", c_yoy: "Year on year", c_y: "Percentage points", gdp: "GDP growth",
  sec: { primary: "Primary sector", secondary: "Secondary sector", tertiary: "Tertiary sector", taxes: "Net taxes on products" },
  g_h: "Quarterly GDP since 2014", g_help: "Bars: quarter-on-quarter change (SA); line: year on year (official when published, otherwise from the chained index). Diamonds: previous vintage (revisions).",
  g_bar: "Quarter on quarter", g_line: "Year on year", g_prev: "Previous vintage", g_y: "%",
  i_h: "Industrial production index (IPI)", i_help: "ANSADE quarterly index and its year-on-year change.", i_idx: "IPI (index)", i_yoy: "Year on year (%)",
  b_h: "Growth by branch", b_help: "Last six published quarters. Colour: red = decline, blue = increase.", b_col: "Branch",
  a_h: "Annual growth and contributions", a_help: "Annual accounts 2020–2023 (2023 note); 2024: sum of the four quarters (preliminary). Bars are sector contributions.",
  d_h: "Uses of GDP (real growth, %)", d_help: "2023 growth note.",
  x_h: "What the satellites say", x_help: "Each chart sets an official component (y/y, %) against its satellite proxy (y/y, %). ρ = rank correlation; “same sign” = share of quarters where both move the same way. Few quarters: read as a cross-check, not a forecast.",
  x_off: "Official (y/y, %)", x_prx: "Satellite proxy (y/y, %)", x_rho: "ρ", x_sign: "same sign", x_n: "quarters",
  n_h: "What ANSADE's notes say", n_src: "Source",
  meth_m: "Sources and limits", meth_m_txt: `<ul><li><b>Quarterly accounts</b> — ANSADE: real GDP, seasonally adjusted, Denton benchmarking (IMF Quarterly National Accounts Manual, 2017). The notes' tables are transcribed as published (one decimal).</li>
    <li><b>Vintages</b> — the latest publication wins (Q2-2026 note > xlsx file > Q4-2024 note). Revisions can be large: 2025Q1 moved from −1.8% to −3.0%.</li>
    <li><b>Satellite cross-checks</b> — lights measure night-time lighting, NO₂ combustion, NDVI vegetation vigour, PortWatch tonnage estimated from AIS ship positions: none measures value added.</li></ul>`,
  ag_lede: "Vegetation vigour over cropland, measured by NDVI (normalised difference vegetation index), is a leading indicator of harvests: the rainy season (July–October) decides most rainfed output. Lines compare the current year with the previous year and the long-term average.",
  ag_freq: "Frequency", f_M: "Monthly", f_Q: "Quarterly", f_A: "Yearly", ag_var: "Variable", v_ndvi: "NDVI", v_anom: "Anomaly (%)",
  ag_view: "View", vw_season: "Seasonal (years overlaid)", vw_ts: "Time series", ag_base: "Baseline", b_lta: "Long-term average", b_10: "Last 10 years' average",
  ag_years: "Years shown", ag_lta: "Long-term average", ag_10: "10-year average", ag_country: "National average (cropland)",
  ag_panels: "By region (wilaya)", ag_top: "main crop", ag_crops_h: "Main crops by region", ag_crops_cols: ["Region", "Main crop", "Other crops", "System"],
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], quarters: ["Q1", "Q2", "Q3", "Q4"],
  ag_y: "NDVI", ag_ya: "Difference from baseline (%)",
  el_h: "NDVI and growth: elasticities", el_a: "Agricultural value added (World Bank) and growing-season NDVI, annual changes", el_a_help: "Each dot is a year: change (log, %) in agricultural value added (crops, livestock, fishing, forestry) against the change in July–October NDVI. The slope is the elasticity.",
  el_x: "Growing-season NDVI, change (%)", el_yy: "Agricultural value added, change (%)", el_fit: "Fit",
  el_q: "Quarterly GDP and NDVI: elasticity by lag", el_q_help: "Year-on-year GDP growth (ANSADE index) on year-on-year national NDVI growth, lagged 0 to 3 quarters (OLS, HAC errors). Error bars: ±1.96 s.e.",
  el_lag: "Lag (quarters)", el_beta: "Elasticity", el_ansade: "Agriculture (ANSADE) and growing-season NDVI", el_ansade_cols: ["Year", "Agriculture, real growth (%)", "Growing-season NDVI, change (%)"],
  el_txt: (a) => `Elasticity of agricultural value added to growing-season NDVI: <b>${dec(a.beta, 2)}</b> (s.e. ${dec(a.se, 2)}, p = ${dec(a.p, 2)}, R² = ${dec(a.r2, 2)}, ${a.n} years, ${a.years[0]}–${a.years[1]}): a season 10% greener goes with ${dec(10 * a.beta, 1)}% more agricultural value added. One-year lagged effect: ${dec(a.beta_l1, 2)} (p = ${dec(a.p_l1, 2)}).`,
  ag_meth_h: "Data and limits", ag_meth: (s) => `<ul><li><b>NDVI</b> — dekadal mean over the cropland of each wilaya (METOP/AVHRR sensors, since 1984), with the long-term average of the same dekad supplied with the data (${esc(s)}). National average = simple mean of the wilayas.</li>
    <li><b>Trend</b> — Sahel NDVI has risen since the 1980s (re-greening, sensor changes): against the long-term average, recent years look “green” almost every time. The “last 10 years” baseline corrects this bias.</li>
    <li><b>What NDVI misses</b> — irrigated and flood-recession crops along the river (rice in Trarza, Brakna, Gorgol) depend on the flood and irrigation more than on rain; livestock and fishing weigh more than crops in agricultural GDP.</li></ul>`,
  z_lede: "Where does activity happen? Night-time lights and nitrogen dioxide (NO₂) are measured separately over extractive sites, industrial zones, ports and the rest of the country, every month since 2014 (NO₂: since mid-2018).",
  z_ind: "Indicator", z_ntl: "Night lights", z_no2: "NO₂", z_src: "Lights", z_viirs: "VIIRS (monthly)", z_bm: "Black Marble (daily)",
  z_freq: "Frequency", z_view: "Display", z_idx: "Index (first full year = 100)", z_yoy: "Year-on-year change (%)", z_lvl: "Level",
  z_main: "Trend by zone", z_main_help: "Click a zone in the legend to hide it. Index: 100 = mean of the zone's first complete year.",
  z_panels: "Lights and NO₂, zone by zone", z_panels_help: "For each zone group: lights (chosen source) and NO₂, as indices. NO₂ rising without lights points to combustion (generators, traffic, kilns) rather than lighting.",
  z_site: "One site", z_site_lab: "Site", z_map: "Map of the zones", z_map_help: "Red: extractive sites; gold: industrial zones; blue: port areas.",
  z_share_h: "Weight of the zones in the country's light", z_share_cols: ["Zone", "Area (km²)", "Share of light", "Year-on-year change"],
  z_meth_h: "Method and limits", z_meth: `<ul><li><b>Zones</b> — mining sites (curated list, 3–8 km circles, approximate coordinates), candidate industrial zones (Industrial zones tab, minus those touching a mine), 3 km circles around ports (PortWatch); “country excl.” = geometric difference.</li>
    <li><b>VIIRS</b> — monthly VCMSLCFG composites cleaned like the national series (cloud-free coverage, negatives, spikes, background, cloudy pixels imputed with their annual value). <b>Black Marble</b> — mean of the month's high-quality clear nights (VNP46A2, view-angle and moonlight corrected), over pixels lit in the annual composite.</li>
    <li><b>NO₂</b> — Sentinel-5P tropospheric column (monthly mean, ~5 km): sensitive to clouds and wind; read as a trend.</li>
    <li>Quarters and years = means of months (complete periods only); months with < 50% coverage are dropped.</li></ul>`,
  p_lede: "Traffic in Mauritania's ports seen through ship positions (AIS): port calls and import/export tonnage estimated daily by the IMF (PortWatch), by vessel type.",
  p_k_imp: "Imports", p_k_exp: "Exports", p_k_calls: "Port calls", p_k_ports: "Ports tracked",
  p_meas: "Measure", p_imp: "Imports (t)", p_exp: "Exports (t)", p_calls: "Port calls", p_by: "Breakdown", p_vessel: "By vessel type", p_port: "By port",
  p_main: "Seaborne trade", p_main_help: "Estimated tonnage (metric tonnes) or number of port calls; in “change” view, year-on-year change of the total.",
  p_tab: "Ports", p_cols: ["Port", "Port calls (total)", "Share of maritime imports", "Share of maritime exports", "Main goods"],
  p_lights: "Port-area lights and port calls", p_lights_help: "Night lights (VIIRS) within 3 km of the port, against port calls in the same month.",
  p_meth_h: "Method and limits", p_meth: `<ul><li><b>PortWatch</b> (IMF and University of Oxford) — port calls detected from AIS ship positions; tonnage estimated from draught and vessel capacity (Arslanalp, Koepke and Verschuur, 2021).</li>
    <li>These are volumes, not values; fishing and coastal shipping are not covered; recent data are revised.</li>
    <li>Nouadhibou's exports are dominated by SNIM iron ore (dry bulk).</li></ul>`,
  t_k: "kt",
};

/* ==================================================================== GROWTH (official) */
RENDER.macro = () => {
  const sec = $("#page-macro"), m = S.d.macro;
  if (!m) { empty(sec, T.na); return; }
  sec.innerHTML = `<p class="lede">${esc(T.m_lede)}</p><div class="kpis" id="m-kpis"></div>
    <article class="card"><h2>${esc(T.c_h)}</h2><p class="help">${esc(T.c_help)}</p>${seg("m-ckind", [["qoq", T.c_qoq], ["yoy", T.c_yoy]], "qoq")}<div class="chart tall" id="m-contrib"></div><p class="source">ANSADE</p></article>
    <div class="grid two">
      <article class="card"><h2>${esc(T.g_h)}</h2><p class="help">${esc(T.g_help)}</p><div class="chart" id="m-gdp"></div></article>
      <article class="card"><h2>${esc(T.i_h)}</h2><p class="help">${esc(T.i_help)}</p><div class="chart" id="m-ipi"></div></article></div>
    <article class="card"><h2>${esc(T.b_h)}</h2><p class="help">${esc(T.b_help)}</p>${seg("m-bkind", [["qoq", T.c_qoq], ["yoy", T.c_yoy]], "yoy")}<div class="table-wrap"><table class="data" id="m-branch"></table></div></article>
    <div class="grid two">
      <article class="card"><h2>${esc(T.a_h)}</h2><p class="help">${esc(T.a_help)}</p><div class="chart" id="m-annual"></div></article>
      <article class="card"><h2>${esc(T.d_h)}</h2><p class="help">${esc(T.d_help)}</p><div class="table-wrap"><table class="data" id="m-demand"></table></div></article></div>
    <h2 class="section-title">${esc(T.x_h)}</h2><p class="help">${esc(T.x_help)}</p><div class="grid two" id="m-pairs"></div>
    <article class="card prose"><h2>${esc(T.n_h)}</h2><div id="m-narr"></div></article>
    <article class="card prose"><h2>${esc(T.meth_m)}</h2>${T.meth_m_txt}<p class="source">${(m.sources || []).filter(Boolean).map(esc).join(" · ")}</p></article>`;
  const c = C(), L = m.latest || {};
  const ann = m.annual || {}, yrs = ann.years || [], gy = (ann.growth || {}).gdp || [];
  $("#m-kpis").innerHTML = kpi(T.k_qoq, pc(L.qoq), qlab(L.quarter)) + kpi(T.k_yoy, pc(L.yoy), qlab(L.quarter)) + kpi(T.k_xg, pc(L.yoy_ex_gas), qlab(L.quarter)) +
    kpi(T.k_y, pc(gy[gy.length - 1]), String(yrs[yrs.length - 1] || ""));
  // contributions
  const drawC = (kind) => {
    const rows = (m.contrib || []).filter((r) => r.kind === kind);
    const qs = [...new Set(rows.map((r) => r.quarter))].sort();
    const val = (b, q) => { const r = rows.find((x) => x.branch === b && x.quarter === q); return r ? r.value : null; };
    const cols = { primary: IMF.green, secondary: IMF.orange, tertiary: IMF.grey, taxes: "#00B0B9" };
    const tr = Object.keys(T.sec).map((b) => ({ type: "bar", x: qs.map(qlab), y: qs.map((q) => val(b, q)), name: T.sec[b], marker: { color: cols[b] },
      text: qs.map((q) => dec(val(b, q))), textposition: "outside", textfont: { size: 9, color: cols[b] }, cliponaxis: false, hovertemplate: "%{x}: %{y:.1f}<extra>" + T.sec[b] + "</extra>" }));
    tr.push({ type: "scatter", mode: "lines+markers+text", x: qs.map(qlab), y: qs.map((q) => val("gdp", q)), name: T.gdp, line: { color: IMF.mid, width: 2.6 },
      marker: { size: 9, color: IMF.mid }, text: qs.map((q) => dec(val("gdp", q)) + (FR ? " %" : "%")), textposition: "top center", textfont: { color: IMF.blue, size: 11 } });
    plot("m-contrib", tr, { barmode: "group", bargap: 0.25, yaxis: { title: { text: T.c_y }, zeroline: true, zerolinecolor: c.ink }, legend: { y: -0.15 }, margin: { b: 70 } });
  };
  onSeg("m-ckind", drawC); drawC("qoq");
  // GDP history
  const g = m.gdp_q || [];
  plot("m-gdp", [
    { type: "bar", x: g.map((r) => qlab(r.quarter)), y: g.map((r) => r.qoq), name: T.g_bar, marker: { color: g.map((r) => (r.qoq < 0 ? IMF.red : IMF.blue)) },
      customdata: g.map((r) => r.source), hovertemplate: "%{x}: %{y:.1f}%<br><span style='font-size:10px'>%{customdata}</span><extra></extra>" },
    { type: "scatter", mode: "lines", x: g.map((r) => qlab(r.quarter)), y: g.map((r) => (isNum(r.yoy) ? r.yoy : r.yoy_chained)), name: T.g_line, line: { color: IMF.gold, width: 2.4 } },
    { type: "scatter", mode: "markers", x: g.filter((r) => isNum(r.prev)).map((r) => qlab(r.quarter)), y: g.filter((r) => isNum(r.prev)).map((r) => r.prev), name: T.g_prev,
      marker: { symbol: "diamond-open", size: 9, color: IMF.navy } },
  ], { yaxis: { title: { text: T.g_y }, zeroline: true, zerolinecolor: c.axis }, xaxis: { type: "category", nticks: 12 }, legend: { y: 1.14 } });
  const ip = m.ipi || [];
  plot("m-ipi", ip.length ? [
    { type: "scatter", mode: "lines", x: ip.map((r) => qlab(r.quarter)), y: ip.map((r) => r.ipi), name: T.i_idx, line: { color: IMF.blue, width: 2.4 } },
    { type: "bar", x: ip.map((r) => qlab(r.quarter)), y: ip.map((r) => r.yoy), name: T.i_yoy, yaxis: "y2", marker: { color: ip.map((r) => (r.yoy < 0 ? "rgba(218,41,28,.45)" : "rgba(94,138,180,.45)")) } },
  ] : [], { yaxis: { title: { text: T.i_idx } }, yaxis2: { overlaying: "y", side: "right", title: { text: T.i_yoy }, showgrid: false, zeroline: true }, xaxis: { type: "category", nticks: 12 }, legend: { y: 1.14 }, margin: { r: 56 } });
  // branch table
  const drawB = (kind) => {
    const src = kind === "qoq" ? m.branch_qoq : m.branch_yoy;
    const qs = [...new Set((src || []).map((r) => r.quarter))].sort().slice(-6);
    const br = m.branches || {};
    const cell = (v) => { if (!isNum(v)) return `<td class="num">–</td>`; const a = Math.min(1, Math.abs(v) / 15);
      const bg = v < 0 ? `rgba(218,41,28,${0.12 + 0.55 * a})` : `rgba(0,76,151,${0.08 + 0.5 * a})`; return `<td class="num" style="background:${bg}">${dec(v)}</td>`; };
    const el = $("#m-branch"); el.classList.add("elec-t");
    el.innerHTML = `<thead><tr><th>${esc(T.b_col)}</th>${qs.map((q) => `<th class="num">${qlab(q)}</th>`).join("")}</tr></thead><tbody>` +
      Object.keys(br).filter((b) => (src || []).some((r) => r.branch === b && qs.includes(r.quarter))).map((b) => {
        const lv = br[b].level, st = lv === 0 ? "font-weight:700" : lv === 2 ? "padding-left:26px;color:var(--ink-2)" : "padding-left:12px";
        return `<tr><td style="${st}">${esc(br[b].label)}</td>${qs.map((q) => cell(((src || []).find((r) => r.branch === b && r.quarter === q) || {}).value)).join("")}</tr>`; }).join("") + "</tbody>";
  };
  onSeg("m-bkind", drawB); drawB("yoy");
  // annual
  const ac = ann.contrib || {}, cols = { primary: IMF.green, secondary: IMF.orange, tertiary: IMF.grey, taxes: "#00B0B9" };
  plot("m-annual", yrs.length ? Object.keys(T.sec).map((b) => ({ type: "bar", x: yrs.map(String), y: ac[b], name: T.sec[b], marker: { color: cols[b] } }))
    .concat([{ type: "scatter", mode: "lines+markers+text", x: yrs.map(String), y: gy, name: T.gdp, line: { color: IMF.blue, width: 2.6 }, text: gy.map((v) => pc(v)), textposition: "top center" }]) : [],
    { barmode: "relative", yaxis: { title: { text: T.c_y }, zeroline: true, zerolinecolor: c.ink }, legend: { y: -0.18 }, margin: { b: 70 } });
  const dm = ann.demand || {}, dy = ann.demand_years || [];
  const de = $("#m-demand"); de.classList.add("elec-t");
  de.innerHTML = `<thead><tr><th></th>${dy.map((y) => `<th class="num">${y}</th>`).join("")}</tr></thead><tbody>` +
    Object.entries(dm).map(([k, v]) => `<tr><td>${esc(k)}</td>${v.map((x) => `<td class="num" style="color:${x < 0 ? IMF.red : "inherit"}">${dec(x)}</td>`).join("")}</tr>`).join("") + "</tbody>";
  // satellite pairs
  const pairs = m.pairs || [];
  $("#m-pairs").innerHTML = pairs.length ? pairs.map((p, i) => `<article class="card"><h3 style="margin:0 0 4px;font-size:1rem">${esc(FR ? p.official_fr : p.official_en)} <span class="why">vs</span> ${esc(FR ? p.proxy_fr : p.proxy_en)}</h3>
    <p class="help">${esc(T.x_rho)} = ${p.spearman === null ? "–" : dec(p.spearman, 2)} · ${esc(T.x_sign)} ${Math.round(100 * p.sign_agree)}% · ${p.n} ${esc(T.x_n)}${p.note ? " · " + esc(p.note) : ""}</p><div class="chart short" id="m-pair-${i}"></div></article>`).join("")
    : `<article class="card"><p class="help">${esc(T.na)}</p></article>`;
  pairs.forEach((p, i) => plot(`m-pair-${i}`, [
    { type: "bar", x: p.rows.map((r) => qlab(r.quarter)), y: p.rows.map((r) => r.official), name: T.x_off, marker: { color: IMF.blue } },
    { type: "scatter", mode: "lines+markers", x: p.rows.map((r) => qlab(r.quarter)), y: p.rows.map((r) => r.proxy), name: T.x_prx, yaxis: "y2", line: { color: IMF.red, width: 2 } },
  ], { yaxis: { title: { text: "%" }, zeroline: true, zerolinecolor: c.axis }, yaxis2: { overlaying: "y", side: "right", showgrid: false, zeroline: false }, xaxis: { type: "category" },
    legend: { y: 1.2, font: { size: 10 } }, margin: { t: 10, r: 40, b: 36 } }));
  $("#m-narr").innerHTML = (m.narrative || []).map((n) => `<h3>${esc(qlab(n.period))}</h3><ul>${n.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="source">${esc(T.n_src)}${COLON}${esc(n.source)}</p>`).join("");
};

/* ==================================================================== AGRICULTURE (NDVI) */
RENDER.agri = () => {
  const sec = $("#page-agri"), a = S.d.agri;
  if (!a) { empty(sec, T.na); return; }
  const st = { f: "M", v: "ndvi", vw: "season", base: "lta", years: null };
  sec.innerHTML = `<p class="lede">${esc(T.ag_lede)}</p>
    <div class="card"><div class="map-toolbar" style="flex-wrap:wrap;gap:10px 18px">
      <label class="ctl">${esc(T.ag_freq)} ${seg("ag-f", [["M", T.f_M], ["Q", T.f_Q], ["A", T.f_A]], "M")}</label>
      <label class="ctl">${esc(T.ag_var)} ${seg("ag-v", [["ndvi", T.v_ndvi], ["anom", T.v_anom]], "ndvi")}</label>
      <label class="ctl">${esc(T.ag_view)} ${seg("ag-vw", [["season", T.vw_season], ["ts", T.vw_ts]], "season")}</label>
      <label class="ctl">${esc(T.ag_base)} ${seg("ag-b", [["lta", T.b_lta], ["r10", T.b_10]], "lta")}</label></div>
      <div class="ctl" style="flex-wrap:wrap" id="ag-years-wrap">${esc(T.ag_years)}${COLON}<span id="ag-years" style="display:inline-flex;flex-wrap:wrap;gap:4px 10px"></span></div>
      <h2 style="margin-top:6px">${esc(T.ag_country)}</h2><div class="chart" id="ag-country"></div><p class="source">${esc(a.source)} · ${FR ? "dernière décade" : "last dekad"} ${esc(a.last_date)}</p></div>
    <h2 class="section-title">${esc(T.ag_panels)}</h2><div class="grid two" id="ag-panels"></div>
    <article class="card"><h2>${esc(T.ag_crops_h)}</h2><div class="table-wrap"><table class="data" id="ag-crops"></table></div><p class="source">${(a.crop_sources || []).map(esc).join(" · ")}</p></article>
    <h2 class="section-title">${esc(T.el_h)}</h2>
    <div class="grid two"><article class="card"><h2>${esc(T.el_a)}</h2><p class="help">${esc(T.el_a_help)}</p><div class="chart" id="ag-el-a"></div><p class="help" id="ag-el-txt"></p></article>
      <article class="card"><h2>${esc(T.el_q)}</h2><p class="help">${esc(T.el_q_help)}</p><div class="chart" id="ag-el-q"></div>
        <h3 style="font-size:.95rem">${esc(T.el_ansade)}</h3><div class="table-wrap"><table class="data" id="ag-el-ansade"></table></div></article></div>
    <article class="card prose"><h2>${esc(T.ag_meth_h)}</h2>${T.ag_meth(a.source)}</article>`;
  const subs = { M: 12, Q: 4, A: 1 }, xl = { M: T.months, Q: T.quarters, A: [""] };
  const allYears = [...new Set(a.series.M.Country.year)].sort((x, y) => x - y);
  st.years = new Set([a.latest_year, a.prev_year]);
  const extra = new Set(["lta"]);
  const yearCol = (y, i) => (y === a.latest_year ? IMF.red : y === a.prev_year ? IMF.blue : PAL[(i + 2) % PAL.length]);
  const drawYears = () => {
    $("#ag-years").innerHTML = [["lta", T.ag_lta], ["r10", T.ag_10]].map(([k, l]) => `<label><input type="checkbox" data-x="${k}" ${extra.has(k) ? "checked" : ""}> ${esc(l)}</label>`).join("") +
      allYears.slice().reverse().map((y) => `<label><input type="checkbox" data-y="${y}" ${st.years.has(y) ? "checked" : ""}> ${y}</label>`).join("");
    $("#ag-years").onchange = (e) => { const t = e.target; if (t.dataset.y) { const y = +t.dataset.y; t.checked ? st.years.add(y) : st.years.delete(y); }
      if (t.dataset.x) { t.checked ? extra.add(t.dataset.x) : extra.delete(t.dataset.x); } draw(); };
  };
  // baseline per sub-period: provider LTA (mean of the period's lta) or mean of the last 10 complete years
  const base = (s) => { const n = subs[st.f], out = { lta: Array(n).fill(null), r10: Array(n).fill(null) };
    for (let k = 1; k <= n; k++) {
      const idx = s.sub.map((v, i) => (v === k ? i : -1)).filter((i) => i >= 0);
      const l = idx.map((i) => s.lta[i]).filter(isNum); out.lta[k - 1] = l.length ? l.reduce((p, q) => p + q, 0) / l.length : null;
      const r = idx.filter((i) => s.complete[i] && s.year[i] < a.latest_year && s.year[i] >= a.latest_year - 10).map((i) => s.ndvi[i]).filter(isNum);
      out.r10[k - 1] = r.length ? r.reduce((p, q) => p + q, 0) / r.length : null; }
    return out; };
  const traces = (reg, small) => {
    const s = a.series[st.f][reg]; if (!s) return [];
    const b = base(s), bl = b[st.base], n = subs[st.f];
    const val = (i) => { const v = s.ndvi[i]; if (!isNum(v)) return null; if (st.v === "ndvi") return v; const r = bl[s.sub[i] - 1]; return isNum(r) && r > 0 ? 100 * (v / r - 1) : null; };
    const tr = [];
    if (st.vw === "season" && st.f !== "A") {
      [...st.years].sort((x, y) => x - y).forEach((y, i) => { const idx = s.year.map((v, j) => (v === y ? j : -1)).filter((j) => j >= 0);
        tr.push({ x: idx.map((j) => xl[st.f][s.sub[j] - 1]), y: idx.map(val), name: String(y), mode: "lines+markers", showlegend: !small,
          line: { color: yearCol(y, i), width: y === a.latest_year ? 3 : 2 }, marker: { size: small ? 3 : 5 } }); });
      [["lta", T.ag_lta, IMF.grey, "dash"], ["r10", T.ag_10, IMF.gold, "dot"]].forEach(([k, l, col, da]) => { if (!extra.has(k)) return;
        const y = b[k].map((v, i) => (st.v === "ndvi" ? v : isNum(v) && isNum(bl[i]) && bl[i] > 0 ? 100 * (v / bl[i] - 1) : null));
        tr.push({ x: xl[st.f].slice(0, n), y, name: l, mode: "lines", showlegend: !small, line: { color: col, width: 2.2, dash: da } }); });
    } else {
      const xs = s.year.map((y, i) => (st.f === "M" ? `${y}-${String(s.sub[i]).padStart(2, "0")}-15` : st.f === "Q" ? `${y}-${String(3 * s.sub[i] - 1).padStart(2, "0")}-15` : `${y}-07-01`));
      if (st.v === "anom") tr.push({ type: "bar", x: xs, y: s.ndvi.map((_, i) => val(i)), name: T.v_anom, showlegend: false,
        marker: { color: s.ndvi.map((_, i) => (val(i) < 0 ? IMF.red : IMF.blue)) } });
      else { tr.push({ x: xs, y: s.ndvi, name: T.v_ndvi, mode: "lines", showlegend: !small, line: { color: IMF.blue, width: small ? 1.2 : 1.6 } });
        if (extra.has("lta")) tr.push({ x: xs, y: s.sub.map((k) => b.lta[k - 1]), name: T.ag_lta, mode: "lines", showlegend: !small, line: { color: IMF.grey, dash: "dash", width: 1.2 } }); }
    }
    return tr;
  };
  const lay = (small) => ({ yaxis: { title: { text: st.v === "ndvi" ? T.ag_y : T.ag_ya }, zeroline: st.v !== "ndvi", zerolinecolor: C().axis },
    xaxis: st.vw === "season" && st.f !== "A" ? { type: "category" } : { type: "date" }, margin: small ? { t: 8, b: 34, l: 50, r: 8 } : undefined, legend: { y: 1.16 } });
  const draw = () => {
    plot("ag-country", traces("Country", false), lay(false));
    (a.regions || []).filter((r) => r !== "Country").forEach((r, i) => plot(`ag-p-${i}`, traces(r, true), lay(true)));
  };
  $("#ag-panels").innerHTML = (a.regions || []).filter((r) => r !== "Country").map((r, i) => { const cr = (a.crops || {})[r] || {};
    return `<article class="card"><h3 style="margin:0;font-size:1rem">${esc(r)}</h3><p class="help" style="margin:2px 0 4px">${esc(T.ag_top)}${COLON}<b>${esc(cr.top || "–")}</b>${cr.others ? " · " + esc(cr.others) : ""}</p><div class="chart short" id="ag-p-${i}"></div></article>`; }).join("");
  const ct = $("#ag-crops"); ct.classList.add("elec-t");
  ct.innerHTML = `<thead><tr>${T.ag_crops_cols.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>` +
    Object.entries(a.crops || {}).map(([r, v]) => `<tr><td>${esc(r)}</td><td><b>${esc(v.top)}</b></td><td class="wide">${esc(v.others)}</td><td class="wide">${esc(v.system)}</td></tr>`).join("") + "</tbody>";
  onSeg("ag-f", (k) => { st.f = k; $("#ag-vw button[data-k=season]").disabled = k === "A"; draw(); });
  onSeg("ag-v", (k) => { st.v = k; draw(); }); onSeg("ag-vw", (k) => { st.vw = k; draw(); }); onSeg("ag-b", (k) => { st.base = k; draw(); });
  drawYears(); draw();
  // elasticities
  const E = a.elasticity || {}, an = E.annual;
  if (an && an.points) {
    const pts = an.points, xs = pts.map((p) => p.dndvi), mn = Math.min(...xs), mx = Math.max(...xs);
    const my = pts.reduce((s, p) => s + p.dva, 0) / pts.length, mxx = xs.reduce((s, v) => s + v, 0) / xs.length;
    const icpt = my - an.beta * mxx;
    plot("ag-el-a", [{ type: "scatter", mode: "markers+text", x: xs, y: pts.map((p) => p.dva), text: pts.map((p) => String(p.year).slice(2)), textposition: "top center",
      textfont: { size: 9 }, marker: { color: IMF.blue, size: 8 }, name: FR ? "Années" : "Years", hovertemplate: "%{customdata}: NDVI %{x:.1f}%, VA %{y:.1f}%<extra></extra>", customdata: pts.map((p) => p.year) },
      { type: "scatter", mode: "lines", x: [mn, mx], y: [icpt + an.beta * mn, icpt + an.beta * mx], name: T.el_fit, line: { color: IMF.red, width: 2 } }],
      { xaxis: { title: { text: T.el_x }, zeroline: true }, yaxis: { title: { text: T.el_yy }, zeroline: true }, showlegend: false });
    $("#ag-el-txt").innerHTML = T.el_txt(an);
  } else plot("ag-el-a", []);
  const q = E.quarterly || [];
  plot("ag-el-q", q.length ? [{ type: "bar", x: q.map((r) => String(r.lag)), y: q.map((r) => r.beta), marker: { color: q.map((r) => (r.p < 0.1 ? IMF.blue : IMF.grey)) },
    error_y: { type: "data", array: q.map((r) => 1.96 * r.se), color: IMF.navy }, customdata: q.map((r) => [r.p, r.n]), hovertemplate: "lag %{x}: %{y:.3f} (p = %{customdata[0]:.2f}, n = %{customdata[1]})<extra></extra>", showlegend: false }] : [],
    { xaxis: { title: { text: T.el_lag }, type: "category" }, yaxis: { title: { text: T.el_beta }, zeroline: true, zerolinecolor: C().ink } });
  const at = $("#ag-el-ansade"); at.classList.add("elec-t");
  at.innerHTML = `<thead><tr>${T.el_ansade_cols.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>` +
    (E.ansade_agri || []).map((r) => `<tr><td>${r.year}</td><td class="num">${dec(r.agri_growth)}</td><td class="num">${dec(r.dndvi)}</td></tr>`).join("") + "</tbody>";
};

/* ==================================================================== ACTIVITY BY ZONE */
RENDER.zones = () => {
  const sec = $("#page-zones"), z = S.d.zones;
  if (!z) { empty(sec, T.na); return; }
  const st = { ind: "ntl", src: "viirs", f: "M", view: "idx" };
  const groups = Object.keys(z.groups || {}), col = z.colors || {};
  sec.innerHTML = `<p class="lede">${esc(T.z_lede)}</p>
    <div class="card"><div class="map-toolbar" style="flex-wrap:wrap;gap:10px 18px">
      <label class="ctl">${esc(T.z_ind)} ${seg("z-ind", [["ntl", T.z_ntl], ["no2", T.z_no2]], "ntl")}</label>
      <label class="ctl">${esc(T.z_src)} ${seg("z-src", [["viirs", T.z_viirs], ["bm", T.z_bm]], "viirs")}</label>
      <label class="ctl">${esc(T.z_freq)} ${seg("z-f", [["M", T.f_M], ["Q", T.f_Q], ["A", T.f_A]], "M")}</label>
      <label class="ctl">${esc(T.z_view)} ${seg("z-v", [["idx", T.z_idx], ["yoy", T.z_yoy], ["lvl", T.z_lvl]], "idx")}</label></div>
      <h2>${esc(T.z_main)}</h2><p class="help">${esc(T.z_main_help)}</p><div class="chart tall" id="z-main"></div><p class="source" id="z-src-note"></p></div>
    <h2 class="section-title">${esc(T.z_panels)}</h2><p class="help">${esc(T.z_panels_help)}</p><div class="grid two" id="z-panels"></div>
    <div class="grid two"><article class="card"><h2>${esc(T.z_site)}</h2><label class="ctl">${esc(T.z_site_lab)} <select id="z-site"></select></label><div class="chart" id="z-site-chart"></div></article>
      <article class="card"><h2>${esc(T.z_map)}</h2><p class="help">${esc(T.z_map_help)}</p><div id="zmap" class="elec-map" style="height:360px"></div></article></div>
    <article class="card"><h2>${esc(T.z_share_h)}</h2><div class="table-wrap"><table class="data" id="z-share"></table></div></article>
    <article class="card prose"><h2>${esc(T.z_meth_h)}</h2>${T.z_meth}</article>`;
  const colOf = () => (st.ind === "no2" ? "no2" : st.src === "bm" ? "ntl_bm" : "ntl_viirs");
  const xOf = (p) => (st.f === "M" ? p + "-15" : st.f === "Q" ? `${p.slice(0, 4)}-${String(3 * +p.slice(5) - 1).padStart(2, "0")}-15` : `${p}-07-01`);
  const series = (zone, c) => { const t = (z[st.f] || {})[zone]; if (!t || !t[c]) return { x: [], y: [] };
    const per = t.period, v = t[c];
    if (st.view === "yoy") return { x: per.map(xOf), y: t[c + "_yoy"] || [] };
    if (st.view === "lvl") return { x: per.map(xOf), y: v };
    const yr = per.map((p) => p.slice(0, 4)); const ys = [...new Set(yr)];
    let b = null; for (const y of ys) { const vals = v.filter((x, i) => yr[i] === y && isNum(x)); const need = st.f === "M" ? 12 : st.f === "Q" ? 4 : 1; if (vals.length >= need) { b = vals.reduce((s, q) => s + q, 0) / vals.length; break; } }
    return { x: per.map(xOf), y: v.map((x) => (isNum(x) && b ? (100 * x) / b : null)) }; };
  const ytitle = () => (st.view === "yoy" ? "%" : st.view === "idx" ? (FR ? "Indice" : "Index") : (z.indicators || {})[colOf()] || "");
  const draw = () => {
    const c = colOf();
    plot("z-main", groups.map((g) => { const s = series(g, c); return { x: s.x, y: s.y, name: z.groups[g], mode: "lines", line: { color: col[g], width: g === "country" ? 3 : 2 },
      connectgaps: false, hovertemplate: "%{x|%b %Y}: %{y:.1f}<extra>" + esc(z.groups[g]) + "</extra>" }; }).filter((t) => t.y.some(isNum)),
      { yaxis: { title: { text: ytitle() }, zeroline: st.view === "yoy", zerolinecolor: C().axis }, xaxis: { type: "date" }, legend: { y: 1.12 } });
    $("#z-src-note").textContent = (z.indicators || {})[c] || "";
    const lc = st.src === "bm" ? "ntl_bm" : "ntl_viirs", sv = st.view;
    if (st.view === "lvl") st.view = "idx";
    groups.forEach((g, i) => { const a = series(g, lc), b = series(g, "no2");
      plot(`z-p-${i}`, [{ x: a.x, y: a.y, name: T.z_ntl, mode: "lines", line: { color: col[g] || IMF.blue, width: 2 } },
        { x: b.x, y: b.y, name: T.z_no2, mode: "lines", line: { color: IMF.navy, width: 1.4, dash: "dot" } }].filter((t) => t.y.some(isNum)),
        { yaxis: { title: { text: st.view === "yoy" ? "%" : FR ? "Indice" : "Index" } }, xaxis: { type: "date" }, margin: { t: 8, b: 30, l: 50, r: 8 }, legend: { y: 1.2, font: { size: 10 } } }); });
    st.view = sv; drawSite();
  };
  $("#z-panels").innerHTML = groups.map((g, i) => `<article class="card"><h3 style="margin:0 0 4px;font-size:1rem;color:${col[g]}">${esc(z.groups[g])}</h3><div class="chart short" id="z-p-${i}"></div></article>`).join("");
  const sites = (z.zones || []).filter((r) => r.kind === "site");
  $("#z-site").innerHTML = sites.map((r) => `<option value="${esc(r.zone)}">${esc(r.label)}</option>`).join("");
  const drawSite = () => { const id = $("#z-site").value; if (!id) { plot("z-site-chart", []); return; }
    const a = series(id, colOf()), meta = sites.find((r) => r.zone === id) || {};
    plot("z-site-chart", [{ x: a.x, y: a.y, mode: "lines", name: meta.label, line: { color: col[meta.group] || IMF.blue, width: 2.2 } }],
      { yaxis: { title: { text: ytitle() } }, xaxis: { type: "date" }, showlegend: false }); };
  $("#z-site").onchange = drawSite;
  onSeg("z-ind", (k) => { st.ind = k; $$("#z-src button").forEach((b) => { b.disabled = k === "no2"; b.classList.toggle("off", k === "no2"); }); draw(); });
  onSeg("z-src", (k) => { st.src = k; draw(); }); onSeg("z-f", (k) => { st.f = k; draw(); }); onSeg("z-v", (k) => { st.view = k; draw(); });
  draw();
  // share table (latest complete year, chosen lights source)
  const A = z.A || {}, c0 = "ntl_viirs", ctry = A.country;
  if (ctry && ctry[c0]) {
    let li = -1; ctry[c0].forEach((v, i) => { if (isNum(v)) li = i; });
    const yr = li >= 0 ? ctry.period[li] : null, tot = li >= 0 ? ctry[c0][li] : null;
    const rows = (z.zones || []).filter((r) => r.kind === "group").map((r) => { const t = A[r.zone] || {}; const i = (t.period || []).indexOf(yr);
      const v = i >= 0 ? t[c0][i] : null, g = i >= 0 ? (t[c0 + "_yoy"] || [])[i] : null;
      return `<tr><td><b class="dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${col[r.zone]}"></b> ${esc(r.label)}</td><td class="num">${F.num(r.area_km2)}</td>` +
        `<td class="num">${isNum(v) && tot ? dec((100 * v) / tot, 1) + (FR ? " %" : "%") : "–"}</td><td class="num">${pc(g)}</td></tr>`; });
    const el = $("#z-share"); el.classList.add("elec-t");
    el.innerHTML = `<thead><tr>${T.z_share_cols.map((h, i) => `<th class="${i ? "num" : ""}">${esc(h)}${i === 2 && yr ? " (" + yr + ")" : ""}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody>`;
  }
  if (window.L && S.d.zonesGeo) { try {
    const mp = (S.zmap = newMap("zmap"));
    const l = L.geoJSON(S.d.zonesGeo, { style: (f) => ({ color: col[f.properties.group] || IMF.grey, weight: f.properties.kind === "site" ? 1.4 : 0.8, fillOpacity: 0.35 }),
      onEachFeature: (f, ly) => ly.bindTooltip(esc(f.properties.label), { sticky: true }) }).addTo(mp);
    const bb = l.getBounds(); if (bb.isValid()) mp.fitBounds(bb, { padding: [16, 16] }); setTimeout(() => mp.invalidateSize(), 80);
  } catch (e) { console.error(e); } }
};

/* ==================================================================== PORTS (PortWatch) */
RENDER.ports = () => {
  const sec = $("#page-ports"), p = S.d.ports;
  if (!p) { empty(sec, T.na); return; }
  const st = { f: "M", meas: "import", by: "vessel", view: "lvl" };
  sec.innerHTML = `<p class="lede">${esc(T.p_lede)}</p><div class="kpis" id="p-kpis"></div>
    <div class="card"><div class="map-toolbar" style="flex-wrap:wrap;gap:10px 18px">
      <label class="ctl">${esc(T.p_meas)} ${seg("p-m", [["import", T.p_imp], ["export", T.p_exp], ["portcalls", T.p_calls]], "import")}</label>
      <label class="ctl">${esc(T.p_by)} ${seg("p-by", [["vessel", T.p_vessel], ["port", T.p_port]], "vessel")}</label>
      <label class="ctl">${esc(T.z_freq)} ${seg("p-f", [["M", T.f_M], ["Q", T.f_Q], ["A", T.f_A]], "M")}</label>
      <label class="ctl">${esc(T.z_view)} ${seg("p-v", [["lvl", T.z_lvl], ["yoy", T.z_yoy]], "lvl")}</label></div>
      <h2>${esc(T.p_main)}</h2><p class="help">${esc(T.p_main_help)}</p><div class="chart tall" id="p-main"></div><p class="source">${esc(p.source)} · ${esc(p.last_date)}</p></div>
    <div class="grid two"><article class="card"><h2>${esc(T.p_tab)}</h2><div id="pmap" class="elec-map" style="height:300px"></div><div class="table-wrap"><table class="data" id="p-table"></table></div></article>
      <article class="card"><h2>${esc(T.p_lights)}</h2><p class="help">${esc(T.p_lights_help)}</p><label class="ctl">Port <select id="p-port"></select></label><div class="chart" id="p-lights"></div></article></div>
    <article class="card prose"><h2>${esc(T.p_meth_h)}</h2>${T.p_meth}</article>`;
  const V = p.vessels || {}, vcol = { container: IMF.blue, dry_bulk: IMF.gold, general_cargo: IMF.green, roro: IMF.purple, tanker: IMF.red };
  const M = p.M || [], last = M[M.length - 1] || {}, Y = p.M_yoy || [], ly = Y[Y.length - 1] || {};
  const kt = (v) => (isNum(v) ? F.num(v / 1000) + " " + T.t_k : "–");
  $("#p-kpis").innerHTML = kpi(T.p_k_imp, kt(last.import), `${last.period || ""} · ${pc(ly.import, 0)} ${FR ? "sur un an" : "y/y"}`) +
    kpi(T.p_k_exp, kt(last.export), `${last.period || ""} · ${pc(ly.export, 0)} ${FR ? "sur un an" : "y/y"}`) +
    kpi(T.p_k_calls, F.num(last.portcalls), `${last.period || ""} · ${pc(ly.portcalls, 0)} ${FR ? "sur un an" : "y/y"}`) + kpi(T.p_k_ports, F.num((p.ports || []).length), "PortWatch");
  const xOf = (s) => (st.f === "M" ? s + "-15" : st.f === "Q" ? `${s.slice(0, 4)}-${String(3 * +s.slice(5) - 1).padStart(2, "0")}-15` : `${s}-07-01`);
  const draw = () => {
    const t = p[st.f] || [], ty = p[st.f + "_yoy"] || [];
    if (st.view === "yoy") { plot("p-main", [{ type: "bar", x: ty.map((r) => xOf(r.period)), y: ty.map((r) => r[st.meas]), marker: { color: ty.map((r) => (r[st.meas] < 0 ? IMF.red : IMF.blue)) }, showlegend: false }],
      { yaxis: { title: { text: "%" }, zeroline: true }, xaxis: { type: "date" } }); return; }
    let tr;
    if (st.by === "vessel") tr = Object.keys(V).filter((v) => t.some((r) => isNum(r[`${st.meas}_${v}`]))).map((v) => ({ type: "bar", x: t.map((r) => xOf(r.period)), y: t.map((r) => r[`${st.meas}_${v}`]), name: V[v], marker: { color: vcol[v] } }));
    else { const bp = p.by_port_m || [], names = [...new Set(bp.map((r) => r.portname))];
      const agg = (r) => (st.f === "M" ? r.month : st.f === "Q" ? `${r.month.slice(0, 4)}Q${Math.floor((+r.month.slice(5) - 1) / 3) + 1}` : r.month.slice(0, 4));
      tr = names.map((n, i) => { const m = new Map(); bp.filter((r) => r.portname === n).forEach((r) => { const k = agg(r); m.set(k, (m.get(k) || 0) + (r[st.meas] || 0)); });
        const keys = t.map((r) => r.period); return { type: "bar", x: keys.map(xOf), y: keys.map((k) => m.get(k) ?? null), name: n, marker: { color: PAL[i % PAL.length] } }; }); }
    plot("p-main", tr, { barmode: "stack", yaxis: { title: { text: st.meas === "portcalls" ? T.p_calls : FR ? "Tonnes" : "Tonnes" } }, xaxis: { type: "date" }, legend: { y: 1.12 } });
  };
  onSeg("p-m", (k) => { st.meas = k; draw(); }); onSeg("p-by", (k) => { st.by = k; draw(); }); onSeg("p-f", (k) => { st.f = k; draw(); }); onSeg("p-v", (k) => { st.view = k; draw(); });
  draw();
  const pt = $("#p-table"); pt.classList.add("elec-t");
  pt.innerHTML = `<thead><tr>${T.p_cols.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>` + (p.ports || []).map((r) => `<tr><td><b>${esc(r.portname)}</b></td><td class="num">${F.num(r.vessel_count_total)}</td>` +
    `<td class="num">${isNum(r.share_country_maritime_import) ? dec(r.share_country_maritime_import, 1) + (FR ? " %" : "%") : "–"}</td><td class="num">${isNum(r.share_country_maritime_export) ? dec(r.share_country_maritime_export, 1) + (FR ? " %" : "%") : "–"}</td>` +
    `<td class="wide">${esc([r.industry_top1, r.industry_top2].filter(Boolean).join(", "))}</td></tr>`).join("") + "</tbody>";
  if (window.L) { try { const mp = (S.pmap = newMap("pmap")); const pts = (p.ports || []).filter((r) => isNum(r.lat));
    pts.forEach((r) => L.circle([r.lat, r.lon], { radius: 3000, color: IMF.mid, weight: 1, fillOpacity: 0.25 }).addTo(mp).bindTooltip(esc(r.portname)));
    pts.forEach((r) => L.circleMarker([r.lat, r.lon], { radius: 5, color: "#fff", weight: 1, fillColor: IMF.blue, fillOpacity: 1 }).addTo(mp).bindTooltip(`<strong>${esc(r.portname)}</strong>`));
    if (pts.length) mp.fitBounds(L.latLngBounds(pts.map((r) => [r.lat, r.lon])).pad(0.6)); setTimeout(() => mp.invalidateSize(), 80); } catch (e) { console.error(e); } }
  // port-area lights vs port calls
  const z = S.d.zones, ps = ((z && z.zones) || []).filter((r) => r.group === "ports" && r.kind === "site");
  const sel = $("#p-port"); sel.innerHTML = ps.map((r) => `<option value="${esc(r.zone)}">${esc(r.label)}</option>`).join("");
  const drawL = () => { const id = sel.value; if (!id || !z.M[id]) { plot("p-lights", []); return; }
    const t = z.M[id], nm = (ps.find((r) => r.zone === id) || {}).label || "", bare = nm.replace(/^Port ?: ?/, "");
    const calls = new Map(); (p.by_port_m || []).filter((r) => r.portname === bare).forEach((r) => calls.set(r.month, r.portcalls));
    plot("p-lights", [{ x: t.period.map((s) => s + "-15"), y: t.ntl_viirs, name: FR ? "Lumières (VIIRS)" : "Lights (VIIRS)", mode: "lines", line: { color: IMF.gold, width: 2 } },
      { type: "bar", x: [...calls.keys()].map((s) => s + "-15"), y: [...calls.values()], name: T.p_calls, yaxis: "y2", marker: { color: "rgba(0,76,151,.35)" } }],
      { yaxis: { title: { text: FR ? "Somme des radiances" : "Sum of radiance" } }, yaxis2: { overlaying: "y", side: "right", title: { text: T.p_calls }, showgrid: false }, xaxis: { type: "date" }, legend: { y: 1.14 }, margin: { r: 56 } }); };
  sel.onchange = drawL; drawL();
};
})();
