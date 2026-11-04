/* Labour market and Climate pages — shared by the EN and FR sites (language from <html lang>). Uses the helpers of
 * app.js (S, $, $$, F, esc, plot, C, isNum, RENDER). Data: labour.json, climate.json. */
"use strict";
(() => {
const FR = (document.documentElement.lang || "en").toLowerCase().startsWith("fr");
const IMF = { blue: "#004C97", sky: "#009CDE", navy: "#001E60", mid: "#5E8AB4", orange: "#FF8200", rust: "#E35205", gold: "#F2A900",
  green: "#78BE20", red: "#DA291C", purple: "#8031A7", teal: "#00B0B9", grey: "#B1B3B3", dgrey: "#707372" };
const PAL = [IMF.blue, IMF.orange, IMF.sky, IMF.green, IMF.red, IMF.purple, IMF.gold, IMF.navy, IMF.teal];
const dec = (v, d = 1) => (isNum(v) ? (FR ? v.toFixed(d).replace(".", ",") : v.toFixed(d)) : "–");
const sgn = (v, d = 1) => (isNum(v) ? (v > 0 ? "+" : "") + dec(v, d) : "–");
const pct = (v, d = 1) => (isNum(v) ? dec(v, d) + (FR ? " %" : "%") : "–");
const kpi = (label, value, sub = "") => `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div><div class="sub">${esc(sub)}</div></div>`;
const seg = (id, opts, on) => `<div class="seg" id="${id}">${opts.map(([k, l]) => `<button type="button" data-k="${esc(k)}" class="${k === on ? "on" : ""}">${esc(l)}</button>`).join("")}</div>`;
const onSeg = (id, fn) => { const el = $("#" + id); if (!el) return; el.onclick = (e) => { const b = e.target.closest("button"); if (!b || b.disabled) return;
  $$(`#${id} button`).forEach((x) => x.classList.toggle("on", x === b)); fn(b.dataset.k); }; };
const qlab = (q) => String(q).replace("Q", FR ? " T" : " Q");
const COLON = FR ? " : " : ": ";
const empty = (sec, msg) => { sec.innerHTML = `<article class="card"><p class="help">${esc(msg)}</p></article>`; };
const PH = { "El Niño": IMF.rust, "La Niña": IMF.blue, Neutral: IMF.grey };
const RN = (r) => (FR && r === "Agro-pastoral south" ? "Sud agro-pastoral" : r);

const T = FR ? {
  na: "Données non disponibles : relancer la section correspondante du notebook, puis l'export (section 19).",
  l_lede: "Qui travaille, où, avec quelle formation — et qui pourrait occuper les emplois des nouveaux secteurs (mines, gaz, hydrogène vert, agro-alimentaire, élevage, numérique). Source principale : l'enquête nationale trimestrielle sur l'emploi (ENTE) de l'ANSADE, complétée par l'annuaire sociodémographique 2025.",
  k_su1: "Chômage (SU1)", k_su4: "Sous-utilisation (SU4)", k_part: "Taux de participation", k_youth: "Chômage des 14-35 ans", k_emp: "Personnes en emploi",
  vs: "sur un an", pts: "pt", th: "milliers",
  ex_h: "Explorer un indicateur", ex_help: "Choisir l'indicateur et la ventilation. Les rapports trimestriels donnent chaque trimestre et le même trimestre un an plus tôt ; le T1-2026 n'est pas publié.",
  ex_ind: "Indicateur", ex_grp: "Ventilation", ex_view: "Vue", v_lines: "Évolution", v_yoy: "Même trimestre, un an d'écart",
  st_h: "Structure de l'emploi par grand secteur", st_help: "Part des personnes en emploi (%). Au survol : effectifs estimés (population × parts de l'enquête). Primaire : agriculture, élevage, pêche ; secondaire : industrie, mines, BTP ; tertiaire : commerce et services.",
  a_tot: "Ensemble", a_urb: "Urbain", a_rur: "Rural", s_p: "Primaire", s_s: "Secondaire", s_t: "Tertiaire",
  pr_h: "Où sont les emplois, où est la valeur ajoutée", pr_help: "Productivité relative = part de la valeur ajoutée / part de l'emploi (1 = moyenne de l'économie). Le secondaire comprend les mines : beaucoup de valeur, peu d'emplois.",
  pr_emp: "Part de l'emploi", pr_va: "Part de la valeur ajoutée", pr_rel: "productivité relative",
  rs_h: "Réserve de main-d'œuvre par niveau d'instruction", rs_help: "Chômeurs estimés (milliers) et taux de sous-utilisation. C'est le vivier immédiat pour les nouveaux secteurs.",
  rs_u: "Chômeurs (milliers)", rs_su4: "Sous-utilisation SU4 (%)", rs_su1: "Chômage SU1 (%)",
  fd_h: "Ce que les étudiants étudient", fd_help: "Inscrits dans l'enseignement supérieur national par domaine (CITE 2013). Ce sont des inscrits, pas des diplômés ; la formation professionnelle n'est pas couverte.",
  tg_h: "Secteurs cibles et formations qui les alimentent", tg_cols: ["Secteur cible", "Domaines d'études", "Étudiants (dernière année)", "Part des étudiants", "Boursiers à l'étranger", "Métiers recherchés"],
  tg_note: "Les domaines se recoupent (les sciences alimentent à la fois les mines et le numérique).",
  exm_h: "Taux de réussite aux examens nationaux", exm_help: "Le baccalauréat conditionne l'accès au supérieur.",
  wl_h: "Chômage et activité par wilaya", wl_help: "Annuaire sociodémographique 2025 (EPCV 2014–2019, ENESI 2017, ENTE 2024–2025). Comparer avec prudence : enquêtes différentes.",
  wl_ind: "Indicateur", wl_u: "Taux de chômage", wl_a: "Taux d'activité",
  how_h: "Comment ces données éclairent la diversification",
  how: `<ul><li><b>Demande</b> — quels secteurs peuvent créer des emplois ? Les mines pèsent environ 20 % du PIB mais 1 % des emplois ; l'agriculture et l'élevage, environ un tiers des emplois (Banque mondiale, <i>Beyond Extractives</i>, 2025). La diversification crée des emplois quand elle passe par des secteurs intensifs en main-d'œuvre (agro-alimentaire, élevage, pêche, services numériques, tourisme) et par les chaînes d'approvisionnement des grands projets (gaz, hydrogène).</li>
    <li><b>Offre</b> — qui peut occuper ces emplois ? Le chômage (SU1) sous-estime le besoin d'emploi : la sous-utilisation (SU3, SU4, normes BIT de 2013) ajoute la main-d'œuvre potentielle et le sous-emploi. Le vivier est jeune, féminin et de niveau secondaire.</li>
    <li><b>Compétences</b> — les formations correspondent-elles ? Comparer les domaines d'études aux métiers des secteurs cibles (méthode STED de l'OIT : anticiper les compétences des secteurs exportateurs). Les grands projets demandent surtout des techniciens (soudeurs, tuyauteurs, électriciens, maintenance), que forme la formation professionnelle plus que l'université.</li>
    <li><b>Productivité</b> — la transformation structurelle déplace les travailleurs vers les secteurs plus productifs (McMillan et Rodrik, 2011). En Mauritanie, ils sont passés de l'agriculture surtout vers le commerce peu productif.</li></ul>`,
  lim_h: "Limites des données",
  lim: `<ul><li>ENTE : environ 2 500 ménages par trimestre, représentatif par milieu et pour sept strates, pas par wilaya. Le T1-2026 n'est pas publié.</li>
    <li>Les parts sectorielles et l'emploi précaire sont lus sur les graphiques des rapports ; les autres indicateurs viennent des tableaux annexes.</li>
    <li>Le secteur secondaire passe de 16 % à 22–25 % de l'emploi à partir du T3-2025 : à confirmer (chantiers, mines, ou changement de classification).</li>
    <li>Annuaire 2025, tableau 5.7 : pour 2024 et 2025, les colonnes « urbain / rural » reprennent les taux hommes / femmes du tableau 5.8 ; seuls les totaux par wilaya sont utilisés.</li>
    <li>Effectifs (milliers) = population projetée (RGPH-5) × parts de l'enquête : ordres de grandeur.</li></ul>`,
  // climate
  c_lede: "Les conditions de la saison et le risque El Niño, et les dispositifs prévus pour y répondre. El Niño tend à assécher la saison des pluies au Sahel, surtout à l'ouest ; l'Atlantique peut compenser ou aggraver.",
  ck_roni: "Indice El Niño (RONI)", ck_phase: "Phase", ck_rain: "Pluie cumulée", ck_past: "NDVI des pâturages", ck_vs: "par rapport à la normale",
  en_h: "El Niño et La Niña depuis 1980", en_help: "Indice océanique relatif (RONI) de la NOAA, moyenne sur trois mois. Orange : El Niño (≥ +0,5 °C) ; bleu : La Niña (≤ −0,5 °C).",
  se_h: "La saison, année par année", se_help: "Écart à la normale 1991–2020 de la saison ; couleur = phase ENSO de l'année ; ligne = RONI de juillet–septembre (axe de droite).",
  se_ind: "Indicateur", se_reg: "Wilaya",
  fp_h: "Ce que les El Niño passés ont fait", fp_help: "Écart moyen (en écarts-types, autour de la tendance) entre les saisons El Niño et les saisons neutres, et effet attendu de l'indice de cette année. * p < 0,10 ; ** p < 0,05 ; *** p < 0,01.",
  fp_cols: ["Indicateur", "Saisons El Niño", "El Niño − neutre (z)", "p", "Effet attendu cette année", "Intervalle à 90 %"],
  tr_h: "La saison en cours, wilaya par wilaya", tr_help: "Pluie cumulée depuis mai, en % de la normale à la même décade ; trait : moyenne des années El Niño passées à la même date.",
  tr_y: "% par rapport à la normale", tr_cur: "Saison en cours", tr_en: "Moyenne des El Niño passés",
  tr_cols: ["Wilaya", "Pluie jusqu'à", "Pluie (% normale)", "NDVI cultures (%)", "NDVI pâturages (%)", "Tmax (°C)"],
  no_el: "Les indicateurs détaillés (pluie, chaleur, NDVI des pâturages, empreinte El Niño, suivi de la saison) viennent du notebook El Niño : l'exécuter, puis relancer les sections 17 et 19 de celui-ci.",
  pl_h: "Plans de contingence et dispositifs de réponse", pl_help: "Mécanismes nationaux, régionaux et internationaux qui répondent à la sécheresse et à El Niño, d'après les sources publiques consultées.",
  pl_lv: { national: "Mauritanie", regional: "Sahel", international: "International" }, pl_trig: "Déclencheur", pl_el: "Pour El Niño 2026", pl_who: "Qui",
  gap_h: "Ce qui manque", gap: `<ul><li>Aucun plan de contingence propre à El Niño n'a été trouvé : la réponse passe par le Plan national de réponse annuel, fixé par le Cadre harmonisé de novembre.</li>
    <li>La Mauritanie et le Sahel ne font pas partie de l'appel FAO–PAM d'action anticipatoire El Niño 2026–27.</li>
    <li>La couverture de la saison 2026 par l'assurance sécheresse (ARC) n'est pas confirmée publiquement.</li>
    <li>Le Cadre harmonisé projetait 0,5 million de personnes en phase 3+ pour la soudure 2026, avant l'El Niño : le cycle de novembre 2026 dira l'ampleur des besoins pour 2027.</li></ul>`,
  cm_h: "Sources et limites", as_of: "Situation au",
} : {
  na: "Data not available: run the matching section of the notebook, then the export (section 19).",
  l_lede: "Who works, where, with what education — and who could take the jobs of the new sectors (mining, gas, green hydrogen, agro-food, livestock, digital). Main source: ANSADE's quarterly labour force survey (ENTE), with the 2025 socio-demographic yearbook.",
  k_su1: "Unemployment (SU1)", k_su4: "Underutilisation (SU4)", k_part: "Participation rate", k_youth: "Youth unemployment (14-35)", k_emp: "Persons employed",
  vs: "over a year", pts: "pt", th: "thousand",
  ex_h: "Explore an indicator", ex_help: "Pick the indicator and the breakdown. Each quarterly report gives its quarter and the same quarter a year earlier; Q1-2026 is not published.",
  ex_ind: "Indicator", ex_grp: "Breakdown", ex_view: "View", v_lines: "Over time", v_yoy: "Same quarter, one year apart",
  st_h: "Structure of employment by broad sector", st_help: "Share of employed persons (%). On hover: estimated counts (population × survey shares). Primary: agriculture, livestock, fishing; secondary: industry, mining, construction; tertiary: trade and services.",
  a_tot: "Total", a_urb: "Urban", a_rur: "Rural", s_p: "Primary", s_s: "Secondary", s_t: "Tertiary",
  pr_h: "Where the jobs are, where the value added is", pr_help: "Relative productivity = share of value added / share of employment (1 = economy average). Secondary includes mining: much value, few jobs.",
  pr_emp: "Share of employment", pr_va: "Share of value added", pr_rel: "relative productivity",
  rs_h: "Labour reserve by education level", rs_help: "Estimated unemployed (thousands) and underutilisation rates. This is the immediate pool for the new sectors.",
  rs_u: "Unemployed (thousands)", rs_su4: "Underutilisation SU4 (%)", rs_su1: "Unemployment SU1 (%)",
  fd_h: "What students study", fd_help: "Students enrolled in national higher education by field (ISCED 2013). Enrolment, not graduates; vocational training is not covered.",
  tg_h: "Target sectors and the fields that supply them", tg_cols: ["Target sector", "Fields of study", "Students (latest year)", "Share of students", "Scholarship students abroad", "Jobs in demand"],
  tg_note: "Fields overlap (sciences supply both mining and digital).",
  exm_h: "Pass rates in national exams", exm_help: "The baccalauréat gates access to higher education.",
  wl_h: "Unemployment and activity by wilaya", wl_help: "Socio-demographic yearbook 2025 (EPCV 2014–2019, ENESI 2017, ENTE 2024–2025). Compare with care: different surveys.",
  wl_ind: "Indicator", wl_u: "Unemployment rate", wl_a: "Activity rate",
  how_h: "How these data inform diversification",
  how: `<ul><li><b>Demand</b> — which sectors can create jobs? Mining is about 20% of GDP but 1% of jobs; agriculture and livestock about a third of jobs (World Bank, <i>Beyond Extractives</i>, 2025). Diversification creates jobs when it runs through labour-intensive sectors (agro-food, livestock, fisheries, digital services, tourism) and through the supply chains of the large projects (gas, hydrogen).</li>
    <li><b>Supply</b> — who can take these jobs? Unemployment (SU1) understates the need for work: underutilisation (SU3, SU4, ILO 2013 standards) adds the potential labour force and underemployment. The pool is young, female and has secondary education.</li>
    <li><b>Skills</b> — do the fields of study match? Compare fields of study with the occupations of the target sectors (ILO STED method: anticipating the skills of export sectors). Large projects mostly need technicians (welders, pipefitters, electricians, maintenance), trained in vocational schools more than in universities.</li>
    <li><b>Productivity</b> — structural transformation moves workers to more productive sectors (McMillan and Rodrik, 2011). In Mauritania they moved from agriculture mostly into low-productivity trade.</li></ul>`,
  lim_h: "Data limits",
  lim: `<ul><li>ENTE: about 2,500 households per quarter, representative by area and for seven strata, not by wilaya. Q1-2026 is not published.</li>
    <li>Sector shares and precarious jobs are read from the reports' charts; the other indicators come from the annex tables.</li>
    <li>The secondary sector jumps from 16% to 22–25% of employment from Q3-2025: to be confirmed (construction, mining, or a change in classification).</li>
    <li>Yearbook 2025, table 5.7: for 2024 and 2025 the “urban / rural” columns repeat the male / female rates of table 5.8; only the wilaya totals are used.</li>
    <li>Counts (thousands) = projected population (RGPH-5) × survey shares: orders of magnitude.</li></ul>`,
  c_lede: "Season conditions and the El Niño risk, and the mechanisms in place to respond. El Niño tends to dry the Sahel rainy season, especially in the west; the Atlantic can offset or amplify it.",
  ck_roni: "El Niño index (RONI)", ck_phase: "Phase", ck_rain: "Cumulative rainfall", ck_past: "Pasture NDVI", ck_vs: "against normal",
  en_h: "El Niño and La Niña since 1980", en_help: "NOAA Relative Oceanic Niño Index (RONI), three-month mean. Orange: El Niño (≥ +0.5 °C); blue: La Niña (≤ −0.5 °C).",
  se_h: "The season, year by year", se_help: "Season anomaly against the 1991–2020 normal; colour = ENSO phase of the year; line = July–September RONI (right axis).",
  se_ind: "Indicator", se_reg: "Wilaya",
  fp_h: "What past El Niños did", fp_help: "Mean difference (standard deviations, around the trend) between El Niño and neutral seasons, and the effect expected from this year's index. * p < 0.10; ** p < 0.05; *** p < 0.01.",
  fp_cols: ["Indicator", "El Niño seasons", "El Niño − neutral (z)", "p", "Expected effect this year", "90% interval"],
  tr_h: "The season so far, wilaya by wilaya", tr_help: "Cumulative rainfall since May, % of the normal to the same dekad; tick: average of past El Niño years at the same date.",
  tr_y: "% against normal", tr_cur: "Current season", tr_en: "Past El Niño average",
  tr_cols: ["Wilaya", "Rain to", "Rain (% of normal)", "Crop NDVI (%)", "Pasture NDVI (%)", "Tmax (°C)"],
  no_el: "The detailed indicators (rain, heat, pasture NDVI, El Niño fingerprint, season tracker) come from the El Niño notebook: run it, then run sections 17 and 19 of this one again.",
  pl_h: "Contingency plans and response mechanisms", pl_help: "National, regional and international mechanisms that respond to drought and El Niño, from the public sources consulted.",
  pl_lv: { national: "Mauritania", regional: "Sahel", international: "International" }, pl_trig: "Trigger", pl_el: "For El Niño 2026", pl_who: "Who",
  gap_h: "What is missing", gap: `<ul><li>No El Niño-specific contingency plan was found: the response runs through the annual National Response Plan, set by the November Cadre Harmonisé.</li>
    <li>Mauritania and the Sahel are not part of the 2026–27 FAO–WFP El Niño anticipatory action appeal.</li>
    <li>Coverage of the 2026 season by drought insurance (ARC) is not publicly confirmed.</li>
    <li>The Cadre Harmonisé projected 0.5 million people in phase 3+ for the 2026 lean season, before El Niño: the November 2026 cycle will set the scale of 2027 needs.</li></ul>`,
  cm_h: "Sources and limits", as_of: "Status as of",
};
const lbl = (c, L) => (FR ? (L.cat_fr || {})[c] || c : c);

/* ==================================================================== LABOUR */
RENDER.labour = () => {
  const sec = $("#page-labour"), L = S.d.labour;
  if (!L) { empty(sec, T.na); return; }
  const H = L.headline || {};
  sec.innerHTML = `<p class="lede">${esc(T.l_lede)}</p><div class="kpis" id="lb-kpis"></div>
    <article class="card"><h2>${esc(T.ex_h)}</h2><p class="help">${esc(T.ex_help)}</p>
      <div class="map-toolbar" style="flex-wrap:wrap;gap:10px 18px"><label class="ctl">${esc(T.ex_ind)} <select id="lb-ind"></select></label>
      <label class="ctl">${esc(T.ex_grp)} <select id="lb-grp"></select></label>
      <label class="ctl">${esc(T.ex_view)} ${seg("lb-view", [["lines", T.v_lines], ["yoy", T.v_yoy]], "lines")}</label></div>
      <div class="chart" id="lb-chart"></div><p class="source" id="lb-src"></p></article>
    <article class="card"><h2>${esc(T.st_h)}</h2><p class="help">${esc(T.st_help)}</p>${seg("lb-area", [["Total", T.a_tot], ["Urban", T.a_urb], ["Rural", T.a_rur]], "Total")}<div class="chart" id="lb-struct"></div></article>
    <div class="grid two"><article class="card"><h2>${esc(T.pr_h)}</h2><p class="help">${esc(T.pr_help)}</p><div class="chart" id="lb-prod"></div></article>
      <article class="card"><h2>${esc(T.rs_h)}</h2><p class="help">${esc(T.rs_help)}</p><div class="chart" id="lb-res"></div></article></div>
    <article class="card"><h2>${esc(T.fd_h)}</h2><p class="help">${esc(T.fd_help)}</p><div class="chart" id="lb-fields" style="height:460px"></div>
      <h3 style="font-size:1rem">${esc(T.tg_h)}</h3><div class="table-wrap"><table class="data" id="lb-targets"></table></div><p class="help">${esc(T.tg_note)}</p></article>
    <div class="grid two"><article class="card"><h2>${esc(T.wl_h)}</h2><p class="help">${esc(T.wl_help)}</p>${seg("lb-wl", [["unemployment", T.wl_u], ["activity_rate", T.wl_a]], "unemployment")}<div class="chart" id="lb-wil" style="height:480px"></div></article>
      <article class="card"><h2>${esc(T.exm_h)}</h2><p class="help">${esc(T.exm_help)}</p><div class="chart" id="lb-exam"></div></article></div>
    <article class="card prose"><h2>${esc(T.how_h)}</h2>${T.how}</article>
    <article class="card prose"><h2>${esc(T.lim_h)}</h2>${T.lim}<p class="source">${(L.sources || []).map(esc).join(" · ")}</p></article>`;
  const d = (a, b) => (isNum(a) && isNum(b) ? `${sgn(a - b)} ${T.pts} ${T.vs}` : "");
  $("#lb-kpis").innerHTML = kpi(T.k_su1, pct(H.su1), qlab(H.period) + " · " + d(H.su1, H.su1_prev)) + kpi(T.k_su4, pct(H.su4), d(H.su4, H.su4_prev)) +
    kpi(T.k_part, pct(H.participation), d(H.participation, H.participation_prev)) + kpi(T.k_youth, pct(H.su1_youth), FR ? `femmes : ${pct(H.su1_women)}` : `women: ${pct(H.su1_women)}`) +
    kpi(T.k_emp, isNum(H.employed) ? F.num(Math.round(H.employed / 1000)) + " k" : "–", isNum(H.employed_prev) ? `${sgn((H.employed - H.employed_prev) / 1000, 0)} k ${T.vs}` : "");
  // explorer
  const inds = L.indicators, sel = $("#lb-ind"), gsel = $("#lb-grp");
  sel.innerHTML = Object.entries(inds).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join("");
  sel.value = "su1";
  const groupsOf = (k) => { const fam = inds[k].family;
    if (fam === "ente") return Object.keys(L.ente[k] || {});
    if (fam === "structure") return ["total"];
    return Object.keys((L.yearbook || {})[k] || {}).sort((a, b) => (a === "wilaya" ? -1 : b === "wilaya" ? 1 : 0)); };
  const fillG = () => { const gs = groupsOf(sel.value); gsel.innerHTML = gs.map((g) => `<option value="${g}">${esc(L.groups[g] || g)}</option>`).join("");
    gsel.value = gs.includes("sex") ? "sex" : gs[0]; };
  let view = "lines";
  const draw = () => {
    const k = sel.value, g = gsel.value, fam = inds[k].family, unit = inds[k].unit;
    $$("#lb-view button").forEach((b) => (b.disabled = fam === "yearbook"));
    let tr = [], lay = { yaxis: { title: { text: unit } }, legend: { y: 1.15 } };
    if (fam === "yearbook") {
      const s = L.yearbook[k][g];
      if (g === "wilaya") { const ys = s.years, y0 = ys[0], y1 = ys[ys.length - 1];
        const cats = Object.keys(s.series).sort((a, b) => (s.series[a][ys.length - 1] ?? -1) - (s.series[b][ys.length - 1] ?? -1));
        tr = [{ type: "bar", orientation: "h", y: cats, x: cats.map((c) => s.series[c][0]), name: String(y0), marker: { color: IMF.grey } },
          { type: "bar", orientation: "h", y: cats, x: cats.map((c) => s.series[c][ys.length - 1]), name: String(y1), marker: { color: IMF.blue } }];
        lay = { barmode: "group", xaxis: { title: { text: unit } }, yaxis: { automargin: true }, legend: { y: 1.1 }, margin: { l: 130 } };
      } else tr = Object.entries(s.series).map(([c, v], i) => ({ type: "scatter", mode: "lines+markers", x: s.years.map(String), y: v, name: lbl(c, L), line: { color: PAL[i % PAL.length], width: c === "Total" ? 3 : 2 } }));
      $("#lb-src").textContent = (L.sources || [])[1] || "";
    } else {
      const s = fam === "ente" ? L.ente[k][g] : L.structure[k];
      if (!s) { plot("lb-chart", []); return; }
      if (view === "yoy") { const p = L.latest, q = `${+p.slice(0, 4) - 1}Q${p.slice(-1)}`, ip = s.periods.indexOf(p), iq = s.periods.indexOf(q), cats = Object.keys(s.series);
        tr = [[q, iq, IMF.grey], [p, ip, IMF.blue]].filter(([, i]) => i >= 0).map(([per, i, col]) => ({ type: "bar", x: cats.map((c) => lbl(c, L)), y: cats.map((c) => s.series[c][i]), name: qlab(per), marker: { color: col },
          text: cats.map((c) => dec(s.series[c][i])), textposition: "outside" }));
        lay.barmode = "group";
      } else { tr = Object.entries(s.series).map(([c, v], i) => ({ type: "scatter", mode: "lines+markers", x: s.periods.map(qlab), y: v, name: lbl(c, L), connectgaps: false,
        line: { color: PAL[i % PAL.length], width: c === "Total" ? 3 : 2 } }));
        const tot = fam === "ente" && g !== "total" ? (L.ente[k] || {}).total : null;
        if (tot) tr.push({ type: "scatter", mode: "lines", x: tot.periods.map(qlab), y: tot.series.Total, name: FR ? "Ensemble" : "Total", line: { color: IMF.dgrey, width: 2, dash: "dash" } }); }
      lay.xaxis = { type: "category" };
      $("#lb-src").textContent = (L.sources || [])[0] || "";
    }
    plot("lb-chart", tr, lay);
  };
  sel.onchange = () => { fillG(); draw(); }; gsel.onchange = draw; onSeg("lb-view", (v) => { view = v; draw(); });
  fillG(); draw();
  // structure
  const sname = { primary: T.s_p, secondary: T.s_s, tertiary: T.s_t }, scol = { primary: IMF.green, secondary: IMF.orange, tertiary: IMF.mid };
  const drawS = (area) => { const w = (L.workers || []).filter((r) => r.area === area), ps = [...new Set(w.map((r) => r.period))].sort();
    plot("lb-struct", ["primary", "secondary", "tertiary"].map((s) => { const z = ps.map((p) => w.find((r) => r.period === p && r.sector === s) || {});
      return { type: "bar", x: ps.map(qlab), y: z.map((r) => r.share), name: sname[s], marker: { color: scol[s] }, customdata: z.map((r) => r.workers_k),
        text: z.map((r) => dec(r.share, 0)), textposition: "inside", hovertemplate: `%{x}: %{y:.1f}% · %{customdata:.0f} k<extra>${sname[s]}</extra>` }; }),
      { barmode: "stack", yaxis: { title: { text: "%" }, range: [0, 100] }, xaxis: { type: "category" }, legend: { y: 1.12 } }); };
  onSeg("lb-area", drawS); drawS("Total");
  // productivity
  const P = L.productivity || [];
  if (P.length && P.some((r) => isNum(r.va_share))) {
    const x = P.map((r) => sname[r.sector]);
    plot("lb-prod", [{ type: "bar", x, y: P.map((r) => r.emp_share), name: T.pr_emp, marker: { color: IMF.grey }, text: P.map((r) => pct(r.emp_share, 0)), textposition: "outside" },
      { type: "bar", x, y: P.map((r) => r.va_share), name: T.pr_va, marker: { color: IMF.blue }, text: P.map((r) => pct(r.va_share, 0)), textposition: "outside" }],
      { barmode: "group", yaxis: { title: { text: "%" } }, legend: { y: 1.15 },
        annotations: P.map((r, i) => ({ x: x[i], y: Math.max(r.emp_share || 0, r.va_share || 0) + 10, text: `${T.pr_rel} ${dec(r.rel_productivity)}`, showarrow: false, font: { color: IMF.rust } })) });
  } else plot("lb-prod", []);
  // reserve
  const R = L.reserve || [];
  plot("lb-res", R.length ? [{ type: "bar", x: R.map((r) => lbl(r.education, L)), y: R.map((r) => r.unemployed_k), name: T.rs_u, marker: { color: IMF.blue }, text: R.map((r) => dec(r.unemployed_k, 0)), textposition: "outside", cliponaxis: false },
    { type: "scatter", mode: "lines+markers", x: R.map((r) => lbl(r.education, L)), y: R.map((r) => r.su4), name: T.rs_su4, yaxis: "y2", line: { color: IMF.rust, width: 2.5 } },
    { type: "scatter", mode: "lines+markers", x: R.map((r) => lbl(r.education, L)), y: R.map((r) => r.su1), name: T.rs_su1, yaxis: "y2", line: { color: IMF.gold, width: 2, dash: "dot" } }] : [],
    { yaxis: { title: { text: T.th } }, yaxis2: { overlaying: "y", side: "right", title: { text: "%" }, showgrid: false, rangemode: "tozero" }, legend: { y: 1.18 }, margin: { r: 50 } });
  // fields
  const E = L.enrolment || [], fy = [...new Set(E.map((r) => r.year))].sort(), last = fy[fy.length - 1];
  const order = E.filter((r) => r.year === last && r.field !== "Not stated").sort((a, b) => a.total - b.total).map((r) => r.field);
  const fname = (f) => (FR ? (L.field_fr || {})[f] || f : f);
  plot("lb-fields", fy.map((y, i) => ({ type: "bar", orientation: "h", y: order.map(fname), x: order.map((f) => (E.find((r) => r.year === y && r.field === f) || {}).total),
    name: `${y}-${String(y + 1).slice(2)}`, marker: { color: ["#CFE9F8", "#8FD0F0", IMF.sky, IMF.blue][i % 4] } })),
    { barmode: "group", xaxis: { title: { text: FR ? "étudiants" : "students" } }, yaxis: { automargin: true }, legend: { y: 1.08 }, margin: { l: 220 } });
  const tg = $("#lb-targets"); tg.classList.add("elec-t");
  tg.innerHTML = `<thead><tr>${T.tg_cols.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>` + (L.targets || []).map((r) =>
    `<tr><td><b>${esc(FR ? r.sector_fr : r.sector)}</b></td><td>${esc((r.fields || []).map(fname).join(", "))}</td><td class="num">${F.num(r.students)}</td>` +
    `<td class="num">${pct(r.share)}</td><td class="num">${F.num(r.abroad)}</td><td class="wide">${esc(FR ? r.jobs_fr : r.jobs)}</td></tr>`).join("") + "</tbody>";
  // wilaya
  const drawW = (k) => { const s = ((L.yearbook || {})[k] || {}).wilaya; if (!s) { plot("lb-wil", []); return; }
    const ys = s.years, n = ys.length - 1, cats = Object.keys(s.series).sort((a, b) => (s.series[a][n] ?? -1) - (s.series[b][n] ?? -1));
    const i0 = ys.indexOf(2019) >= 0 ? ys.indexOf(2019) : 0;
    plot("lb-wil", [{ type: "bar", orientation: "h", y: cats, x: cats.map((c) => s.series[c][i0]), name: String(ys[i0]), marker: { color: IMF.grey } },
      { type: "bar", orientation: "h", y: cats, x: cats.map((c) => s.series[c][n]), name: String(ys[n]), marker: { color: IMF.blue }, text: cats.map((c) => dec(s.series[c][n])), textposition: "outside" }],
      { barmode: "group", xaxis: { title: { text: "%" } }, yaxis: { automargin: true }, legend: { y: 1.08 }, margin: { l: 130 } }); };
  onSeg("lb-wl", drawW); drawW("unemployment");
  const X = L.exams || [], ex = [...new Set(X.map((r) => r.exam))];
  plot("lb-exam", ex.map((e, i) => { const z = X.filter((r) => r.exam === e); return { type: "scatter", mode: "lines+markers+text", x: z.map((r) => String(r.year)), y: z.map((r) => r.pass_rate), name: e,
    line: { color: PAL[i], width: 2.4 }, text: z.map((r) => dec(r.pass_rate, 0)), textposition: "top center" }; }), { yaxis: { title: { text: "%" }, rangemode: "tozero" }, legend: { y: 1.15 } });
};

/* ==================================================================== CLIMATE */
RENDER.climate = () => {
  const sec = $("#page-climate"), K = S.d.climate;
  if (!K) { empty(sec, T.na); return; }
  const E = K.enso || {}, lastY = (E.years || []).slice(-1)[0] || {};
  const hasEl = (K.tracker || []).length || (K.composites || []).length;
  sec.innerHTML = `<p class="lede">${esc(T.c_lede)}</p><div class="kpis" id="cl-kpis"></div>
    <article class="card"><h2>${esc(T.en_h)}</h2><p class="help">${esc(T.en_help)}</p><div class="chart" id="cl-enso"></div><p class="source">${esc(E.source || "")}</p></article>
    <article class="card"><h2>${esc(T.se_h)}</h2><p class="help">${esc(T.se_help)}</p>
      <div class="map-toolbar" style="flex-wrap:wrap;gap:10px 18px"><label class="ctl">${esc(T.se_ind)} <select id="cl-ind"></select></label><label class="ctl">${esc(T.se_reg)} <select id="cl-reg"></select></label></div>
      <div class="chart" id="cl-season"></div>${hasEl ? "" : `<p class="help">${esc(T.no_el)}</p>`}</article>
    ${hasEl ? `<article class="card"><h2>${esc(T.fp_h)}</h2><p class="help">${esc(T.fp_help)}</p><div class="table-wrap"><table class="data" id="cl-fp"></table></div></article>
      <article class="card"><h2>${esc(T.tr_h)} (${esc(String(K.tracker_year || ""))})</h2><p class="help">${esc(T.tr_help)}</p><div class="chart" id="cl-track" style="height:440px"></div>
      <div class="table-wrap"><table class="data" id="cl-trtab"></table></div><p class="source">${FR ? "Notebook El Niño, exécuté le" : "El Niño notebook, run on"} ${esc(K.elnino_stamp || "")}</p></article>` : ""}
    <h2 class="section-title">${esc(T.pl_h)}</h2><p class="help">${esc(T.pl_help)} ${esc(T.as_of)} ${esc(K.as_of || "")}.</p><div id="cl-plans"></div>
    <article class="card prose"><h2>${esc(T.gap_h)}</h2>${T.gap}</article>
    <article class="card prose"><h2>${esc(T.cm_h)}</h2><ul>${(K.sources || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></article>`;
  const tr = (K.tracker || []).find((r) => r.region === K.nat) || {};
  const ph = lastY.phase === "Neutral" ? (FR ? "Neutre" : "Neutral") : lastY.phase;
  $("#cl-kpis").innerHTML = kpi(T.ck_roni, isNum(E.last && E.last.roni) ? sgn(E.last.roni) + " °C" : "–", E.last ? `${E.last.season} ${E.last.year}` : "") +
    kpi(T.ck_phase, esc(ph || "–"), `${E.season || ""} ${lastY.year || ""}`) +
    (isNum(tr.rain_pct) ? kpi(T.ck_rain, pct(tr.rain_pct, 0), `${T.ck_vs} · ${tr.rain_to || ""}`) : "") +
    (isNum(tr.ndvi_noncrop_anom) ? kpi(T.ck_past, pct(tr.ndvi_noncrop_anom, 0), `${T.ck_vs} · ${tr.ndvi_noncrop_to || ""}`) : "");
  const m = E.monthly || { year: [], month: [], roni: [] };
  plot("cl-enso", [{ type: "bar", x: m.year.map((y, i) => `${y}-${String(m.month[i]).padStart(2, "0")}-15`), y: m.roni, marker: { color: m.roni.map((v) => (v >= 0.5 ? IMF.rust : v <= -0.5 ? IMF.blue : IMF.grey)) },
    hovertemplate: "%{x|%b %Y}: %{y:+.1f} °C<extra></extra>" }], { xaxis: { type: "date" }, yaxis: { title: { text: "°C" }, zeroline: true },
    shapes: [0.5, -0.5].map((y) => ({ type: "line", xref: "paper", x0: 0, x1: 1, y0: y, y1: y, line: { color: IMF.dgrey, width: 1, dash: "dot" } })), showlegend: false });
  // season explorer
  const inds = K.indicators || {}, isel = $("#cl-ind"), rsel = $("#cl-reg");
  isel.innerHTML = Object.entries(inds).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join("");
  const fillR = () => { const rs = Object.keys((K.season || {})[isel.value] || {}); const o = [K.nat, ...rs.filter((r) => r !== K.nat).sort()].filter((r) => rs.includes(r));
    rsel.innerHTML = o.map((r) => `<option value="${esc(r)}">${esc(RN(r))}</option>`).join(""); };
  const ey = new Map((E.years || []).map((r) => [r.year, r.roni]));
  const drawS = () => { const k = isel.value, s = ((K.season || {})[k] || {})[rsel.value]; if (!s) { plot("cl-season", []); return; }
    const u = (inds[k] || {}).unit || "", a = 1.1 * Math.max(...s.anom.filter(isNum).map(Math.abs), 1), rr = s.year.map((y) => ey.get(y)), b = 1.1 * Math.max(...rr.filter(isNum).map(Math.abs), 0.5);
    plot("cl-season", [{ type: "bar", x: s.year, y: s.anom, marker: { color: s.phase.map((p) => PH[p] || IMF.grey) }, name: FR ? "Écart" : "Anomaly", hovertemplate: `%{x}: %{y:+.1f} ${u}<extra></extra>` },
      { type: "scatter", mode: "lines", x: s.year, y: rr, name: "RONI", yaxis: "y2", line: { color: IMF.navy, width: 1.6 } }],
      { yaxis: { title: { text: (FR ? "écart" : "anomaly") + ` (${u})` }, range: [-a, a], zeroline: true }, yaxis2: { overlaying: "y", side: "right", range: [-b, b], showgrid: false, title: { text: "RONI (°C)" } }, legend: { y: 1.12 } }); };
  isel.onchange = () => { fillR(); drawS(); }; rsel.onchange = drawS; fillR(); drawS();
  if (hasEl) {
    const st = (p) => (!isNum(p) ? "" : p < 0.01 ? "***" : p < 0.05 ? "**" : p < 0.1 ? "*" : "");
    const fp = $("#cl-fp"); fp.classList.add("elec-t");
    const comp = (K.composites || []).filter((r) => r.region === K.nat), reg = (K.regressions || []).filter((r) => r.region === K.nat);
    fp.innerHTML = `<thead><tr>${T.fp_cols.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>` + comp.map((c) => { const r = reg.find((x) => x.indicator === c.indicator) || {}, i = inds[c.indicator] || {};
      const fav = i.fav || 1, adverse = isNum(c.diff_z) && Math.sign(c.diff_z) === -fav, u = i.unit === "%" ? (FR ? " %" : "%") : " " + (i.unit || "");
      return `<tr><td>${esc(i.label || c.label)}</td><td class="num">${c.n_en ?? "–"}</td><td class="num" style="color:${adverse ? IMF.rust : IMF.blue};font-weight:700">${sgn(c.diff_z, 2)}${st(c.p)}</td>` +
        `<td class="num">${dec(c.p, 2)}</td><td class="num">${isNum(r.effect_T) ? sgn(r.effect_T) + u : "–"}</td><td class="num">${isNum(r.lo) ? `${sgn(r.lo)} ; ${sgn(r.hi)}` : "–"}</td></tr>`; }).join("") + "</tbody>";
    const t = (K.tracker || []).filter((r) => isNum(r.rain_pct)).sort((a, b) => a.rain_pct - b.rain_pct);
    plot("cl-track", t.length ? [{ type: "bar", orientation: "h", y: t.map((r) => RN(r.region)), x: t.map((r) => r.rain_pct), name: T.tr_cur,
      marker: { color: t.map((r) => (r.rain_pct <= -25 ? IMF.rust : r.rain_pct < 0 ? "#FFA24D" : r.rain_pct < 25 ? IMF.sky : IMF.blue)) }, text: t.map((r) => pct(r.rain_pct, 0)), textposition: "outside", cliponaxis: false },
      { type: "scatter", mode: "markers", y: t.map((r) => RN(r.region)), x: t.map((r) => r.rain_pct_elnino_avg), name: T.tr_en, marker: { symbol: "line-ns-open", size: 16, color: IMF.navy, line: { width: 2.5 } } }] : [],
      { xaxis: { title: { text: T.tr_y }, zeroline: true, range: [Math.min(-30, 1.3 * Math.min(...t.map((r) => r.rain_pct))), Math.max(30, 1.3 * Math.max(...t.map((r) => r.rain_pct)))] },
        yaxis: { automargin: true }, legend: { y: 1.1 }, margin: { l: 140 } });
    const tt = $("#cl-trtab"); tt.classList.add("elec-t");
    tt.innerHTML = `<thead><tr>${T.tr_cols.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>` + (K.tracker || []).map((r) =>
      `<tr><td>${r.region === K.nat ? "<b>" + esc(RN(r.region)) + "</b>" : esc(r.region)}</td><td>${esc(r.rain_to || "")}</td><td class="num">${sgn(r.rain_pct, 0)}</td><td class="num">${sgn(r.ndvi_crop_anom, 0)}</td>` +
      `<td class="num">${sgn(r.ndvi_noncrop_anom, 0)}</td><td class="num">${sgn(r.tmax_anom)}</td></tr>`).join("") + "</tbody>";
  }
  $("#cl-plans").innerHTML = ["national", "regional", "international"].map((lv) => `<h3 style="font-size:1rem;margin:14px 0 6px">${esc(T.pl_lv[lv])}</h3><div class="grid two">` +
    (K.plans || []).filter((p) => p.level === lv).map((p) => `<article class="card"><h3 style="margin:0 0 6px;font-size:1rem">${esc(p.name)}</h3>` +
      `<p class="help" style="margin:0 0 6px"><b>${esc(T.pl_who)}</b>${COLON}${esc(p.who)}</p><p style="margin:0 0 6px">${esc(p.what)}</p>` +
      `<p class="help" style="margin:0 0 4px"><b>${esc(T.pl_trig)}</b>${COLON}${esc(p.trigger)}</p><p style="margin:0 0 6px;color:${IMF.rust}"><b>${esc(T.pl_el)}</b>${COLON}${esc(p.elnino)}</p>` +
      `<p class="source"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.src)}</a></p></article>`).join("") + "</div>").join("");
};
})();
