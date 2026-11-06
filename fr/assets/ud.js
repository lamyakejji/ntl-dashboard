/* Population & urbanisation and Digital pages, the data-sources table of the Methods page, and the VIIRS / Black Marble
 * switch of the header — shared by the EN and FR sites (language from <html lang>). Uses the helpers of app.js
 * (S, $, $$, F, esc, plot, C, isNum, RENDER, route, store, getJSON, getCSV). Data: urban.json, digital.json, ntl_sources.json. */
"use strict";
(() => {
const FR = (document.documentElement.lang || "en").toLowerCase().startsWith("fr");
const IMF = { blue: "#004C97", sky: "#009CDE", navy: "#001E60", mid: "#5E8AB4", orange: "#FF8200", rust: "#E35205", gold: "#F2A900",
  green: "#78BE20", red: "#DA291C", purple: "#8031A7", teal: "#00B0B9", grey: "#B1B3B3", dgrey: "#707372", pale: "#D9EEFA", light: "#5FBDEA" };
const dec = (v, d = 1) => (isNum(v) ? (FR ? v.toFixed(d).replace(".", ",") : v.toFixed(d)) : "–");
const pct = (v, d = 1) => (isNum(v) ? dec(v, d) + (FR ? " %" : "%") : "–");
const big = (v) => (isNum(v) ? new Intl.NumberFormat(FR ? "fr-FR" : "en-US", { maximumFractionDigits: 0 }).format(v) : "–");
const kpi = (label, value, sub = "") => `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div><div class="sub">${esc(sub)}</div></div>`;
const seg = (id, opts, on) => `<div class="seg" id="${id}">${opts.map(([k, l]) => `<button type="button" data-k="${esc(k)}" class="${k === on ? "on" : ""}">${esc(l)}</button>`).join("")}</div>`;
const onSeg = (id, fn) => { const el = $("#" + id); if (!el) return; el.onclick = (e) => { const b = e.target.closest("button"); if (!b) return;
  $$(`#${id} button`).forEach((x) => x.classList.toggle("on", x === b)); fn(b.dataset.k); }; };
const empty = (sec, msg) => { sec.innerHTML = `<article class="card"><p class="help">${esc(msg)}</p></article>`; };
const qlab = (q) => String(q).replace("Q", FR ? " T" : " Q");
const card = (id, h, help, cls = "chart", src = "") => `<article class="card"><h2>${esc(h)}</h2>${help ? `<p class="help">${esc(help)}</p>` : ""}<div class="${cls}" id="${id}"></div>${src ? `<p class="source">${esc(src)}</p>` : ""}</article>`;

const T = FR ? {
  na: "Données non disponibles : relancer la section correspondante du notebook, puis l'export (section 21).",
  u_lede: "La Mauritanie s'urbanise vite : en un demi-siècle, un pays de nomades est devenu un pays de villes. Où la population grandit, à quelle vitesse, ce que les lumières en disent, et ce que cela demande au réseau électrique, au logement et à l'emploi.",
  uk_nkc: "Part de Nouakchott (2023)", uk_nkc_s: "de la population (21 % en 1988)", uk_g: "Croissance de Nouakchott", uk_g_s: "par an, 2013–2023",
  uk_sec: "Villes secondaires", uk_sec_s: "par an, 2013–2023 (pays : {n})", uk_add: "Habitants urbains en plus", uk_add_s: "par an, 2023–2025 (rural : {r})",
  uk_el: "Ménages avec électricité", uk_el_s: "2023 (20 % en 2004)",
  u_nkc_h: "Nouakchott, de 15 000 habitants à 1,5 million", u_nkc_help: "Barres : population (milliers) ; ligne : part de la population du pays (axe de droite). Avant 1988 : estimations ; 2024–2025 : projections ANSADE.",
  u_sh_h: "Où vivent les Mauritaniens", u_sh_help: "Part de la population à chaque recensement. « Autres villes » : capitales de wilaya et Zouérate présentes aux quatre recensements (communes).",
  u_gr_h: "Croissance entre recensements", u_gr_help: "Croissance annuelle moyenne (%/an) entre deux recensements. Les villes secondaires accélèrent : l'urbanisation descend dans la hiérarchie urbaine.",
  u_ct_h: "Croissance par ville, 2013–2023", u_ct_help: "Croissance annuelle moyenne de la population de la commune. Bleu : plus vite que le pays (ligne orange).",
  u_ur_h: "Urbain et rural", u_ur_help: "Gauche : population urbaine et rurale de l'annuaire (millions ; 2021–2022 : projections sur la base 2013, d'où la rupture en 2023). Droite : taux d'urbanisation, série longue de la Banque mondiale (ONU) et points de l'annuaire.",
  u_pc_h: "Quelle population utiliser ?", u_pc_help: "Population officielle par wilaya (annuaire ANSADE, recensement 2023 et projections) comparée à la population maillée utilisée pour la lumière par habitant. Écart en % au bout des barres. Le notebook peut remplacer la population maillée par l'officielle (POP_OFFICIAL).",
  u_lv_h: "Les lumières confirment-elles la croissance des villes ?", u_lv_help: "Chaque point : une ville. Horizontal : croissance démographique 2013–2023 (recensements) ; vertical : croissance de la lumière dans la zone tampon de la ville (25 km Nouakchott, 12 km Nouadhibou, 6 à 8 km ailleurs) sur 2014–2023. Taille : population 2023.",
  u_lv_m: "Mesure", u_lv_sol: "Somme des lumières", u_lv_lit: "Surface éclairée",
  u_ul_h: "Urbanisation vue du ciel", u_ul_help: "Part de la lumière émise par les zones urbaines (GHSL, degré d'urbanisation) et part de la population maillée qui y vit.",
  u_lb_h: "Marchés du travail urbain et rural", u_lb_help: "ENTE (ANSADE), par trimestre. La part de la population en âge de travailler est un signe de l'exode rural : les jeunes adultes partent en ville.",
  u_lb_i: "Indicateur",
  u_el_h: "Accès à l'électricité par wilaya", u_el_help: "Part des ménages ayant l'électricité (%). EPCV 2004–2014, recensement 2023.",
  u_lit_h: "Ce que dit la littérature, et ce que cela implique", u_src: "Sources",
  lab: { wap_share: "Part en âge de travailler", participation: "Participation", su1: "Chômage (SU1)", su4: "Sous-utilisation (SU4)", precarious: "Emplois précaires", sector_primary: "Secteur primaire", sector_tertiary: "Secteur tertiaire" },
  urb: "Urbain", rur: "Rural", nat: "Mauritanie", off: "Officiel (ANSADE)", proj: "projection", est: "estimation",
  d_lede: "Qui est connecté, avec quelle qualité, et à quel point le pays est prêt pour l'économie numérique : vitesse mesurée par les tests Speedtest d'Ookla, usage d'internet (UIT), Network Readiness Index et coupures d'internet.",
  dk_users: "Utilisateurs d'internet", dk_mob: "Internet mobile à Nouakchott", dk_mob_s: "débit descendant moyen, {p}", dk_nri: "Network Readiness Index", dk_nri_s: "rang sur {n} pays", dk_cut: "Coupures d'internet", dk_cut_s: "depuis 2019",
  d_sp_h: "Vitesse d'internet par lieu", d_sp_help: "Moyenne pondérée par le nombre de tests, par trimestre. Les villes = 6 km autour du centre (12 km pour Nouakchott).",
  d_kind: "Réseau", d_mob: "Mobile", d_fix: "Fixe", d_met: "Mesure", d_down: "Descendant (Mbit/s)", d_up: "Montant (Mbit/s)", d_lat: "Latence (ms)",
  d_ts_h: "Nombre de tests de débit", d_ts_help: "Un indicateur indirect de l'usage : plus de tests là où il y a plus d'utilisateurs.",
  d_ad_h: "Vitesse par wilaya", d_ad_help: "Débit descendant moyen sur les quatre derniers trimestres.",
  d_wd_h: "La Mauritanie et ses voisins", d_wd_help: "Banque mondiale, WDI (données UIT).", d_ind: "Indicateur",
  d_nri_h: "Network Readiness Index", d_nri_help: "Score (0–100) par pilier : technologie (accès, contenu, technologies futures), personnes (particuliers, entreprises, gouvernement), gouvernance (confiance, régulation, inclusion), impact (économie, qualité de vie, ODD).",
  d_cut_h: "Coupures d'internet", d_cut_cols: ["Début", "Fin", "Étendue", "Motif", "Source"],
  d_lim_h: "Lecture et limites",
  d_lim: `<ul><li>Les tests Speedtest sont volontaires : ils mesurent la qualité de la connexion de ceux qui testent, pas la couverture ni le nombre de connectés.</li>
    <li>Peu de tests hors des villes : les moyennes des wilayas rurales reposent sur quelques centaines de tests.</li>
    <li>Données Ookla sous licence CC BY-NC-SA 4.0 (usage non commercial, attribution « Speedtest® by Ookla® »).</li></ul>`,
  src_h: "Sources de données", src_help: "Toutes les données utilisées, ce qu'elles mesurent, leur résolution et leur période. Les données de base (lumières, population, limites) sont présentées en premier.",
  src_cols: ["Thème", "Source", "Ce que l'on utilise", "Résolution / fréquence", "Période", "Accès et licence"],
  ntl_lab: "Lumières", ntl_v: "VIIRS", ntl_b: "Black Marble", ntl_tip: "Source des lumières pour les pages Vue d'ensemble, Carte, Tendances, Régions et Inégalités",
  ntl_note: "Lumières : Black Marble (NASA VNP46A2) — séries recalculées. Restent VIIRS : les images de la carte et la population « dans le noir » (image annuelle nettoyée).",
} : {
  na: "Data not available: run the corresponding notebook section, then the export (section 21).",
  u_lede: "Mauritania is urbanising fast: in half a century a country of nomads has become a country of towns. Where the population grows, how fast, what the lights say about it, and what it asks of the power grid, housing and jobs.",
  uk_nkc: "Nouakchott's share (2023)", uk_nkc_s: "of the population (21% in 1988)", uk_g: "Nouakchott's growth", uk_g_s: "per year, 2013–2023",
  uk_sec: "Secondary towns", uk_sec_s: "per year, 2013–2023 (country: {n})", uk_add: "More urban residents", uk_add_s: "per year, 2023–2025 (rural: {r})",
  uk_el: "Households with electricity", uk_el_s: "2023 (20% in 2004)",
  u_nkc_h: "Nouakchott, from 15,000 people to 1.5 million", u_nkc_help: "Bars: population (thousands); line: share of the country's population (right axis). Before 1988: estimates; 2024–2025: ANSADE projections.",
  u_sh_h: "Where Mauritanians live", u_sh_help: "Share of the population at each census. 'Other towns': wilaya capitals and Zouérat counted at all four censuses (communes).",
  u_gr_h: "Growth between censuses", u_gr_help: "Average annual growth (%/yr) between two censuses. Secondary towns are speeding up: urbanisation is spreading down the urban hierarchy.",
  u_ct_h: "Growth by town, 2013–2023", u_ct_help: "Average annual growth of the commune's population. Blue: faster than the country (orange line).",
  u_ur_h: "Urban and rural", u_ur_help: "Left: urban and rural population in the yearbook (millions; 2021–2022 are projections on the 2013 base, hence the break in 2023). Right: urban share, World Bank long series (UN) and the yearbook points.",
  u_pc_h: "Which population to use?", u_pc_help: "Official population by wilaya (ANSADE yearbook, 2023 census and projections) against the gridded population used for light per capita. Gap in % at the end of the bars. The notebook can replace the gridded population by the official one (POP_OFFICIAL).",
  u_lv_h: "Do the lights confirm town growth?", u_lv_help: "Each dot is a town. Horizontal: population growth 2013–2023 (censuses); vertical: growth of the light in the town buffer (25 km Nouakchott, 12 km Nouadhibou, 6–8 km elsewhere) over 2014–2023. Size: 2023 population.",
  u_lv_m: "Measure", u_lv_sol: "Sum of lights", u_lv_lit: "Lit area",
  u_ul_h: "Urbanisation seen from space", u_ul_help: "Share of light emitted by urban areas (GHSL degree of urbanisation) and share of the gridded population living there.",
  u_lb_h: "Urban and rural labour markets", u_lb_help: "ENTE (ANSADE), by quarter. The working-age share of the population is a sign of the rural exodus: young adults move to the towns.",
  u_lb_i: "Indicator",
  u_el_h: "Access to electricity by wilaya", u_el_help: "Share of households with electricity (%). EPCV surveys 2004–2014, 2023 census.",
  u_lit_h: "What the literature says, and what it implies", u_src: "Sources",
  lab: { wap_share: "Working-age share", participation: "Participation", su1: "Unemployment (SU1)", su4: "Underutilisation (SU4)", precarious: "Precarious jobs", sector_primary: "Primary sector", sector_tertiary: "Tertiary sector" },
  urb: "Urban", rur: "Rural", nat: "Mauritania", off: "Official (ANSADE)", proj: "projection", est: "estimate",
  d_lede: "Who is connected, how well, and how ready the country is for the digital economy: speed measured by Ookla Speedtest tests, internet use (ITU), the Network Readiness Index and internet shutdowns.",
  dk_users: "Internet users", dk_mob: "Mobile internet in Nouakchott", dk_mob_s: "average download speed, {p}", dk_nri: "Network Readiness Index", dk_nri_s: "rank of {n} countries", dk_cut: "Internet shutdowns", dk_cut_s: "since 2019",
  d_sp_h: "Internet speed by place", d_sp_help: "Test-weighted mean by quarter. Towns = 6 km around the centre (12 km for Nouakchott).",
  d_kind: "Network", d_mob: "Mobile", d_fix: "Fixed", d_met: "Measure", d_down: "Download (Mbps)", d_up: "Upload (Mbps)", d_lat: "Latency (ms)",
  d_ts_h: "Number of speed tests", d_ts_help: "An indirect indicator of use: more tests where there are more users.",
  d_ad_h: "Speed by region", d_ad_help: "Average download speed over the last four quarters.",
  d_wd_h: "Mauritania and its neighbours", d_wd_help: "World Bank WDI (ITU data).", d_ind: "Indicator",
  d_nri_h: "Network Readiness Index", d_nri_help: "Score (0–100) by pillar: technology (access, content, future technologies), people (individuals, businesses, government), governance (trust, regulation, inclusion), impact (economy, quality of life, SDGs).",
  d_cut_h: "Internet shutdowns", d_cut_cols: ["Start", "End", "Scope", "Reason", "Source"],
  d_lim_h: "Reading and limits",
  d_lim: `<ul><li>Speedtest tests are voluntary: they measure the connection quality of those who test, not coverage or the number of people connected.</li>
    <li>Few tests outside the towns: averages for rural regions rest on a few hundred tests.</li>
    <li>Ookla data under CC BY-NC-SA 4.0 (non-commercial use, attribution "Speedtest® by Ookla®").</li></ul>`,
  src_h: "Data sources", src_help: "Every dataset used, what it measures, its resolution and its period. The core data (lights, population, boundaries) come first.",
  src_cols: ["Topic", "Source", "What is used", "Resolution / frequency", "Period", "Access and licence"],
  ntl_lab: "Lights", ntl_v: "VIIRS", ntl_b: "Black Marble", ntl_tip: "Light source of the Overview, Map, Trends, Regions and Inequality pages",
  ntl_note: "Lights: Black Marble (NASA VNP46A2) — series recomputed. Still VIIRS: the map images and the people-in-the-dark figures (cleaned annual image).",
};

/* ==================================================================== POPULATION & URBANISATION */
RENDER.urban = () => {
  const sec = $("#page-urban"), U = S.d.urban;
  if (!U) { empty(sec, T.na); return; }
  const g = U.growth || {}, sh = U.shares || {}, st = U.urban_rural_stats || {}, lab = U.labels || {};
  const last = (g.periods || []).length - 1, el = U.electricity || { years: [], rows: [] };
  const elNat = (el.rows.find((r) => r.wilaya === "Mauritania") || {}).values || [];
  const iNkc = (sh.years || []).indexOf(2023);
  sec.innerHTML = `<p class="lede">${esc(T.u_lede)}</p>
    <div class="kpis">${kpi(T.uk_nkc, pct(iNkc >= 0 ? sh.Nouakchott[iNkc] : null), T.uk_nkc_s)}${kpi(T.uk_g, pct((g.Nouakchott || [])[last]), T.uk_g_s)}
      ${kpi(T.uk_sec, pct((g.secondary || [])[last]), T.uk_sec_s.replace("{n}", pct((g.national || [])[last])))}
      ${kpi(T.uk_add, isNum(st.add_urban) ? big(Math.round(st.add_urban / 1000) * 1000) : "–", T.uk_add_s.replace("{r}", isNum(st.add_rural) ? big(Math.round(st.add_rural / 1000) * 1000) : "–"))}
      ${kpi(T.uk_el, pct(elNat[elNat.length - 1], 0), T.uk_el_s)}</div>
    ${card("u-nkc", T.u_nkc_h, T.u_nkc_help, "chart tall")}
    <div class="grid two">${card("u-sh", T.u_sh_h, T.u_sh_help)}${card("u-gr", T.u_gr_h, T.u_gr_help)}</div>
    ${card("u-ct", T.u_ct_h, T.u_ct_help)}
    ${card("u-ur", T.u_ur_h, T.u_ur_help)}
    <div class="grid two"><article class="card"><h2>${esc(T.u_lv_h)}</h2><p class="help">${esc(T.u_lv_help)}</p>
      <label class="ctl">${esc(T.u_lv_m)} ${seg("u-lv-m", [["g_sol", T.u_lv_sol], ["g_lit_km2", T.u_lv_lit]], "g_sol")}</label><div class="chart" id="u-lv"></div><p class="source" id="u-lv-note"></p></article>
      ${card("u-ul", T.u_ul_h, T.u_ul_help)}</div>
    ${card("u-pc", T.u_pc_h, T.u_pc_help, "chart tall")}
    <article class="card"><h2>${esc(T.u_lb_h)}</h2><p class="help">${esc(T.u_lb_help)}</p>
      <label class="ctl">${esc(T.u_lb_i)} ${seg("u-lb-i", Object.entries(T.lab).filter(([k]) => (U.labour || []).some((r) => isNum(r[k]))), "wap_share")}</label><div class="chart" id="u-lb"></div></article>
    ${card("u-el", T.u_el_h, T.u_el_help, "chart tall")}
    <article class="card prose"><h2>${esc(T.u_lit_h)}</h2>${(U.literature || []).map((l) => `<h3>${esc(l.title)}</h3><p>${esc(l.text)}</p>`).join("")}
      <h3>${esc(T.u_src)}</h3><ul class="small">${(U.sources || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></article>`;
  // Nouakchott since 1965
  const nk = U.nouakchott || [], ns = new Map((U.nkc_share || []).map((r) => [r.year, r.share]));
  plot("u-nkc", [
    { type: "bar", x: nk.map((r) => String(r.year)), y: nk.map((r) => r.population / 1e3), name: FR ? "Population (milliers)" : "Population (thousands)",
      marker: { color: nk.map((r) => (r.kind === "estimate" ? IMF.grey : r.kind === "projection" ? IMF.mid : IMF.blue)) },
      text: nk.map((r) => big(r.population / 1e3)), textposition: "outside", cliponaxis: false, hovertemplate: "%{x}: %{y:,.0f}k<extra></extra>" },
    { x: nk.map((r) => String(r.year)), y: nk.map((r) => (ns.has(r.year) ? ns.get(r.year) : null)), yaxis: "y2", mode: "lines+markers", connectgaps: true,
      name: FR ? "Part du pays (%)" : "Share of the country (%)", line: { color: IMF.orange, width: 2.4 }, hovertemplate: "%{x}: %{y:.1f}%<extra></extra>" },
  ], { yaxis: { title: { text: FR ? "milliers" : "thousands" } }, yaxis2: { overlaying: "y", side: "right", title: { text: "%" }, rangemode: "tozero", showgrid: false }, xaxis: { type: "category" }, margin: { r: 50 } });
  // census shares
  const GC = { Nouakchott: IMF.blue, Nouadhibou: IMF.sky, secondary: IMF.orange, rest: IMF.grey, national: IMF.navy };
  plot("u-sh", ["Nouakchott", "Nouadhibou", "secondary", "rest"].map((k) => ({ type: "bar", x: (sh.years || []).map(String), y: sh[k], name: lab[k] || k,
    marker: { color: GC[k] }, text: (sh[k] || []).map((v) => dec(v, 1)), textposition: "inside", hovertemplate: "%{x}: %{y:.1f}%<extra>" + esc(lab[k] || k) + "</extra>" })),
    { barmode: "stack", xaxis: { type: "category" }, yaxis: { title: { text: "%" }, range: [0, 100] }, legend: { y: 1.2 } });
  plot("u-gr", ["Nouakchott", "Nouadhibou", "secondary", "national", "rest"].map((k) => ({ type: "bar", x: g.periods, y: g[k], name: lab[k] || k, marker: { color: GC[k] },
    text: (g[k] || []).map((v) => dec(v, 1)), textposition: "outside", cliponaxis: false, hovertemplate: "%{x}: %{y:.1f}%/yr<extra>" + esc(lab[k] || k) + "</extra>" })),
    { barmode: "group", yaxis: { title: { text: FR ? "%/an" : "%/yr" } }, legend: { y: 1.2 } });
  // towns
  const ct = (U.cities || []).slice().sort((a, b) => b.g_2013_2023 - a.g_2013_2023), gn = (g.national || [])[last];
  plot("u-ct", [{ type: "bar", x: ct.map((r) => r.city), y: ct.map((r) => r.g_2013_2023), marker: { color: ct.map((r) => (r.g_2013_2023 >= gn ? IMF.blue : IMF.grey)) },
    text: ct.map((r) => dec(r.g_2013_2023, 1)), textposition: "outside", cliponaxis: false, customdata: ct.map((r) => [r.p2013, r.p2023, r.wilaya]),
    hovertemplate: "%{x} (%{customdata[2]}): %{y:.1f}%/yr<br>2013: %{customdata[0]:,} → 2023: %{customdata[1]:,}<extra></extra>", showlegend: false }],
    { yaxis: { title: { text: FR ? "%/an" : "%/yr" } }, shapes: isNum(gn) ? [{ type: "line", xref: "paper", x0: 0, x1: 1, y0: gn, y1: gn, line: { color: IMF.rust, dash: "dash", width: 2 } }] : [],
      annotations: isNum(gn) ? [{ xref: "paper", x: 1, y: gn, text: `${T.nat} ${dec(gn, 1)}`, showarrow: false, xanchor: "right", yanchor: "bottom", font: { color: IMF.rust } }] : [] });
  // urban / rural
  const ur = U.urban_rural || [], w = U.wdi_urban || [];
  const urLab = ur.map((r) => String(r.year) + (String(r.base || "").includes("2013") ? "*" : ""));
  plot("u-ur", [
    { type: "bar", x: urLab, y: ur.map((r) => r.urban / 1e6), name: T.urb, marker: { color: IMF.blue }, xaxis: "x", yaxis: "y", hovertemplate: "%{x}: %{y:.2f}M<extra>" + esc(T.urb) + "</extra>" },
    { type: "bar", x: urLab, y: ur.map((r) => r.rural / 1e6), name: T.rur, marker: { color: IMF.green }, xaxis: "x", yaxis: "y", hovertemplate: "%{x}: %{y:.2f}M<extra>" + esc(T.rur) + "</extra>" },
    { x: w.map((r) => r.year), y: w.map((r) => r.value), name: FR ? "Taux d'urbanisation (Banque mondiale)" : "Urban share (World Bank)", mode: "lines", line: { color: IMF.navy, width: 2.4 }, xaxis: "x2", yaxis: "y2" },
    { x: ur.map((r) => r.year), y: ur.map((r) => r.urban_share), name: FR ? "Taux d'urbanisation (ANSADE)" : "Urban share (ANSADE)", mode: "markers", marker: { color: IMF.rust, size: 9 }, xaxis: "x2", yaxis: "y2" },
  ], { barmode: "group", grid: { rows: 1, columns: 2, pattern: "independent" }, xaxis: { domain: [0, 0.42], type: "category" }, xaxis2: { domain: [0.55, 1] },
    yaxis: { title: { text: FR ? "millions" : "millions" } }, yaxis2: { title: { text: "%" }, anchor: "x2" }, legend: { y: 1.22 } });
  // lights vs towns
  const lv = U.lights_validation || [];
  const drawLv = (m) => {
    const ok = lv.filter((r) => isNum(r[m]) && isNum(r.g_pop_census)), mx = Math.max(...ok.map((r) => r.p2023), 1);
    plot("u-lv", ok.length ? [{ x: ok.map((r) => r.g_pop_census), y: ok.map((r) => r[m]), mode: "markers+text", text: ok.map((r) => r.city), textposition: "top center",
      marker: { size: ok.map((r) => 8 + 24 * Math.sqrt(r.p2023 / mx)), color: IMF.blue, opacity: 0.75, line: { color: "#fff", width: 1 } },
      customdata: ok.map((r) => [r.district, r.years]), hovertemplate: "%{text} — %{customdata[0]}<br>" + (FR ? "population" : "population") + " %{x:.1f}%/yr · " + (FR ? "lumières" : "lights") + " %{y:.1f}%/yr (%{customdata[1]})<extra></extra>", showlegend: false }] : [],
      { xaxis: { title: { text: FR ? "Croissance de la population 2013–2023 (%/an)" : "Population growth 2013–2023 (%/yr)" } }, yaxis: { title: { text: FR ? "Croissance des lumières (%/an)" : "Light growth (%/yr)" } } });
    const rho = U.lights_rho;
    $("#u-lv-note").textContent = isNum(rho) ? (FR ? `Corrélation de rang (somme des lumières) : ${dec(rho, 2)} sur ${lv.length} villes.` : `Rank correlation (sum of lights): ${dec(rho, 2)} over ${lv.length} towns.`) : "";
  };
  drawLv("g_sol"); onSeg("u-lv-m", drawLv);
  const ul = U.urban_lights || [];
  plot("u-ul", ul.length ? [
    { x: ul.map((r) => r.year), y: ul.map((r) => r.light_urban_share), name: FR ? "Lumière émise en zone urbaine" : "Light from urban areas", mode: "lines+markers", line: { color: IMF.gold, width: 2.6 } },
    { x: ul.map((r) => r.year), y: ul.map((r) => r.pop_urban_share_grid), name: FR ? "Population urbaine (maillée)" : "Urban population (gridded)", mode: "lines+markers", line: { color: IMF.blue, width: 2.6 } },
  ] : [], { yaxis: { title: { text: "%" } } });
  // population sources
  const pc = U.pop_compare || [];
  if (pc.length) {
    const y = Math.max(...pc.map((r) => r.year)), d = pc.filter((r) => r.year === y).sort((a, b) => a.pop_official - b.pop_official), src = d.length ? d[0].grid_source : "";
    plot("u-pc", [{ type: "bar", orientation: "h", y: d.map((r) => r.name), x: d.map((r) => r.pop_official / 1e3), name: `${T.off} ${y}`, marker: { color: IMF.blue } },
      { type: "bar", orientation: "h", y: d.map((r) => r.name), x: d.map((r) => r.pop_grid / 1e3), name: `${src} ${d[0] && d[0].grid_year ? d[0].grid_year : y}`, marker: { color: IMF.orange },
        text: d.map((r) => (isNum(r.gap_pct) ? (r.gap_pct > 0 ? "+" : "") + dec(r.gap_pct, 0) + "%" : "")), textposition: "outside", cliponaxis: false }],
      { barmode: "group", xaxis: { title: { text: FR ? "milliers" : "thousands" } }, margin: { l: 130, r: 40 } });
  } else plot("u-pc", []);
  // labour
  const lb = U.labour || [];
  const drawLb = (k) => plot("u-lb", [["Urban", T.urb, IMF.blue], ["Rural", T.rur, IMF.green]].map(([a, l, c]) => {
    const z = lb.filter((r) => r.area === a && isNum(r[k])).sort((p, q) => (p.period < q.period ? -1 : 1));
    return { x: z.map((r) => qlab(r.period)), y: z.map((r) => r[k]), name: l, mode: "lines+markers", line: { color: c, width: 2.4 } }; }).filter((t) => t.y.length),
    { xaxis: { type: "category" }, yaxis: { title: { text: "%" } } });
  drawLb("wap_share"); onSeg("u-lb-i", drawLb);
  // electricity
  const er = el.rows.filter((r) => r.wilaya !== "Mauritania").sort((a, b) => a.values[a.values.length - 1] - b.values[b.values.length - 1]);
  const yi = [0, el.years.indexOf(2014), el.years.length - 1].filter((i) => i >= 0);
  plot("u-el", yi.map((i, j) => ({ type: "bar", orientation: "h", y: er.map((r) => r.wilaya), x: er.map((r) => r.values[i]), name: String(el.years[i]),
    marker: { color: [IMF.pale, IMF.light, IMF.blue][j] }, hovertemplate: "%{y}: %{x:.1f}%<extra>" + el.years[i] + "</extra>" })),
    { barmode: "group", xaxis: { title: { text: "%" }, range: [0, 100] }, margin: { l: 140 } });
};

/* ==================================================================== DIGITAL */
RENDER.digital = () => {
  const sec = $("#page-digital"), D = S.d.digital;
  if (!D) { empty(sec, T.na); return; }
  const O = D.ookla || {}, W = D.wdi || [], N = (D.nri || []).slice().sort((a, b) => a.edition - b.edition), SD = D.shutdowns || [];
  const u = W.filter((r) => r.iso3 === "MRT" && r.indicator === "internet_users").sort((a, b) => a.year - b.year), ul = u[u.length - 1];
  const pl = (O.place || []).filter((r) => r.kind === "mobile" && r.place === "Nouakchott").sort((a, b) => (a.period < b.period ? -1 : 1)), pll = pl[pl.length - 1];
  const nr = N[N.length - 1];
  sec.innerHTML = `<p class="lede">${esc(T.d_lede)}</p>
    <div class="kpis">${kpi(T.dk_users, ul ? pct(ul.value, 0) : "–", ul ? String(ul.year) : "")}
      ${kpi(T.dk_mob, pll ? dec(pll.down_mbps, 0) + (FR ? " Mbit/s" : " Mbps") : "–", pll ? T.dk_mob_s.replace("{p}", qlab(pll.period)) : "")}
      ${kpi(T.dk_nri, nr ? `${nr.rank}` : "–", nr ? T.dk_nri_s.replace("{n}", nr.of) + ` (${nr.edition})` : "")}
      ${kpi(T.dk_cut, String(SD.length), T.dk_cut_s)}</div>
    <article class="card"><h2>${esc(T.d_sp_h)}</h2><p class="help">${esc(T.d_sp_help)}</p>
      <div class="map-toolbar" style="flex-wrap:wrap;gap:10px 18px"><label class="ctl">${esc(T.d_kind)} ${seg("d-k", [["mobile", T.d_mob], ["fixed", T.d_fix]], "mobile")}</label>
      <label class="ctl">${esc(T.d_met)} ${seg("d-m", [["down_mbps", T.d_down], ["up_mbps", T.d_up], ["latency_ms", T.d_lat]], "down_mbps")}</label></div>
      <div class="chart" id="d-sp"></div><p class="source">Speedtest® by Ookla® Global Fixed and Mobile Network Performance Maps (CC BY-NC-SA 4.0)</p></article>
    <div class="grid two">${card("d-ts", T.d_ts_h, T.d_ts_help)}${card("d-ad", T.d_ad_h, T.d_ad_help, "chart tall")}</div>
    <div class="grid two"><article class="card"><h2>${esc(T.d_wd_h)}</h2><p class="help">${esc(T.d_wd_help)}</p>
      <label class="ctl">${esc(T.d_ind)} ${seg("d-w", Object.entries(D.wdi_labels || {}).map(([k, v]) => [k, v.split(" (")[0]]), "internet_users")}</label><div class="chart" id="d-wd"></div></article>
      ${card("d-nri", T.d_nri_h, T.d_nri_help)}</div>
    <article class="card"><h2>${esc(T.d_cut_h)}</h2><div class="table-wrap"><table class="data ud-left"><thead><tr>${T.d_cut_cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>
      ${SD.map((r) => `<tr><td>${esc(r.start)}</td><td>${esc(r.end || "?")}</td><td>${esc(r.scope)}</td><td>${esc(r.reason)}</td><td><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.source)}</a></td></tr>`).join("")}</tbody></table></div></article>
    <article class="card prose"><h2>${esc(T.d_lim_h)}</h2>${T.d_lim}<ul class="small">${(D.sources || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></article>`;
  const st = { k: "mobile", m: "down_mbps" };
  const drawSp = () => plot("d-sp", Object.keys(D.places || {}).map((p) => {
    const z = (O.place || []).filter((r) => r.kind === st.k && r.place === p).sort((a, b) => (a.period < b.period ? -1 : 1));
    return { x: z.map((r) => qlab(r.period)), y: z.map((r) => r[st.m]), name: D.places[p], mode: "lines+markers", line: { color: (D.colors || {})[p], width: 2.3 },
      customdata: z.map((r) => r.tests), hovertemplate: "%{x}: %{y:.1f}<br>%{customdata:,} tests<extra>" + esc(D.places[p]) + "</extra>" }; }).filter((t) => t.y.length),
    { xaxis: { type: "category" }, yaxis: { title: { text: st.m === "latency_ms" ? "ms" : (FR ? "Mbit/s" : "Mbps") } } });
  drawSp(); onSeg("d-k", (k) => { st.k = k; drawSp(); }); onSeg("d-m", (m) => { st.m = m; drawSp(); });
  const nat = O.national || [];
  plot("d-ts", [["mobile", T.d_mob, IMF.blue], ["fixed", T.d_fix, IMF.orange]].map(([k, l, c]) => { const z = nat.filter((r) => r.kind === k);
    return { type: "bar", x: z.map((r) => qlab(r.period)), y: z.map((r) => r.tests), name: l, marker: { color: c } }; }).filter((t) => t.y.length),
    { barmode: "stack", xaxis: { type: "category" }, yaxis: { title: { text: "tests" } } });
  const ad = (O.adm1 || []).filter((r) => r.kind === "mobile").sort((a, b) => a.down_mbps - b.down_mbps);
  plot("d-ad", ad.length ? [{ type: "bar", orientation: "h", y: ad.map((r) => r.name), x: ad.map((r) => r.down_mbps), marker: { color: IMF.blue },
    text: ad.map((r) => dec(r.down_mbps, 1)), textposition: "outside", cliponaxis: false, customdata: ad.map((r) => r.tests),
    hovertemplate: "%{y}: %{x:.1f}<br>%{customdata:,} tests<extra></extra>", showlegend: false }] : [], { xaxis: { title: { text: FR ? "Mbit/s (mobile)" : "Mbps (mobile)" } }, margin: { l: 130, r: 40 } });
  const drawW = (k) => plot("d-wd", Object.keys(D.peers || {}).map((c) => { const z = W.filter((r) => r.iso3 === c && r.indicator === k).sort((a, b) => a.year - b.year);
    return { x: z.map((r) => r.year), y: z.map((r) => r.value), name: D.peers[c], mode: "lines", line: { width: c === "MRT" ? 3.4 : 1.6, color: c === "MRT" ? IMF.blue : undefined, dash: c === "SSF" ? "dot" : undefined } }; }).filter((t) => t.y.length),
    { yaxis: { title: { text: ((D.wdi_labels || {})[k] || "").replace(/^[^(]*\(?/, "").replace(")", "") || "" } } });
  drawW("internet_users"); onSeg("d-w", drawW);
  const pill = FR ? [["technology", "Technologie"], ["people", "Personnes"], ["governance", "Gouvernance"], ["impact", "Impact"]] : [["technology", "Technology"], ["people", "People"], ["governance", "Governance"], ["impact", "Impact"]];
  plot("d-nri", N.map((r, i) => ({ type: "bar", x: pill.map((p) => p[1]), y: pill.map((p) => r[p[0]]), name: `${r.edition} (${r.rank}/${r.of})`, marker: { color: [IMF.light, IMF.mid, IMF.blue][i % 3] } })),
    { barmode: "group", yaxis: { title: { text: "score" }, range: [0, 50] } });
};

/* ==================================================================== METHODS: DATA SOURCES */
const SRC = FR ? [
  ["Lumières (principal)", "NOAA/EOG — VIIRS DNB VCMSLCFG mensuel et VNL V2.2 annuel", "Radiance nocturne mensuelle sans lumière parasite ; composite annuel qui masque le fond et les feux éphémères", "~460 m · mensuel, annuel", "2014 →", "Earth Engine · domaine public, attribution"],
  ["Lumières (alternative)", "NASA — Black Marble VNP46A2", "Radiance quotidienne corrigée de l'angle de visée et de la lune ; moyenne mensuelle des nuits claires (qualité ≤ 1) ; coupures nuit par nuit", "~500 m · quotidien", "2012 →", "Earth Engine · domaine public"],
  ["Lumières (série longue)", "Li et al. (2020), DMSP–VIIRS harmonisé", "Tendance longue 1992 →, en unités DMSP", "~1 km · annuel", "1992 →", "Figshare · CC BY 4.0"],
  ["Population maillée", "JRC GHSL (GHS-POP, GHS-SMOD) ou WorldPop", "Habitants par pixel ; degré d'urbanisation (urbain / rural)", "100 m · 5 ans (GHSL), annuel (WorldPop)", "2000 →", "CC BY 4.0"],
  ["Population officielle", "ANSADE — recensements RGPH 1977–2023, annuaire sociodémographique 2025", "Population par wilaya et ville, urbain / rural, projections 2024–2025, accès à l'électricité", "wilaya, commune · recensements, annuel", "1977 → 2025", "ANSADE (publication)"],
  ["Limites administratives", "geoBoundaries (CGAZ), FAO GAUL en secours", "Wilayas (ADM1), moughataas (ADM2)", "vecteur", "—", "CC BY 4.0"],
  ["Comptes nationaux", "ANSADE — PIB trimestriel, IPI, notes de croissance ; portail mauritania.opendataforafrica.org", "Croissance trimestrielle, contributions par branche, production industrielle", "national · trimestriel", "2014 →", "ANSADE (publication, API Knoema)"],
  ["PIB et indicateurs", "Banque mondiale — WDI", "PIB réel, population, accès à l'électricité, urbanisation, internet, valeur ajoutée par secteur", "national · annuel", "1990 →", "API · CC BY 4.0"],
  ["Emploi", "ANSADE — ENTE (enquête trimestrielle), annuaire 2025", "Chômage SU1–SU4 (BIT 2013), participation, secteurs, urbain / rural, éducation", "national, milieu · trimestriel", "2024 →", "ANSADE (rapports)"],
  ["NO₂", "ESA Copernicus — Sentinel-5P TROPOMI", "Colonne troposphérique de NO₂ (combustion)", "~5 km · quotidien → mensuel", "2018 →", "Earth Engine · licence Copernicus"],
  ["Végétation", "NDVI sur les terres cultivées (Earth Engine / FAO ASIS)", "NDVI par région, anomalies, lien avec la valeur ajoutée agricole", "région · décadaire, mensuel", "2001 →", "Libre"],
  ["Réseau électrique", "OpenStreetMap (Overpass), événements datés (SOMELEC, presse)", "Lignes par tension, postes, centrales ; mises en service", "vecteur", "—", "ODbL"],
  ["Zones industrielles", "Détection par les lumières (section 12) et OpenStreetMap landuse=industrial", "Contours des zones, croissance des lumières par zone", "vecteur", "—", "ODbL (OSM)"],
  ["Ports et commerce", "FMI PortWatch", "Escales et volumes estimés d'import / export (AIS)", "port · quotidien", "2019 →", "FMI, attribution"],
  ["Climat", "NOAA CPC (RONI), CHIRPS, notebook El Niño", "Indice El Niño, pluie et pâturages de la saison", "national, wilaya · mensuel, décadaire", "1980 →", "Domaine public"],
  ["Numérique", "Ookla Speedtest open data ; UIT (WDI) ; Network Readiness Index ; Internet Society, CIVICUS", "Vitesse, latence, nombre de tests ; usage d'internet ; préparation numérique ; coupures", "tuile ~600 m · trimestriel ; national · annuel", "2019 →", "CC BY-NC-SA 4.0 (Ookla)"],
  ["Presse", "Médias mauritaniens en ligne (FR / AR / EN)", "Articles sur les coupures, vocabulaire économique", "article · quotidien", "2014 →", "Usage d'analyse, liens vers les sources"],
] : [
  ["Lights (main)", "NOAA/EOG — VIIRS DNB VCMSLCFG monthly and VNL V2.2 annual", "Monthly night-time radiance without stray light; annual composite that masks background and ephemeral lights", "~460 m · monthly, annual", "2014 →", "Earth Engine · public domain, attribution"],
  ["Lights (alternative)", "NASA — Black Marble VNP46A2", "Daily radiance corrected for view angle and moonlight; monthly mean of clear nights (quality ≤ 1); night-by-night outages", "~500 m · daily", "2012 →", "Earth Engine · public domain"],
  ["Lights (long series)", "Li et al. (2020), harmonised DMSP–VIIRS", "Long trend from 1992, in DMSP units", "~1 km · annual", "1992 →", "Figshare · CC BY 4.0"],
  ["Gridded population", "JRC GHSL (GHS-POP, GHS-SMOD) or WorldPop", "People per pixel; degree of urbanisation (urban / rural)", "100 m · 5-yearly (GHSL), annual (WorldPop)", "2000 →", "CC BY 4.0"],
  ["Official population", "ANSADE — RGPH censuses 1977–2023, socio-demographic yearbook 2025", "Population by wilaya and town, urban / rural, 2024–2025 projections, electricity access", "wilaya, commune · censuses, annual", "1977 → 2025", "ANSADE (publication)"],
  ["Administrative boundaries", "geoBoundaries (CGAZ), FAO GAUL as fallback", "Wilayas (ADM1), moughataas (ADM2)", "vector", "—", "CC BY 4.0"],
  ["National accounts", "ANSADE — quarterly GDP, IPI, growth notes; portal mauritania.opendataforafrica.org", "Quarterly growth, contributions by branch, industrial production", "national · quarterly", "2014 →", "ANSADE (publication, Knoema API)"],
  ["GDP and indicators", "World Bank — WDI", "Real GDP, population, electricity access, urbanisation, internet, value added by sector", "national · annual", "1990 →", "API · CC BY 4.0"],
  ["Labour", "ANSADE — ENTE (quarterly survey), yearbook 2025", "Unemployment SU1–SU4 (ILO 2013), participation, sectors, urban / rural, education", "national, area · quarterly", "2024 →", "ANSADE (reports)"],
  ["NO₂", "ESA Copernicus — Sentinel-5P TROPOMI", "Tropospheric NO₂ column (combustion)", "~5 km · daily → monthly", "2018 →", "Earth Engine · Copernicus licence"],
  ["Vegetation", "NDVI over cropland (Earth Engine / FAO ASIS)", "NDVI by region, anomalies, link with agricultural value added", "region · dekadal, monthly", "2001 →", "Open"],
  ["Power grid", "OpenStreetMap (Overpass), dated events (SOMELEC, press)", "Lines by voltage, substations, plants; commissioning dates", "vector", "—", "ODbL"],
  ["Industrial zones", "Detection from lights (section 12) and OpenStreetMap landuse=industrial", "Zone outlines, light growth by zone", "vector", "—", "ODbL (OSM)"],
  ["Ports and trade", "IMF PortWatch", "Port calls and estimated import / export volumes (AIS)", "port · daily", "2019 →", "IMF, attribution"],
  ["Climate", "NOAA CPC (RONI), CHIRPS, El Niño notebook", "El Niño index, season rainfall and pasture", "national, wilaya · monthly, dekadal", "1980 →", "Public domain"],
  ["Digital", "Ookla Speedtest open data; ITU (WDI); Network Readiness Index; Internet Society, CIVICUS", "Speed, latency, number of tests; internet use; digital readiness; shutdowns", "~600 m tile · quarterly; national · annual", "2019 →", "CC BY-NC-SA 4.0 (Ookla)"],
  ["News", "Mauritanian online media (FR / AR / EN)", "Articles on outages, economic vocabulary", "article · daily", "2014 →", "Analysis use, links to the sources"],
];
const baseMethod = RENDER.method;
RENDER.method = () => {
  baseMethod();
  const el = $("#method"); if (!el) return;
  const box = document.createElement("div");
  box.innerHTML = `<h2 id="sources">${esc(T.src_h)}</h2><p>${esc(T.src_help)}</p><div class="table-wrap"><table class="data ud-left src-table"><thead><tr>${T.src_cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${SRC.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<td><b>${esc(c)}</b></td>` : `<td>${esc(c)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
  const first = el.querySelector("h2");
  el.insertBefore(box, first ? first.nextElementSibling && first.nextElementSibling.nextElementSibling : null);
};


/* ==================================================================== TOPICS: show the sub-tabs of the selected topic */
function syncTopics() {
  const page = (location.hash || "#overview").slice(1).split("?")[0];
  const tab = document.querySelector(`.tabs a[data-page="${page}"]`) || document.querySelector(".tabs a");
  const topic = tab ? tab.dataset.topic : null;
  document.querySelectorAll(".topics a").forEach((a) => (a.dataset.topic === topic ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
  document.querySelectorAll(".tabs a").forEach((a) => { a.hidden = a.dataset.topic !== topic; });
}
window.addEventListener("hashchange", syncTopics);
document.addEventListener("DOMContentLoaded", syncTopics);
syncTopics();

/* ==================================================================== SOURCE CAPTIONS FOLLOW THE LIGHT SOURCE */
const VIIRS_RE = /VIIRS(?: DNB)?(?: VNL V2(?:\.\d)?)?(?: monthly| annual| mensuel(?:le)?s?| annuel(?:le)?s?)?(?: \(VCMSLCFG\))?/g;
function relabelSources() {
  if (S.src !== "bm") { document.querySelectorAll("[data-orig-src]").forEach((el) => { el.textContent = el.dataset.origSrc; delete el.dataset.origSrc; }); return; }
  const pages = ["overview", "time", "regions", "inequality"].map((p) => document.getElementById("page-" + p)).filter(Boolean);
  pages.forEach((pg) => pg.querySelectorAll(".source, .help").forEach((el) => {
    const t = el.dataset.origSrc || el.textContent;
    if (!VIIRS_RE.test(t)) { VIIRS_RE.lastIndex = 0; return; }
    VIIRS_RE.lastIndex = 0; el.dataset.origSrc = t;
    el.textContent = t.replace(VIIRS_RE, "NASA Black Marble VNP46A2");
  }));
  const k = [...document.querySelectorAll("#kpis .kpi")].find((x) => /dark|noir/i.test(x.textContent));
  if (k && !k.querySelector(".src-note")) k.insertAdjacentHTML("beforeend", `<div class="sub src-note">${FR ? "toujours VIIRS (image annuelle nettoyée)" : "always VIIRS (cleaned annual image)"}</div>`);
}
window.addEventListener("hashchange", () => setTimeout(relabelSources, 60));

/* ==================================================================== VIIRS / BLACK MARBLE SWITCH */
const CORE = { regions: "regions.csv", annual: "annual_units.csv", monthly: "monthly_national.csv", madm1: "monthly_adm1.csv", gdp: "gdp.json",
  breaks: "breaks.json", ineq: "inequality.json", growth: "growth.json", adm1: "adm1.geojson", adm2: "adm2.geojson", summary: "summary.json" };
const RESET = ["overview", "map", "time", "regions", "inequality", "zones"];
async function setSource(src) {
  const info = S.d.ntlsrc; if (!info || src === (S.src || info.default)) return;
  S.core = S.core || {};
  const def = info.default;
  if (!S.core[def]) S.core[def] = Object.fromEntries(Object.keys(CORE).map((k) => [k, S.d[k]]));
  if (!S.core[src]) {
    const base = `data/${S.iso}/${src === def ? "" : (info.dir || "alt") + "/"}`;
    const ks = Object.keys(CORE), res = await Promise.allSettled(ks.map((k) => (CORE[k].endsWith(".csv") ? getCSV(base + CORE[k]) : getJSON(base + CORE[k]))));
    S.core[src] = Object.fromEntries(ks.map((k, i) => [k, res[i].status === "fulfilled" ? res[i].value : S.core[def][k]]));
  }
  const c = S.core[src];
  Object.keys(CORE).forEach((k) => { if (k !== "summary") S.d[k] = c[k]; });
  // KPIs and the core messages (same theme) come from the chosen source; the other sections' messages stay
  const alt = new Map(((c.summary || {}).messages || []).map((m) => [m.theme, m]));
  S.d.summary = { ...S.core[def].summary, kpis: (c.summary || S.core[def].summary).kpis,
    messages: (S.core[def].summary.messages || []).map((m) => alt.get(m.theme) || m) };
  S.d.names = Object.fromEntries((S.d.regions || []).map((r) => [r.unit_id, r.name]));
  S.src = src; store.set("ntl-source", src);
  S.mapReady = false; if (S.map) { S.map.remove(); S.map = null; } if (S.mapB) { S.mapB.remove(); S.mapB = null; }
  RESET.forEach((p) => { S.rendered[p] = false; });
  const n = $("#ntl-note"); if (n) n.hidden = src === "viirs";
  route();
  setTimeout(relabelSources, 80);
}
window.ntlSourceUI = async () => {
  const box = $("#ntl-src"); if (!box) return;
  if (!S.d.ntlsrc) { box.hidden = true; return; }
  box.hidden = false; S.src = S.d.ntlsrc.default;
  box.innerHTML = `<span class="ntl-lab">${esc(T.ntl_lab)}</span>${seg("ntl-seg", [["viirs", T.ntl_v], ["bm", T.ntl_b]], S.src)}`;
  box.title = T.ntl_tip;
  onSeg("ntl-seg", (k) => setSource(k));
  let note = $("#ntl-note");
  if (!note) { note = document.createElement("div"); note.id = "ntl-note"; note.className = "banner info"; note.textContent = T.ntl_note; const sb = $("#synthetic-banner"); sb.parentNode.insertBefore(note, sb.nextSibling); }
  note.hidden = true;
  const want = store.get("ntl-source");
  if (want && want !== S.src && (S.d.ntlsrc.sources || []).includes(want)) { $$("#ntl-seg button").forEach((b) => b.classList.toggle("on", b.dataset.k === want)); await setSource(want); }
};
})();
