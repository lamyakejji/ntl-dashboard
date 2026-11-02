/* Electricity grid & power-outage pages — shared by the EN and FR sites (language from <html lang>).
 * Uses the helpers of app.js (S, $, $$, F, esc, plot, C, css, isNum, newMap, overlay, showLayer, mapBounds, RENDER).
 * Data: grid.json, grid_lines.geojson, grid_points.geojson, outages.json, outage_units.geojson, news.json. */
"use strict";
(() => {
const FR = (document.documentElement.lang || "en").toLowerCase().startsWith("fr");
const T = FR ? {
  na: "Données non disponibles pour ce pays ou cette période (relancer les sections 08 et 10 du notebook, puis la section 12).",
  g_lede: "Où passe le réseau électrique, quels investissements datés ont eu lieu, et les lumières des villes ont-elles changé ensuite ? La géométrie vient d'OpenStreetMap (non datée) ; les dates viennent d'un tableau d'événements sourcés.",
  k_km: "Lignes cartographiées", k_hv: "Dont ≥ 150 kV", k_sub: "Postes et centrales", k_ev: "Événements datés", k_near: "Villes à < 15 km d'une ligne",
  map_h: "Réseau, événements et villes", map_help: "Lignes colorées par tension (OpenStreetMap) ; anneaux = événements datés ; cercles bleus = villes (taille ∝ lumière de la dernière année). Survoler pour le détail ; cliquer un événement pour sa source.",
  map_src: "Sources : OpenStreetMap (lignes, postes ; © contributeurs OSM, ODbL) ; événements : SOMELEC, bailleurs, presse (voir tableau) ; lumière : VIIRS VNL V2.",
  ev_h: "Événements datés du réseau", ev_help: "Dates de mise en service selon les sources publiques ; la colonne « confiance » indique leur fiabilité.",
  ev_cols: ["Année", "Ville", "Type", "Description", "Confiance", "Source"],
  es_h: "Les lumières ont-elles changé après l'événement ?", es_help: "Étude d'événements par ville : asinh(somme des lumières), effets fixes ville et année, villes jamais traitées comme témoins ; −1 = année de référence. Des coefficients avant l'événement éloignés de 0 signalent des tendances préexistantes.",
  es_x: "Années par rapport à l'événement", es_y: "Écart (≈ points log)", es_cols: ["Groupe", "Villes traitées", "Effet moyen après", "p (bootstrap sauvage)", "p pré-tendance"],
  es_src: "Calculs : MCO à effets fixes, erreurs groupées par ville ; p-valeur bootstrap sauvage restreint (MacKinnon & Webb, 2018).",
  b_h: "Croissance de la lumière selon la distance au réseau", b_help: "Villes hors capitales, regroupées selon la distance à la ligne de transport la plus proche. Descriptif : les lignes OSM ne sont pas datées.",
  b_sol: "Somme des lumières", b_lit: "Surface éclairée", b_y: "Variation (%)",
  d_h: "Bâti laissé dans le noir", d_help: "Part de la surface bâtie (GHSL 2020) sans lumière détectable : l'urbanisation y devance le service électrique. Le halo lumineux sous-estime cette part dans les grandes villes.",
  d_x: "% du bâti sans lumière (2020)",
  a_h: "Régions avec événements", a_lab: "Région", a_sol: "Somme des lumières (indice)", a_lit: "Surface éclairée (indice)", a_y: "Indice (100 = première année)",
  meth_h: "Méthode et limites", meth: `<ul><li><b>Réseau</b> — lignes OpenStreetMap <code>power=line|minor_line|cable</code>, postes et centrales ; la distance au réseau utilise toutes les lignes <code>power=line</code> (même sans tension renseignée) : les lignes HT les plus récentes sont souvent tracées avant d'être étiquetées.</li>
    <li><b>Villes</b> — liste de villes + localités OSM ; tampon de 6 km (capitales plus larges) ; lumière VNL V2 annuelle nettoyée comme ailleurs dans le tableau de bord ; bâti GHSL 2015 et 2020 (époques observées).</li>
    <li><b>Études d'événements</b> — chaque type d'événement contre les villes jamais traitées ; peu de villes traitées : p-valeurs par bootstrap sauvage. Résultats exploratoires.</li>
    <li><b>Limites</b> — couverture OSM inégale ; dates d'événements de confiance moyenne ou faible ; la lumière mesure l'éclairage nocturne, pas les raccordements.</li></ul>`,
  o_lede: "Chaque nuit, le satellite VIIRS photographie la ville vers 01 h 30. Quand une grande partie de la ville s'assombrit d'un coup par rapport à ses nuits habituelles, c'est le signe probable d'une coupure de courant.",
  ko_pct: "Nuits claires avec coupure", ko_ev: "Épisodes de coupure", ko_prol: "dont prolongés (> 3 jours)", ko_worst: "Épisode le plus marqué", ko_obs: "Nuits claires observées",
  d_title: "Nuit après nuit : lumière en % de la normale", d_hlp: "100 % = niveau habituel de chaque pixel (médiane des 60 jours précédents). Points rouges = nuits de coupure détectées ; bandes dorées = épisodes documentés par la presse. Faire glisser la barre du bas pour zoomer.",
  d_y: "% de la normale", d_obs: "Lumière (% de la normale)", d_out: "Nuit de coupure", d_ref: "Épisode documenté",
  d_src: "Source : NASA Black Marble VNP46A2 (radiance quotidienne corrigée BRDF/lune), nuits claires ; calculs des auteurs.",
  h_title: "Part des nuits claires avec coupure, par mois", h_help: "Cases blanches : moins de 5 nuits claires. Les mois de forte chaleur (mai–octobre) concentrent la demande de climatisation.",
  months: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
  u_title: "Qui subit les coupures ?", u_help: "Part des nuits claires avec coupure par sous-unité (moughataa), pour l'année choisie — l'approche « Whose power gets cut? » (Min et al., 2017).", u_year: "Année",
  e_title: "Épisodes de coupure détectés", e_cols: ["Début", "Fin", "Nuits", "Lumière min.", "Pixels assombris", "Type", "Articles"],
  sporadic: "ponctuel", prolonged: "prolongé", widespread: "généralisé", partial: "partiel",
  v_title: "Vérification avec des épisodes documentés", v_help: "Fenêtre : la veille au lendemain. Les coupures programmées ont surtout lieu de jour, invisibles à 01 h 30.",
  v_cols: ["Épisode", "Dates", "Nature", "Nuits claires", "Résultat", "Source"],
  st: { "detected": "détecté", "not detected": "non détecté", "cloudy / not observed": "nuageux / non observé", "no satellite data": "pas de données" },
  kind: { planned: "programmée", unplanned: "imprévue", "load shedding": "délestage" },
  news_h: "Ce que dit la presse",
  kn_n: "Articles sur les coupures", kn_neg: "Ton négatif", kn_tone: "Ton moyen", kn_peak: "Mois le plus couvert",
  nm_title: "Couverture et ton, mois par mois", nm_help: "Barres : articles publiés ; ligne rouge : nuits de coupure détectées par satellite ; ligne pointillée : ton moyen (−1 négatif, +1 positif).",
  nm_art: "Articles", nm_out: "Nuits de coupure (satellite)", nm_tone: "Ton moyen", nm_y: "Articles", nm_y2: "Nuits de coupure",
  wc_title: "Vocabulaire économique des articles", wc_help: "Concepts : variantes françaises, arabes et anglaises regroupées sous un même thème. Mots : termes économiques tels qu'écrits dans les articles.",
  wc_c: "Thèmes", wc_w: "Mots", wc_bar: "Mentions",
  t_title: "Articles", t_search: "Filtrer les articles…", t_cols: ["Date", "Titre", "Source", "Langue", "Ton", "Thèmes économiques"],
  tone: { negative: "négatif", neutral: "neutre", positive: "positif" },
  om_h: "Méthode, littérature et limites",
  om: (p) => `<p><b>Détection.</b> Radiance quotidienne Black Marble (VNP46A2, corrigée de l'angle de vue et de la lune), pixels éclairés (≥ ${esc(p.lit_min)} nW l'année précédente), nuits claires selon le masque nuageux. Chaque pixel est comparé à sa médiane des ${esc(p.baseline_days)} jours précédents (« % de la normale », Román et al.). Une nuit est une <b>nuit de coupure</b> si la ville est observée à ≥ 50 %, que sa lumière est ≤ ${esc(100 - 100 * p.drop)} % de la normale, que ≥ ${esc(100 * p.min_dim)} % des pixels sont assombris de moitié et que la baisse est extrême par rapport aux 60 nuits précédentes (z robuste ≤ −${esc(p.z)}). Les nuits consécutives forment un épisode, ponctuel (≤ 3 jours) ou prolongé (Elvidge et al., 2020).</p>
    <p class="callout">L'indicateur de qualité 2 (« valeur aberrante ») n'est volontairement pas exclu : une coupure est, par construction, aberrante par rapport à l'historique du pixel.</p>
    <p><b>Presse.</b> GDELT et Google News (français, arabe, anglais), filtrage sur les termes de coupure et le lieu, dédoublonnage ; ton estimé par un modèle multilingue (score = P(positif) − P(négatif)) ; vocabulaire économique repéré par un lexique multilingue.</p>
    <p><b>Limites.</b> Un passage par nuit (≈ 01 h 30) : coupures de jour, courtes ou programmées invisibles ; nuits nuageuses manquantes ; l'éclairage public, la poussière ou la fumée peuvent aussi assombrir. La presse en ligne surreprésente les grands épisodes et s'étoffe avec le temps.</p>`,
} : {
  na: "Data not available for this country or period (run sections 08 and 10 of the notebook, then section 12).",
  g_lede: "Where the electricity grid runs, which dated investments took place, and whether town lights changed afterwards. Geometry comes from OpenStreetMap (undated); dates come from a table of sourced events.",
  k_km: "Mapped power lines", k_hv: "of which ≥ 150 kV", k_sub: "Substations and plants", k_ev: "Dated events", k_near: "Towns < 15 km from a line",
  map_h: "Grid, events and towns", map_help: "Lines coloured by voltage (OpenStreetMap); rings = dated events; blue circles = towns (size ∝ light in the latest year). Hover for details; click an event for its source.",
  map_src: "Sources: OpenStreetMap (lines, substations; © OSM contributors, ODbL); events: SOMELEC, funders, press (see table); light: VIIRS VNL V2.",
  ev_h: "Dated grid events", ev_help: "Commissioning dates from public sources; the “confidence” column says how reliable each date is.",
  ev_cols: ["Year", "Town", "Type", "Description", "Confidence", "Source"],
  es_h: "Did lights change after the event?", es_help: "Town event study: asinh(sum of lights), town and year fixed effects, never-treated towns as controls; −1 = reference year. Pre-event coefficients away from 0 flag pre-existing trends.",
  es_x: "Years relative to the event", es_y: "Difference (≈ log points)", es_cols: ["Group", "Treated towns", "Average post effect", "p (wild bootstrap)", "Pre-trend p"],
  es_src: "Calculations: fixed-effects OLS, standard errors clustered by town; wild cluster restricted bootstrap p-value (MacKinnon & Webb, 2018).",
  b_h: "Light growth by distance to the grid", b_help: "Towns other than the main cities, grouped by distance to the nearest transmission line. Descriptive: OSM lines carry no dates.",
  b_sol: "Sum of lights", b_lit: "Lit area", b_y: "Change (%)",
  d_h: "Built-up land left dark", d_help: "Share of built-up surface (GHSL 2020) with no detectable light: urban expansion runs ahead of electricity service. Blooming understates this share in large cities.",
  d_x: "% of built-up land unlit (2020)",
  a_h: "Regions with grid events", a_lab: "Region", a_sol: "Sum of lights (index)", a_lit: "Lit area (index)", a_y: "Index (100 = first year)",
  meth_h: "Method and limits", meth: `<ul><li><b>Grid</b> — OpenStreetMap <code>power=line|minor_line|cable</code>, substations and plants; distance to the grid uses every <code>power=line</code> (even without a voltage tag): the newest HV lines are often mapped before they are tagged.</li>
    <li><b>Towns</b> — curated list + OSM places; 6 km buffers (larger for the main cities); annual VNL V2 light cleaned as elsewhere in the dashboard; GHSL built-up 2015 and 2020 (observed epochs).</li>
    <li><b>Event studies</b> — each event type against never-treated towns; few treated towns, hence wild-bootstrap p-values. Exploratory results.</li>
    <li><b>Limits</b> — OSM coverage is uneven; event dates are of medium or low confidence; light measures night-time lighting, not connections.</li></ul>`,
  o_lede: "Every night, the VIIRS satellite images the city at about 01:30. When a large part of the city suddenly goes darker than on its usual nights, a power outage is the likely cause.",
  ko_pct: "Clear nights with an outage", ko_ev: "Outage episodes", ko_prol: "of which prolonged (> 3 days)", ko_worst: "Deepest episode", ko_obs: "Clear nights observed",
  d_title: "Night by night: light in percent of normal", d_hlp: "100% = each pixel's usual level (median of the previous 60 days). Red dots = detected outage nights; gold bands = episodes documented in the press. Drag the bottom bar to zoom.",
  d_y: "% of normal", d_obs: "Light (% of normal)", d_out: "Outage night", d_ref: "Documented episode",
  d_src: "Source: NASA Black Marble VNP46A2 (daily BRDF/moon-corrected radiance), clear nights; authors' calculations.",
  h_title: "Share of clear nights with an outage, by month", h_help: "Blank cells: fewer than 5 clear nights. The hot months (May–October) concentrate air-conditioning demand.",
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  u_title: "Whose power gets cut?", u_help: "Share of clear nights with an outage by sub-unit (moughataa) in the chosen year — the “Whose power gets cut?” approach (Min et al., 2017).", u_year: "Year",
  e_title: "Detected outage episodes", e_cols: ["Start", "End", "Nights", "Min. light", "Pixels dimmed", "Type", "Articles"],
  sporadic: "sporadic", prolonged: "prolonged", widespread: "widespread", partial: "partial",
  v_title: "Check against documented episodes", v_help: "Window: the day before to the day after. Planned cuts are mostly daytime, invisible at 01:30.",
  v_cols: ["Episode", "Dates", "Nature", "Clear nights", "Result", "Source"],
  st: { "detected": "detected", "not detected": "not detected", "cloudy / not observed": "cloudy / not observed", "no satellite data": "no data" },
  kind: { planned: "planned", unplanned: "unplanned", "load shedding": "load shedding" },
  news_h: "What the news says",
  kn_n: "Articles on outages", kn_neg: "Negative tone", kn_tone: "Average tone", kn_peak: "Most-covered month",
  nm_title: "Coverage and tone, month by month", nm_help: "Bars: articles published; red line: outage nights detected by satellite; dotted line: average tone (−1 negative, +1 positive).",
  nm_art: "Articles", nm_out: "Outage nights (satellite)", nm_tone: "Average tone", nm_y: "Articles", nm_y2: "Outage nights",
  wc_title: "Economic vocabulary in the articles", wc_help: "Concepts: French, Arabic and English variants grouped under one theme. Words: economic terms as written in the articles.",
  wc_c: "Themes", wc_w: "Words", wc_bar: "Mentions",
  t_title: "Articles", t_search: "Filter articles…", t_cols: ["Date", "Title", "Source", "Language", "Tone", "Economic themes"],
  tone: { negative: "negative", neutral: "neutral", positive: "positive" },
  om_h: "Method, literature and limits",
  om: (p) => `<p><b>Detection.</b> Daily Black Marble radiance (VNP46A2, corrected for view angle and moonlight), lit pixels (≥ ${esc(p.lit_min)} nW the previous year), clear nights from the cloud mask. Each pixel is compared with its median over the previous ${esc(p.baseline_days)} days (“percent of normal”, Román et al.). A night is an <b>outage night</b> when ≥ 50% of the city is observed, its light is ≤ ${esc(100 - 100 * p.drop)}% of normal, ≥ ${esc(100 * p.min_dim)}% of pixels are at less than half their normal level, and the drop is extreme relative to the previous 60 nights (robust z ≤ −${esc(p.z)}). Consecutive nights form an episode, sporadic (≤ 3 days) or prolonged (Elvidge et al., 2020).</p>
    <p class="callout">Quality flag 2 (“outlier”) is deliberately not excluded: an outage is, by construction, an outlier relative to the pixel's history.</p>
    <p><b>News.</b> GDELT and Google News (French, Arabic, English), filtered on outage terms and place, de-duplicated; tone from a multilingual model (score = P(positive) − P(negative)); economic vocabulary from a multilingual lexicon.</p>
    <p><b>Limits.</b> One pass a night (≈01:30): daytime, short or planned cuts are invisible; cloudy nights are missing; street-lighting changes, dust or smoke can also dim the city. Online news over-represents large episodes and grows over time.</p>`,
};
const GROUP_FR = { "HV connection": "Raccordement haute tension", "Generation upgrade": "Renforcement de la production",
  "Rural network (zone)": "Réseau rural (zone)", "HV connection (after the data)": "Raccordement HT (après les données)", "National supply": "Approvisionnement national" };
const VCL_FR = { "≥ 150 kV": "≥ 150 kV", "60–150 kV": "60–150 kV", "< 60 kV": "< 60 kV", "line, voltage not tagged": "ligne, tension non renseignée" };
const gl = (g) => (FR ? GROUP_FR[g] || g : g);
const vl = (v) => (FR ? VCL_FR[v] || v : v);
const IMF = { blue: "#004C97", mid: "#4B82AD", light: "#CAE0FB", red: "#C00050", green: "#96BA79", gold: "#F5BD47", navy: "#0E1074", grey: "#A6A8AC" };
const pct = (v, d = 0) => (isNum(v) ? (FR ? (100 * v).toFixed(d).replace(".", ",") + " %" : (100 * v).toFixed(d) + "%") : "–");
const num = (v, d = 0) => F.num(v, d);
const link = (u, t) => (u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t || (FR ? "source" : "source"))}</a>` : "–");
const kpi = (label, value, sub = "") => `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div><div class="sub">${esc(sub)}</div></div>`;
const fmtDate = (s) => (s ? new Date(s + "T00:00:00Z").toLocaleDateString(FR ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "–");
const table = (id, head, rows) => { const el = document.getElementById(id); if (!el) return; el.classList.add("elec-t");
  el.innerHTML = `<thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody>`; };
const empty = (sec, msg) => { sec.innerHTML = `<article class="card"><p class="help">${esc(msg || T.na)}</p></article>`; };

/* ============================================================ ELECTRICITY GRID */
RENDER.grid = () => {
  const sec = document.getElementById("page-grid"); const g = S.d.grid;
  if (!g) { empty(sec); return; }
  sec.innerHTML = `
    <p class="lede">${esc(T.g_lede)}</p>
    <div class="kpis" id="g-kpis"></div>
    <div class="card map-card"><h2>${esc(T.map_h)}</h2><p class="help">${esc(T.map_help)}</p>
      <div id="gmap" class="elec-map" role="region" aria-label="${esc(T.map_h)}"></div><div class="elec-legend" id="g-legend"></div>
      <p class="source">${esc(T.map_src)}</p></div>
    <div class="grid two">
      <article class="card"><h2>${esc(T.ev_h)}</h2><p class="help">${esc(T.ev_help)}</p><div class="table-wrap"><table class="data" id="g-events"></table></div></article>
      <article class="card"><h2>${esc(T.es_h)}</h2><p class="help">${esc(T.es_help)}</p><div class="chart" id="g-es"></div>
        <div class="table-wrap"><table class="data" id="g-es-table"></table></div><p class="source">${esc(T.es_src)}</p></article>
    </div>
    <div class="grid two">
      <article class="card"><h2>${esc(T.b_h)}</h2><p class="help">${esc(T.b_help)}</p><div class="chart" id="g-bands"></div></article>
      <article class="card"><h2>${esc(T.d_h)}</h2><p class="help">${esc(T.d_help)}</p><div class="chart tall" id="g-dark"></div></article>
    </div>
    <article class="card"><h2>${esc(T.a_h)}</h2><label class="ctl">${esc(T.a_lab)} <select id="g-adm1"></select></label><div class="chart" id="g-adm1-chart"></div></article>
    <article class="card prose"><h2>${esc(T.meth_h)}</h2>${T.meth}</article>`;
  const c = C(), gc = (g.colors || {}).group || {}, vc = (g.colors || {}).vclass || {};
  // ---- KPIs
  const inv = g.inventory || [], km = inv.reduce((s, r) => s + (r.km || 0), 0), hv = inv.filter((r) => r.vclass === "≥ 150 kV").reduce((s, r) => s + r.km, 0);
  const near = (g.towns || []).filter((t) => isNum(t.dist_km) && t.dist_km < 15).length;
  $("#g-kpis").innerHTML = kpi(T.k_km, num(km) + " km", "OpenStreetMap") + kpi(T.k_hv, num(hv) + " km", FR ? "tension renseignée" : "voltage tagged") +
    kpi(T.k_sub, num(((S.d.gridPts || {}).features || []).length), "OpenStreetMap") + kpi(T.k_ev, num((g.events || []).length), `${g.period[0]}–${g.period[1]} +`) +
    kpi(T.k_near, `${near} / ${(g.towns || []).length}`, FR ? "toutes villes" : "all towns");
  // ---- map
  if (window.L) {
    try {
      const mp = (S.gmap = newMap("gmap"));
      const m = S.d.meta, ys = Object.keys((m.rasters && m.rasters.ntl) || {}).sort();
      const layers = {};
      if (ys.length) { const o = overlay(m.rasters.ntl[ys[ys.length - 1]]); if (o) { o.setOpacity(0.55); o.addTo(mp); layers[(FR ? "Lumière " : "Night light ") + ys[ys.length - 1]] = o; } }
      if (S.d.gridLines) {
        const lw = { "≥ 150 kV": 3.2, "60–150 kV": 2.4, "< 60 kV": 1.2, "line, voltage not tagged": 2.2 };
        const l = L.geoJSON(S.d.gridLines, { style: (f) => ({ color: vc[f.properties.vclass] || IMF.grey, weight: lw[f.properties.vclass] || 1.5, opacity: 0.95,
            dashArray: f.properties.vclass === "line, voltage not tagged" ? "6 4" : null }),
          onEachFeature: (f, ly) => ly.bindTooltip(`${esc(vl(f.properties.vclass))}${isNum(f.properties.kv) ? " · " + f.properties.kv + " kV" : ""}`, { sticky: true }) }).addTo(mp);
        layers[FR ? "Lignes électriques" : "Power lines"] = l;
      }
      if (S.d.gridPts) {
        const p = L.geoJSON(S.d.gridPts, { pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 3.5, color: c.ink, weight: 1.2, fillColor: "#fff", fillOpacity: 1 }),
          onEachFeature: (f, ly) => ly.bindTooltip(`${esc(f.properties.name || "")} <span class="tip-p">${esc(f.properties.power)}</span>`) });
        p.addTo(mp); layers[FR ? "Postes et centrales" : "Substations and plants"] = p;
      }
      const tw = L.layerGroup((g.towns || []).filter((t) => isNum(t.lat)).map((t) => {
        const r = Math.max(3, Math.min(18, 2.2 * Math.sqrt(Math.max(t.sol1 || 0, 0)) / 3));
        return L.circleMarker([t.lat, t.lon], { radius: r, color: "#fff", weight: 1, fillColor: IMF.mid, fillOpacity: 0.75 })
          .bindTooltip(`<strong>${esc(t.town)}</strong><div class="tip-v">${FR ? "Distance au réseau" : "Distance to grid"} : <b>${isNum(t.dist_km) ? num(t.dist_km, 1) + " km" : "–"}</b></div>` +
            `<div class="tip-v">${FR ? "Lumière" : "Light"} ${g.period[0]}→${g.period[1]} : <b>${F.pct(t.sol_growth, 0)}</b></div>`);
      })).addTo(mp);
      layers[FR ? "Villes" : "Towns"] = tw;
      const evl = L.layerGroup((g.events || []).filter((e) => isNum(e.lat)).map((e) => L.circleMarker([e.lat, e.lon], { radius: 9, color: gc[e.group] || IMF.red, weight: 3, fill: false })
        .bindTooltip(`<strong>${esc(e.town)} · ${e.year}</strong><div class="tip-v">${esc(gl(e.group))}</div>`)
        .bindPopup(`<strong>${esc(e.town)} · ${e.year}</strong><div class="why">${esc(gl(e.group))} · ${FR ? "confiance" : "confidence"} ${esc(e.confidence)}</div><p>${esc(e.description)}</p>${link(e.source)}`))).addTo(mp);
      layers[FR ? "Événements datés" : "Dated events"] = evl;
      L.control.layers(null, layers, { collapsed: true }).addTo(mp);
      const b = L.geoJSON(S.d.adm0 || S.d.adm1).getBounds(); if (b.isValid()) mp.fitBounds(b, { padding: [12, 12] });
      setTimeout(() => mp.invalidateSize(), 80);
    } catch (e) { console.error(e); }
  }
  $("#g-legend").innerHTML = Object.entries(vc).map(([k, v]) => `<span><i style="background:${v}"></i>${esc(vl(k))}</span>`).join("") +
    Object.entries(gc).filter(([k]) => (g.events || []).some((e) => e.group === k)).map(([k, v]) => `<span><b class="dot" style="background:${v}"></b>${esc(gl(k))}</span>`).join("");
  // ---- events table
  const ev = (g.events || []).slice().sort((a, b) => b.year - a.year || String(a.town).localeCompare(b.town));
  table("g-events", T.ev_cols, ev.map((e) => `<tr><td>${e.year}</td><td>${esc(e.town)}</td><td><b class="dot" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${gc[e.group] || IMF.grey}"></b> ${esc(gl(e.group))}</td>` +
    `<td class="wide">${esc(e.description)}</td><td><span class="conf ${esc(e.confidence)}">${esc(e.confidence)}</span></td><td>${link(e.source, "↗")}</td></tr>`));
  // ---- event study
  const es = (g.event_study || {}).groups || {}, keys = Object.keys(es);
  const cols = [IMF.blue, IMF.gold, IMF.green, IMF.red];
  plot("g-es", keys.map((k, i) => { const r = es[k].coefs || []; const off = (i - (keys.length - 1) / 2) * 0.12;
    return { x: r.map((p) => p.rel + off), y: r.map((p) => p.coef), name: `${gl(k)} (${es[k].n_treated})`, mode: "markers", type: "scatter",
      marker: { color: cols[i % 4], size: 9, line: { color: c.surface, width: 1.5 } },
      error_y: { type: "data", symmetric: false, array: r.map((p) => p.hi - p.coef), arrayminus: r.map((p) => p.coef - p.lo), color: cols[i % 4], thickness: 1.4, width: 4 },
      hovertemplate: "%{y:.2f}<extra>%{fullData.name}</extra>" }; }),
    { margin: { l: 66 }, xaxis: { title: { text: T.es_x }, dtick: 1, zeroline: false }, yaxis: { title: { text: T.es_y }, zeroline: true, zerolinecolor: c.axis },
      shapes: [{ type: "line", xref: "x", yref: "paper", x0: -0.5, x1: -0.5, y0: 0, y1: 1, line: { color: c.muted, dash: "dot", width: 1 } }] });
  table("g-es-table", T.es_cols, keys.map((k) => { const r = es[k]; const p = r.p_wild < 0.01 ? "< 0.01" : num(r.p_wild, 2);
    return `<tr><td>${esc(gl(k))}</td><td title="${esc((r.treated || []).join(", "))}">${r.n_treated}</td><td class="num">${F.num(r.att, 2)} (± ${F.num(1.96 * r.att_se, 2)})</td><td class="num">${p}</td><td class="num">${num(r.pretrend_p, 2)}</td></tr>`; }));
  // ---- distance bands
  const bd = g.bands || [];
  plot("g-bands", bd.length ? [
    { type: "bar", x: bd.map((r) => r.distance), y: bd.map((r) => 100 * r.sol_growth), name: T.b_sol, marker: { color: IMF.blue },
      text: bd.map((r) => `${r.towns}`), textposition: "outside", cliponaxis: false, hovertemplate: "%{x}<br>%{y:.0f}%<extra>" + T.b_sol + "</extra>" },
    { type: "bar", x: bd.map((r) => r.distance), y: bd.map((r) => 100 * r.lit_growth), name: T.b_lit, marker: { color: IMF.mid }, hovertemplate: "%{x}<br>%{y:.0f}%<extra>" + T.b_lit + "</extra>" },
  ] : [], { barmode: "group", yaxis: { title: { text: T.b_y }, zeroline: true, zerolinecolor: c.axis }, annotations: [{ xref: "paper", yref: "paper", x: 1, y: 1.12, showarrow: false, xanchor: "right",
    text: FR ? "chiffre au-dessus des barres = nombre de villes" : "number above bars = towns", font: { size: 10, color: c.muted } }] });
  // ---- dark built-up
  const dk = (g.built_lit || []).filter((r) => !r.primary && isNum(r.dark_built_share)).sort((a, b) => a.dark_built_share - b.dark_built_share).slice(-20);
  plot("g-dark", dk.length ? [{ type: "bar", orientation: "h", y: dk.map((r) => r.town), x: dk.map((r) => 100 * r.dark_built_share),
    marker: { color: dk.map((r) => (r.dark_built_share >= 0.5 ? IMF.red : IMF.mid)) }, customdata: dk.map((r) => [100 * (r.built_growth || 0), 100 * (r.lit_growth || 0)]),
    hovertemplate: "%{y}: %{x:.0f}%<br>" + (FR ? "bâti" : "built-up") + " 2015→20 %{customdata[0]:+.0f}% · " + (FR ? "surface éclairée" : "lit area") + " %{customdata[1]:+.0f}%<extra></extra>", showlegend: false }] : [],
    { xaxis: { title: { text: T.d_x }, range: [0, 100] }, margin: { l: 10 } });
  // ---- ADM1 trajectories with events
  const ae = g.adm1_events || [], ser = g.adm1_series || [];
  const units = [...new Set(ae.filter((e) => e.unit_id && e.year <= g.period[1]).map((e) => e.unit_id))];
  const nm = Object.fromEntries(ser.map((r) => [r.unit_id, r.name]));
  const sel = $("#g-adm1");
  sel.innerHTML = units.map((u) => `<option value="${esc(u)}">${esc(nm[u] || u)}</option>`).join("");
  const draw = () => {
    const u = sel.value, s = ser.filter((r) => r.unit_id === u).sort((a, b) => a.year - b.year);
    if (!s.length) { plot("g-adm1-chart", []); return; }
    const b0 = s.find((r) => r.sol > 0) || s[0], l0 = s.find((r) => r.lit_km2 > 0) || s[0];
    const evs = ae.filter((e) => e.unit_id === u && e.year <= g.period[1]);
    plot("g-adm1-chart", [
      { x: s.map((r) => r.year), y: s.map((r) => (100 * r.sol) / b0.sol), name: T.a_sol, mode: "lines+markers", line: { color: IMF.blue, width: 2.4 } },
      { x: s.map((r) => r.year), y: s.map((r) => (100 * r.lit_km2) / (l0.lit_km2 || 1)), name: T.a_lit, mode: "lines", line: { color: IMF.mid, width: 1.6, dash: "dash" } },
    ], { yaxis: { title: { text: T.a_y } }, xaxis: { dtick: 1 },
      shapes: evs.map((e) => ({ type: "line", xref: "x", yref: "paper", x0: e.year, x1: e.year, y0: 0, y1: 1, line: { color: gc[e.group] || IMF.red, width: 2 } })),
      annotations: evs.map((e, i) => ({ x: e.year, y: 1 - 0.09 * i, xref: "x", yref: "paper", text: esc(`${e.town}`), showarrow: false, xanchor: "left", font: { size: 10, color: gc[e.group] || IMF.red } })) });
  };
  sel.onchange = draw; if (units.length) draw(); else plot("g-adm1-chart", []);
};

/* ============================================================ POWER OUTAGES + NEWS */
RENDER.outages = () => {
  const sec = document.getElementById("page-outages"); const o = S.d.outages, n = S.d.news;
  if (!o && !n) { empty(sec); return; }
  sec.innerHTML = `
    <p class="lede">${esc(T.o_lede)}</p>
    <div class="kpis" id="o-kpis"></div>
    <article class="card"><h2>${esc(T.d_title)}${o ? " — " + esc(o.city) : ""}</h2><p class="help">${esc(T.d_hlp)}</p><div class="chart tall" id="o-daily"></div><p class="source">${esc(T.d_src)}</p></article>
    <div class="grid two">
      <article class="card"><h2>${esc(T.h_title)}</h2><p class="help">${esc(T.h_help)}</p><div class="chart" id="o-heat"></div></article>
      <article class="card"><h2>${esc(T.u_title)}</h2><p class="help">${esc(T.u_help)}</p><label class="ctl">${esc(T.u_year)} <select id="o-year"></select></label>
        <div id="omap" class="elec-map" style="height:300px"></div><div class="chart short" id="o-units"></div></article>
    </div>
    <div class="grid two">
      <article class="card"><h2>${esc(T.e_title)}</h2><div class="table-wrap news-list"><table class="data" id="o-events"></table></div></article>
      <article class="card"><h2>${esc(T.v_title)}</h2><p class="help">${esc(T.v_help)}</p><div class="table-wrap"><table class="data" id="o-valid"></table></div></article>
    </div>
    <h2 class="section-title">${esc(T.news_h)}</h2>
    <div class="kpis" id="n-kpis"></div>
    <div class="grid two">
      <article class="card"><h2>${esc(T.nm_title)}</h2><p class="help">${esc(T.nm_help)}</p><div class="chart" id="n-monthly"></div></article>
      <article class="card"><h2>${esc(T.wc_title)}</h2><p class="help">${esc(T.wc_help)}</p>
        <div class="seg toggle" id="n-wc-toggle"><button type="button" class="on" data-k="concepts">${esc(T.wc_c)}</button><button type="button" data-k="words">${esc(T.wc_w)}</button></div>
        <img class="wc" id="n-wc" alt="${esc(T.wc_title)}"><div class="chart short" id="n-concepts"></div></article>
    </div>
    <article class="card"><h2>${esc(T.t_title)}</h2><div class="toolbar"><input type="search" id="n-search" placeholder="${esc(T.t_search)}" aria-label="${esc(T.t_search)}"></div>
      <div class="table-wrap news-list"><table class="data" id="n-table"></table></div></article>
    <article class="card prose"><h2>${esc(T.om_h)}</h2><div id="o-method"></div><ul class="lit-ref" id="o-refs"></ul></article>`;
  const c = C();
  if (o) {
    const daily = o.daily || [], obs = daily.filter((d) => d.observed && isNum(d.ratio)), outs = daily.filter((d) => d.outage);
    const y = (o.yearly || []).filter((r) => r.observed_nights >= 150), last = y[y.length - 1] || {}, ev = o.events || [];
    const worst = ev.slice().sort((a, b) => a.min_ratio - b.min_ratio)[0];
    $("#o-kpis").innerHTML = kpi(T.ko_pct, pct(last.pct_outage, 1), `${last.year || ""} · ${num(last.outage_nights)} / ${num(last.observed_nights)}`) +
      kpi(T.ko_ev, num(ev.length), `${T.ko_prol} : ${num(ev.filter((e) => e.kind === "prolonged").length)}`) +
      kpi(T.ko_worst, worst ? pct(worst.min_ratio) : "–", worst ? `${fmtDate(worst.start)} · ${pct(worst.max_dim)} ${FR ? "pixels assombris" : "pixels dimmed"}` : "") +
      kpi(T.ko_obs, num(obs.length), o.period ? `${fmtDate(o.period[0])} → ${fmtDate(o.period[1])}` : "");
    const refs = (o.validation || []);
    plot("o-daily", [
      { x: obs.map((d) => d.date), y: obs.map((d) => Math.min(200, 100 * d.ratio)), name: T.d_obs, mode: "lines", line: { color: IMF.blue, width: 1 }, hovertemplate: "%{x|%d %b %Y}<br>%{y:.0f}%<extra></extra>" },
      { x: outs.map((d) => d.date), y: outs.map((d) => 100 * d.ratio), name: T.d_out, mode: "markers", marker: { color: IMF.red, size: 7, line: { color: c.surface, width: 1 } },
        customdata: outs.map((d) => [100 * (d.dim_share || 0), T[d.severity] || d.severity]), hovertemplate: "%{x|%d %b %Y}<br>%{y:.0f}% · %{customdata[0]:.0f}% px · %{customdata[1]}<extra></extra>" },
      { x: refs.map((r) => r.start), y: refs.map(() => 152), name: T.d_ref, mode: "markers", marker: { color: IMF.gold, size: 12, symbol: "triangle-down", line: { color: IMF.navy, width: 1 } },
        customdata: refs.map((r) => [r.label, T.st[r.status] || r.status]), hovertemplate: "%{x|%d %b %Y}<br>%{customdata[0]}<br><b>%{customdata[1]}</b><extra></extra>" },
    ], { hovermode: "closest", yaxis: { title: { text: T.d_y }, range: [0, 160] },
      xaxis: { rangeslider: { visible: true, thickness: 0.07 }, type: "date" },
      shapes: [{ type: "line", xref: "paper", x0: 0, x1: 1, y0: 100, y1: 100, line: { color: c.muted, width: 1, dash: "dot" } }].concat(refs.map((r) => ({
        type: "rect", xref: "x", yref: "paper", x0: r.start, x1: r.end === r.start ? r.end + "T23:59:00" : r.end, y0: 0, y1: 1, fillcolor: IMF.gold, opacity: 0.35, line: { width: 0 } }))),
      legend: { y: 1.1 } });
    // heat map
    const mm = o.monthly || [], yrs = [...new Set(mm.map((r) => r.year))].sort();
    const z = yrs.map((yy) => Array.from({ length: 12 }, (_, i) => { const r = mm.find((q) => q.year === yy && q.month === i + 1); return r && isNum(r.pct_outage) ? 100 * r.pct_outage : null; }));
    const tx = yrs.map((yy) => Array.from({ length: 12 }, (_, i) => { const r = mm.find((q) => q.year === yy && q.month === i + 1); return r ? `${r.outages}/${r.observed}` : ""; }));
    plot("o-heat", yrs.length ? [{ type: "heatmap", x: T.months, y: yrs.map(String), z, text: tx, zmin: 0, zmax: Math.max(10, ...z.flat().filter(isNum)),
      colorscale: [[0, "#F4F6FA"], [0.25, "#F0C3D2"], [0.6, "#D1507B"], [1, IMF.red]], xgap: 2, ygap: 2,
      hovertemplate: "%{x} %{y}: %{z:.0f}% (%{text})<extra></extra>", colorbar: { title: { text: "%" }, thickness: 10 } }] : [],
      { yaxis: { autorange: "reversed", type: "category" }, margin: { l: 50 } });
    // by sub-unit
    const sub = o.sub_yearly || [], syears = [...new Set(sub.map((r) => r.year))].sort();
    const ysel = $("#o-year"); ysel.innerHTML = syears.map((v) => `<option>${v}</option>`).join("");
    const lastFull = (syears.filter((v) => sub.some((r) => r.year === v && r.observed_nights >= 150)).pop()) || syears[syears.length - 1];
    if (lastFull) ysel.value = lastFull;
    let lyr = null;
    if (window.L && S.d.outUnits) { try { S.omap = newMap("omap"); } catch (e) { console.error(e); } }
    const drawUnits = () => {
      const yy = +ysel.value, rows = sub.filter((r) => r.year === yy && isNum(r.pct_outage)).sort((a, b) => a.pct_outage - b.pct_outage);
      plot("o-units", rows.length ? [{ type: "bar", orientation: "h", y: rows.map((r) => r.name), x: rows.map((r) => 100 * r.pct_outage), marker: { color: IMF.red },
        customdata: rows.map((r) => [r.outage_nights, r.observed_nights]), hovertemplate: "%{y}: %{x:.1f}% (%{customdata[0]}/%{customdata[1]})<extra></extra>", showlegend: false }] : [],
        { xaxis: { title: { text: T.ko_pct + " (%)" } }, margin: { l: 10, t: 6 } });
      if (S.omap && S.d.outUnits) {
        if (lyr) S.omap.removeLayer(lyr);
        const v = Object.fromEntries(rows.map((r) => [r.unit_id, r.pct_outage])), mx = Math.max(0.01, ...rows.map((r) => r.pct_outage));
        lyr = L.geoJSON(S.d.outUnits, { filter: (f) => f.properties.role === "sub" || !rows.length,
          style: (f) => { const q = v[f.properties.unit_id]; const k = isNum(q) ? Math.min(6, Math.floor((6.99 * q) / mx)) : -1;
            return { color: "#fff", weight: 1, fillOpacity: 0.8, fillColor: k < 0 ? css("--grid") : SEQ_O[k] }; },
          onEachFeature: (f, l) => l.bindTooltip(`<strong>${esc(f.properties.name)}</strong><div class="tip-v">${pct(v[f.properties.unit_id], 1)}</div>`, { sticky: true }) }).addTo(S.omap);
        const bb = lyr.getBounds(); if (bb.isValid()) S.omap.fitBounds(bb, { padding: [8, 8] });
        setTimeout(() => S.omap.invalidateSize(), 80);
      }
    };
    ysel.onchange = drawUnits; drawUnits();
    // events table (+ articles from news.json)
    const art = new Map(((n && n.matched_events) || []).map((e) => [e.start, e.articles]));
    table("o-events", T.e_cols, ev.slice().sort((a, b) => (a.start < b.start ? 1 : -1)).slice(0, 60).map((e) => `<tr><td>${fmtDate(e.start)}</td><td>${fmtDate(e.end)}</td><td class="num">${e.nights}</td>` +
      `<td class="num">${pct(e.min_ratio)}</td><td class="num">${pct(e.max_dim)}</td><td>${esc(T[e.kind] || e.kind)} · ${esc(T[e.severity] || e.severity)}</td><td class="num">${art.has(e.start) ? art.get(e.start) : "–"}</td></tr>`));
    table("o-valid", T.v_cols, refs.map((r) => `<tr><td class="wide">${esc(r.label)}</td><td>${fmtDate(r.start)}${r.end !== r.start ? " → " + fmtDate(r.end) : ""}</td><td>${esc(T.kind[r.kind] || r.kind)}</td>` +
      `<td class="num">${r.observed_nights}</td><td><span class="conf ${r.status === "detected" ? "high" : r.status === "not detected" ? "low" : "medium"}">${esc(T.st[r.status] || r.status)}</span>` +
      `${isNum(r.min_ratio) ? ` <span class="why">${pct(r.min_ratio)}</span>` : ""}</td><td>${link(r.source, "↗")}</td></tr>`));
    $("#o-method").innerHTML = T.om(o.params || {});
    $("#o-refs").innerHTML = (o.references || []).map((r) => `<li>${esc(r)}</li>`).join("");
  } else { ["o-daily", "o-heat", "o-units"].forEach((id) => plot(id, [])); }
  // ---- news
  if (!n) { $("#n-kpis").innerHTML = `<p class="help">${esc(T.na)}</p>`; return; }
  const arts = n.articles || [], negs = arts.filter((a) => a.label === "negative").length;
  const tone = arts.reduce((s, a) => s + (isNum(a.score) ? a.score : 0), 0) / Math.max(1, arts.length);
  const mon = n.monthly || [], peak = mon.filter((r) => r.articles > 0).sort((a, b) => b.articles - a.articles)[0];
  $("#n-kpis").innerHTML = kpi(T.kn_n, num(n.n), `${num(n.n_raw)} ${FR ? "collectés" : "collected"} · ${esc(n.method || "")}`) + kpi(T.kn_neg, pct(negs / Math.max(1, arts.length)), "") +
    kpi(T.kn_tone, F.num(tone, 2), "−1 … +1") + kpi(T.kn_peak, peak ? new Date(peak.month + "-01T00:00:00Z").toLocaleDateString(FR ? "fr-FR" : "en-GB", { month: "short", year: "numeric", timeZone: "UTC" }) : "–", peak ? `${peak.articles} ${FR ? "articles" : "articles"}` : "");
  plot("n-monthly", mon.length ? [
    { type: "bar", x: mon.map((r) => r.month + "-01"), y: mon.map((r) => r.articles || 0), name: T.nm_art, marker: { color: IMF.mid }, hovertemplate: "%{x|%b %Y}: %{y}<extra></extra>" },
    ...(mon.some((r) => isNum(r.outages)) ? [{ x: mon.map((r) => r.month + "-01"), y: mon.map((r) => r.outages), name: T.nm_out, yaxis: "y2", mode: "lines", line: { color: IMF.red, width: 1.6 } }] : []),
    { x: mon.filter((r) => isNum(r.sentiment)).map((r) => r.month + "-01"), y: mon.filter((r) => isNum(r.sentiment)).map((r) => r.sentiment), name: T.nm_tone, yaxis: "y3",
      mode: "markers", marker: { color: IMF.navy, size: 6, symbol: "diamond" }, hovertemplate: "%{x|%b %Y}: %{y:.2f}<extra>" + T.nm_tone + "</extra>" },
  ] : [], { yaxis: { title: { text: T.nm_y } }, yaxis2: { overlaying: "y", side: "right", title: { text: T.nm_y2 }, showgrid: false, rangemode: "tozero" },
    yaxis3: { overlaying: "y", side: "right", range: [-1, 1], visible: false }, xaxis: { type: "date" }, legend: { y: 1.18 }, margin: { r: 56 } });
  const wc = n.wordclouds || {}, img = $("#n-wc"), base = `data/${S.iso}/`;
  const showWc = (k) => { if (wc[k]) { img.src = base + wc[k]; img.hidden = false; } else img.hidden = true; };
  $("#n-wc-toggle").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; $$("#n-wc-toggle button").forEach((x) => x.classList.toggle("on", x === b)); showWc(b.dataset.k); };
  showWc("concepts");
  const cc = (n.concepts || []).slice(0, 12).reverse();
  plot("n-concepts", cc.length ? [{ type: "bar", orientation: "h", y: cc.map((r) => r.concept), x: cc.map((r) => r.mentions), marker: { color: IMF.blue },
    customdata: cc.map((r) => r.articles), hovertemplate: "%{y}: %{x} (%{customdata} art.)<extra></extra>", showlegend: false }] : [],
    { xaxis: { title: { text: T.wc_bar } }, margin: { l: 10, t: 6 } });
  const rowsOf = (q) => arts.filter((a) => !q || `${a.title} ${a.source} ${a.concepts}`.toLowerCase().includes(q)).slice(0, 400).map((a) =>
    `<tr><td>${fmtDate(a.date)}</td><td class="wide">${link(a.url, a.title)}</td><td>${esc(a.source || "")}</td><td>${esc((a.lang || "").toUpperCase())}</td>` +
    `<td><span class="sent ${esc(a.label)}" title="${F.num(a.score, 2)}">${esc(T.tone[a.label] || a.label)}</span></td><td>${esc(a.concepts || "")}</td></tr>`);
  table("n-table", T.t_cols, rowsOf(""));
  $("#n-search").oninput = (e) => table("n-table", T.t_cols, rowsOf(e.target.value.trim().toLowerCase()));
};
})();
