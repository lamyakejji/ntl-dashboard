/* Transport & access to services page — shared by the EN and FR sites (language from <html lang>). Uses the helpers of
 * app.js (S, $, $$, F, esc, plot, C, isNum, RENDER, newMap, quantiles, SEQ_B, SEQ_O, css, store, getJSON, addBaseControl, setBase).
 * Data: transport.json (indicators by ADM1 / ADM2, correlations, weighting sensitivity, UNDP HDI), transport_pois.geojson,
 * transport_roads.geojson, and the adm1 / adm2 boundaries already loaded by the site. */
"use strict";
(() => {
const FR = (document.documentElement.lang || "en").toLowerCase().startsWith("fr");
const IMF = { blue: "#004C97", sky: "#009CDE", navy: "#001E60", mid: "#5E8AB4", orange: "#FF8200", rust: "#E35205", gold: "#F2A900",
  green: "#78BE20", red: "#DA291C", grey: "#B1B3B3", pale: "#D9EEFA", light: "#5FBDEA", purple: "#8031A7", teal: "#00B0B9" };
const WK = FR ? { density: "densité", paved: "revêtement", diversity: "diversité", segments: "segments", access: "accès routier", education: "éducation", health: "santé", financial: "finance", water: "eau", total: "tous PI" }
  : { density: "density", paved: "paved", diversity: "diversity", segments: "segments", access: "road access", education: "education", health: "health", financial: "financial", water: "water", total: "all POIs" };
const loc = FR ? "fr-FR" : "en-US";
const nfmt = (v, d) => new Intl.NumberFormat(loc, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const dec = (v, d = 1) => (isNum(v) ? nfmt(v, d) : "–");
const pct = (v, d = 0) => (isNum(v) ? nfmt(100 * v, d) + (FR ? " %" : "%") : "–");
const big = (v) => (isNum(v) ? new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(v) : "–");
const sig3 = (v) => (!isNum(v) ? "–" : Math.abs(v) >= 100 ? big(v) : Math.abs(v) >= 1 ? dec(v, 2) : new Intl.NumberFormat(loc, { maximumSignificantDigits: 3 }).format(v));
const kpi = (label, value, sub = "") => `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div><div class="sub">${esc(sub)}</div></div>`;
const seg = (id, opts, on) => `<div class="seg" id="${id}">${opts.map(([k, l]) => `<button type="button" data-k="${esc(k)}" class="${k === on ? "on" : ""}">${esc(l)}</button>`).join("")}</div>`;
const onSeg = (id, fn) => { const el = $("#" + id); if (!el) return; el.onclick = (e) => { const b = e.target.closest("button"); if (!b) return;
  $$(`#${id} button`).forEach((x) => x.classList.toggle("on", x === b)); fn(b.dataset.k); }; };
const card = (id, h, help, cls = "chart", extra = "") => `<article class="card"><h2>${esc(h)}</h2>${help ? `<p class="help">${esc(help)}</p>` : ""}${extra}<div class="${cls}" id="${id}"></div></article>`;
const BAD = new Set(["people_per_paved_km", "mean_road_dist_km"]);   // higher = worse: orange ramp

const T = FR ? {
  na: "Données non disponibles : lancer la section 19b du notebook (OpenStreetMap), puis l'export (section 21).",
  lede: "Où sont les routes, de quelle qualité, et à quels services elles donnent accès. Réseau routier et points d'intérêt d'OpenStreetMap, rapportés à la surface et à la population de chaque wilaya et moughataa, et confrontés aux lumières nocturnes.",
  v_map: "Carte et indicateurs", v_corr: "Corrélations et robustesse",
  k_km: "Routes cartographiées", k_km_s: "OpenStreetMap, {d}", k_pav: "Classes revêtues", k_pav_s: "part de la longueur",
  k_pc: "Km de route pour 1 000 hab.", k_pc_s: "population maillée", k_poi: "Points d'intérêt", k_poi_s: "9 secteurs",
  k_crit: "Population en zone « critique »", k_crit_s: "indice d'inclusion < 20 ({lv})",
  lvl: "Niveau", adm1: "Wilayas (ADM1)", adm2: "Moughataas (ADM2)", ind: "Indicateur", poi: "Points d'intérêt", roads: "Routes principales",
  map_h: "Carte : routes, services et indicateurs par unité", map_help: "Choisir le niveau et l'indicateur. « Densité » rapporte les routes à la surface, « pour 1 000 habitants » à la population. Cocher les secteurs pour afficher les points d'intérêt ; survoler une unité pour ses valeurs.",
  map_src: "Sources : © contributeurs OpenStreetMap (ODbL), extrait Geofabrik ; population maillée de la section 03 ; limites {b}.",
  rk_h: "Classement des unités", rk_help: "Indicateur choisi sur la carte. Survoler une barre pour la population.",
  cls_h: "Longueur des routes par classe", cls_help: "Km par wilaya et par classe de route. Revêtue = autoroute à secondaire ; non revêtue = tertiaire et voies locales ; pistes = track, service.",
  sec_h: "Services pour 10 000 habitants, par secteur", sec_help: "Points d'intérêt OpenStreetMap par secteur, rapportés à la population maillée.",
  tab_h: "Tableau par unité", tab_help: "Cliquer un en-tête pour trier. Téléchargement : page Données (transport_adm1.csv, transport_adm2.csv).",
  cols: ["Unité", "Population", "Routes (km)", "Densité (km/km²)", "Km / 1 000 hab.", "Revêtues", "Score d'accès", "Inclusion", "Classe"],
  cm_h: "Matrice de corrélation", cm_help: "Chaque case : corrélation entre un indicateur de transport ou de services (lignes) et un résultat mesuré par les lumières ou la population (colonnes). * : p < 0,05. Cliquer une case pour voir le nuage de points.",
  meth: "Méthode",
  sc_h: "Explorer une relation", sc_help: "Chaque point : une unité ; taille ∝ population. Le tableau compare la même relation selon les six approches.",
  sx: "Horizontal", sy: "Vertical", logx: "log horizontal", logy: "log vertical",
  ap_cols: ["Approche", "r", "p", "n"],
  el_h: "Élasticités log–log de la lumière par habitant", el_help: "Régression de log(lumière par habitant) sur log(indicateur), erreurs robustes HC1. β = variation en % de la lumière par habitant pour 1 % de plus de l'indicateur. Corrélations, pas des effets causaux.",
  el_cols: ["Indicateur", "β", "Erreur-type", "p", "R²", "n"],
  se_h: "Robustesse aux poids", se_help: "L'indice recalculé avec d'autres pondérations. Barre : écart entre le meilleur et le moins bon rang obtenu par l'unité ; losange : rang de référence. Une barre courte = un rang qui ne dépend pas des poids.",
  se_ix: "Indice", se_acc: "Score d'accès routier", se_inc: "Indice d'inclusion",
  se_cols: ["Pondération", "Poids", "Corrélation de rang avec la référence", "Recouvrement du top {k}", "Écart de rang moyen", "Écart max."],
  hd_h: "Contexte national : développement humain", hd_help: "PNUD, Rapport sur le développement humain. L'IDH n'existe qu'au niveau national pour la Mauritanie : l'indice d'inclusion de cette page mesure l'accès aux routes et aux services par unité, pas l'IDH.",
  hd_na: "Fichier du PNUD non chargé lors de l'exécution du notebook.",
  lim_h: "Lecture et limites",
  lim: `<ul><li><b>Complétude d'OpenStreetMap</b> : les grands axes sont bien cartographiés ; les pistes, les points d'eau et les services ruraux le sont moins. Une unité peu cartographiée paraît moins desservie qu'elle ne l'est.</li>
    <li><b>Classe ≠ état</b> : « revêtue » vient de la classe de route (autoroute à secondaire), pas d'une mesure de l'état du revêtement.</li>
    <li><b>Un point d'intérêt n'est pas un service</b> : un centre de santé cartographié peut manquer de personnel ou de médicaments.</li>
    <li><b>Indices composites</b> : poids choisis, mis à l'épreuve dans le cadre « Robustesse aux poids » ; normalisation min–max au sein de chaque niveau, donc pas comparable d'un niveau à l'autre.</li>
    <li><b>Réseau</b> : deux unités sont reliées si au moins une route traverse leur frontière ; distance entre leurs centres. Intermédiarité = part des plus courts chemins qui passent par l'unité.</li>
    <li><b>Corrélations</b> : au niveau wilaya, n ≈ 15 : à lire avec prudence. La corrélation partielle retire l'effet de la densité de population, qui fait monter à la fois les routes et les lumières.</li></ul>`,
  outside: "hors catégorie", na_s: "non disponible", value: "Valeur", pop: "Population", cls: "Classe",
} : {
  na: "Data not available: run notebook section 19b (OpenStreetMap), then the export (section 21).",
  lede: "Where the roads are, how good they are, and which services they lead to. OpenStreetMap roads and points of interest, related to the area and the population of each wilaya and moughataa, and set against the night-time lights.",
  v_map: "Map & indicators", v_corr: "Correlations & robustness",
  k_km: "Mapped roads", k_km_s: "OpenStreetMap, {d}", k_pav: "Paved classes", k_pav_s: "share of length",
  k_pc: "Road km per 1,000 people", k_pc_s: "gridded population", k_poi: "Points of interest", k_poi_s: "9 sectors",
  k_crit: "Population in 'critical' units", k_crit_s: "inclusion index below 20 ({lv})",
  lvl: "Level", adm1: "Regions (ADM1)", adm2: "Districts (ADM2)", ind: "Indicator", poi: "Points of interest", roads: "Main roads",
  map_h: "Map: roads, services and indicators by unit", map_help: "Pick the level and the indicator. 'Density' relates roads to the area, 'per 1,000 people' to the population. Tick the sectors to show the points of interest; hover a unit for its values.",
  map_src: "Sources: © OpenStreetMap contributors (ODbL), Geofabrik extract; gridded population from section 03; boundaries {b}.",
  rk_h: "Ranking of the units", rk_help: "Indicator selected on the map. Hover a bar for the population.",
  cls_h: "Road length by class", cls_help: "Km by region and road class. Paved = motorway to secondary; unpaved = tertiary and local roads; tracks = track, service.",
  sec_h: "Services per 10,000 people, by sector", sec_help: "OpenStreetMap points of interest by sector, per 10,000 people (gridded population).",
  tab_h: "Table by unit", tab_help: "Click a header to sort. Download: Data page (transport_adm1.csv, transport_adm2.csv).",
  cols: ["Unit", "Population", "Roads (km)", "Density (km/km²)", "Km / 1,000 people", "Paved", "Access score", "Inclusion", "Class"],
  cm_h: "Correlation matrix", cm_help: "Each cell: correlation between a transport or service indicator (rows) and an outcome measured by the lights or the population (columns). * p < 0.05. Click a cell to see its scatter plot.",
  meth: "Method",
  sc_h: "Explore one relationship", sc_help: "Each dot is a unit; size ∝ population. The table compares the same relationship under the six approaches.",
  sx: "Horizontal", sy: "Vertical", logx: "log horizontal", logy: "log vertical",
  ap_cols: ["Approach", "r", "p", "n"],
  el_h: "Log–log elasticities of light per capita", el_help: "Regression of log(light per capita) on log(indicator), HC1 robust errors. β = % change in light per capita for 1% more of the indicator. Correlations, not causal effects.",
  el_cols: ["Indicator", "β", "Std. error", "p", "R²", "n"],
  se_h: "Robustness to the weights", se_help: "The index recomputed with other weightings. Bar: range between the best and worst rank the unit gets; diamond: baseline rank. A short bar = a rank that does not depend on the weights.",
  se_ix: "Index", se_acc: "Road access score", se_inc: "Inclusion index",
  se_cols: ["Weighting", "Weights", "Rank correlation with baseline", "Top-{k} overlap", "Mean rank shift", "Max shift"],
  hd_h: "National context: human development", hd_help: "UNDP Human Development Report. HDI exists only at national level for Mauritania: the inclusion index on this page measures access to roads and services by unit, it is not an HDI.",
  hd_na: "UNDP file not loaded when the notebook ran.",
  lim_h: "Reading and limits",
  lim: `<ul><li><b>OpenStreetMap completeness</b>: main roads are well mapped; tracks, water points and rural services less so. A poorly mapped unit looks worse served than it is.</li>
    <li><b>Class ≠ condition</b>: 'paved' comes from the road class (motorway to secondary), not from a survey of the surface.</li>
    <li><b>A point of interest is not a service</b>: a mapped clinic may lack staff or medicines.</li>
    <li><b>Composite indices</b>: the weights are a choice, tested in 'Robustness to the weights'; min–max scaling within each level, so scores are not comparable across levels.</li>
    <li><b>Network</b>: two units are linked if at least one road crosses their border; distance between their centres. Betweenness = share of shortest paths that run through the unit.</li>
    <li><b>Correlations</b>: at region level n ≈ 15: read with care. The partial correlation removes population density, which raises both roads and lights.</li></ul>`,
  outside: "other", na_s: "not available", value: "Value", pop: "Population", cls: "Class",
};
const GROUPS = FR ? { road: "Routes", network: "Réseau", poi: "Services", outcome: "Lumières et population" } : { road: "Roads", network: "Network", poi: "Services", outcome: "Lights and population" };
const fmtV = (k, v, D) => {
  const u = ((D.vars || {})[k] || {}).u;
  if (!isNum(v)) return "–";
  if (u === "share") return pct(v, 0);
  if (u === "%/yr") return (v > 0 ? "+" : "") + dec(v, 1) + (FR ? " %/an" : "%/yr");
  if (u === "score") return dec(v, 1);
  if (u === "people" || u === "count") return big(v);
  return sig3(v);
};

RENDER.transport = () => {
  const sec = $("#page-transport"), D = S.d.transport;
  if (!D || !D.levels) { sec.innerHTML = `<article class="card"><p class="help">${esc(T.na)}</p></article>`; return; }
  const levels = Object.keys(D.levels), N = D.national || {};
  const st = { lv: levels.includes("ADM2") ? "ADM2" : levels[0], v: "road_density", m: "spearman", x: "inclusion_index", y: "sol_pc",
    lx: false, ly: true, ix: "inclusion", sort: [6, -1], hdi: "hdi", pois: new Set(["health", "education", "financial"]), roads: true };
  try { const k = store.get("ntl-tr-lv"); if (k && levels.includes(k)) st.lv = k; } catch (e) { /* ignore */ }
  const units = (lv) => (D.levels[lv] || {}).units || [];
  const lvU = units(st.lv), popT = lvU.reduce((s, u) => s + (u.pop || 0), 0), crit = lvU.filter((u) => isNum(u.inclusion_index) && u.inclusion_index < 20);
  const lvlOpts = levels.map((l) => [l, l === "ADM1" ? T.adm1 : T.adm2]);
  const varOpts = () => Object.entries(GROUPS).map(([g, gl]) => `<optgroup label="${esc(gl)}">` +
    Object.entries(D.vars).filter(([k, v]) => v.g === g && units(st.lv).some((u) => isNum(u[k])))
      .map(([k, v]) => `<option value="${k}"${k === st.v ? " selected" : ""}>${esc(v.t)}</option>`).join("") + "</optgroup>").join("");
  const secs = Object.entries(D.sectors || {});
  const cntS = N.pois_by_sector || {};

  sec.innerHTML = `<p class="lede">${esc(T.lede)}</p>
    <div class="kpis">${kpi(T.k_km, big(N.road_km) + " km", T.k_km_s.replace("{d}", D.date || ""))}${kpi(T.k_pav, pct(N.paved_share, 0), T.k_pav_s)}
      ${kpi(T.k_pc, dec(N.road_km_per_1000, 1), T.k_pc_s)}${kpi(T.k_poi, big(N.pois), T.k_poi_s)}
      ${kpi(T.k_crit, popT ? pct(crit.reduce((s, u) => s + (u.pop || 0), 0) / popT, 0) : "–", T.k_crit_s.replace("{lv}", st.lv))}</div>
    <div class="map-toolbar tr-views">${seg("tr-view", [["map", T.v_map], ["corr", T.v_corr]], "map")}
      <label class="ctl">${esc(T.lvl)} ${seg("tr-lv", lvlOpts, st.lv)}</label></div>
    <div id="tr-map-view">
      <article class="card"><h2>${esc(T.map_h)}</h2><p class="help">${esc(T.map_help)}</p>
        <div class="map-toolbar" style="flex-wrap:wrap;gap:10px 18px">
          <label class="ctl">${esc(T.ind)} <select id="tr-var">${varOpts()}</select></label>
          <label class="ctl tr-chk"><input type="checkbox" id="tr-roads" checked> ${esc(T.roads)}</label></div>
        <div class="tr-pois" id="tr-pois"><span class="tr-pois-l">${esc(T.poi)}</span>${secs.map(([k, s]) =>
          `<label class="tr-chk"><input type="checkbox" data-s="${k}"${st.pois.has(k) ? " checked" : ""}><b class="dot" style="background:${s.c}"></b>${esc(s.t)} <span class="tr-n">${big(cntS[k] || 0)}</span></label>`).join("")}</div>
        <div class="tr-mapgrid"><div id="tmap" class="elec-map" role="region" aria-label="${esc(T.map_h)}"></div>
          <div class="tr-side"><h3>${esc(T.rk_h)}</h3><p class="help">${esc(T.rk_help)}</p><div class="chart tall" id="tr-rank"></div></div></div>
        <div class="tr-legend" id="tr-legend"></div>
        <p class="source">${esc(T.map_src.replace("{b}", ((S.d.meta || {}).boundaries || {}).ADM1 || "geoBoundaries"))}</p></article>
      <div class="grid two">${card("tr-cls", T.cls_h, T.cls_help, "chart tall")}${card("tr-sec", T.sec_h, T.sec_help, "chart tall")}</div>
      <article class="card"><h2>${esc(T.tab_h)}</h2><p class="help">${esc(T.tab_help)}</p><div class="table-wrap"><table class="data" id="tr-table"></table></div></article>
    </div>
    <div id="tr-corr-view" hidden>
      <article class="card"><h2>${esc(T.cm_h)}</h2><p class="help">${esc(T.cm_help)}</p>
        <div class="map-toolbar"><label class="ctl">${esc(T.meth)} ${seg("tr-m", Object.entries(D.methods), st.m)}</label><span class="tr-n" id="tr-cm-n"></span></div>
        <div class="chart tall" id="tr-cm"></div></article>
      <div class="grid two tr-pair"><article class="card"><h2>${esc(T.sc_h)}</h2><p class="help">${esc(T.sc_help)}</p>
          <div class="map-toolbar" style="flex-wrap:wrap;gap:8px 14px"><label class="ctl">${esc(T.sx)} <select id="tr-x"></select></label>
            <label class="ctl">${esc(T.sy)} <select id="tr-y"></select></label>
            <label class="ctl tr-chk"><input type="checkbox" id="tr-lx"> ${esc(T.logx)}</label><label class="ctl tr-chk"><input type="checkbox" id="tr-ly" checked> ${esc(T.logy)}</label></div>
          <div class="chart" id="tr-sc"></div></article>
        <article class="card"><h2>${esc(FR ? "La même relation, six approches" : "The same relationship, six approaches")}</h2>
          <p class="help" id="tr-ap-h"></p><div class="table-wrap"><table class="data" id="tr-ap"></table></div>
          <div class="chart" id="tr-ap-c"></div></article></div>
      <article class="card"><h2>${esc(T.el_h)}</h2><p class="help">${esc(T.el_help)}</p><div class="table-wrap"><table class="data" id="tr-el"></table></div></article>
      <article class="card"><h2>${esc(T.se_h)}</h2><p class="help">${esc(T.se_help)}</p>
        <div class="map-toolbar"><label class="ctl">${esc(T.se_ix)} ${seg("tr-ix", [["inclusion", T.se_inc], ["access", T.se_acc]], st.ix)}</label></div>
        <div class="table-wrap"><table class="data" id="tr-se-t"></table></div><div class="chart tall" id="tr-se"></div></article>
      <article class="card"><h2>${esc(T.hd_h)}</h2><p class="help">${esc(T.hd_help)}</p>
        <div class="map-toolbar">${(D.hdi || []).length ? seg("tr-hd", Object.entries(D.hdi_vars || {}).filter(([k]) => D.hdi.some((r) => r.indicator === k)).map(([k, v]) => [k, v.split(" (")[0]]), "hdi") : ""}</div>
        <div class="chart" id="tr-hdi"></div></article>
    </div>
    <article class="card prose"><h2>${esc(T.lim_h)}</h2>${T.lim}<ul class="small">${(D.sources || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></article>`;

  /* ------------------------------------------------------------------ map */
  const byId = (lv) => Object.fromEntries(units(lv).map((u) => [u.unit_id, u]));
  let mp = null, chLyr = null, poiLyr = {}, roadLyr = null;
  const ramp = (k) => (BAD.has(k) ? SEQ_O : SEQ_B);
  const legendHtml = (k, br, cols) => {
    const v = D.vars[k] || {}, lab = (a, b) => `${fmtV(k, a, D)} – ${fmtV(k, b, D)}`;
    const vals = units(st.lv).map((u) => u[k]).filter(isNum), lo = Math.min(...vals), hi = Math.max(...vals);
    const edges = [lo, ...br, hi];
    return `<strong>${esc(v.t || k)} · ${st.lv}</strong><div class="classes">${cols.slice(0, edges.length - 1).map((c, i) =>
      `<div><span class="sw" style="background:${c}"></span>${esc(lab(edges[i], edges[i + 1]))}</div>`).join("")}</div>` +
      `<div class="ticks"><span><span class="sw na"></span>${esc(T.na_s)}</span></div>`;
  };
  const drawChoro = () => {
    if (!mp) return;
    if (chLyr) { mp.removeLayer(chLyr); chLyr = null; }
    const gj = S.d[st.lv.toLowerCase()]; if (!gj) return;
    const U = byId(st.lv), k = st.v, vals = Object.values(U).map((u) => u[k]);
    const br = [...new Set(quantiles(vals, 7))], cols = ramp(k);
    const colAt = (i) => cols[Math.round(i * (cols.length - 1) / Math.max(br.length, 1))];
    const col = (v) => { if (!isNum(v)) return null; let i = 0; while (i < br.length && v > br[i]) i++; return colAt(i); };
    chLyr = L.geoJSON(gj, {
      style: (f) => { const u = U[f.properties.unit_id], c = u ? col(u[k]) : null;
        return { color: "rgba(255,255,255,0.85)", weight: st.lv === "ADM1" ? 1 : 0.5, fillOpacity: c ? (st.pois.size ? 0.6 : 0.78) : 0.25, fillColor: c || "#ccc" }; },
      onEachFeature: (f, l) => {
        const u = U[f.properties.unit_id] || {};
        l.bindTooltip(() => `<strong>${esc(u.name || f.properties.name || "")}</strong><div class="tip-v">${esc((D.vars[k] || {}).t || k)} : <b>${fmtV(k, u[k], D)}</b></div>` +
          `<div class="tip-v">${esc(T.pop)} : ${big(u.pop)}</div><div class="tip-v">${esc(D.vars.inclusion_index.t)} : ${dec(u.inclusion_index, 1)} (${esc(u.inclusion_class || "–")})</div>`,
          { sticky: true, direction: "top", opacity: 1 });
        l.on({ mouseover: (e) => { e.target.setStyle({ weight: 2.5, color: css("--ink") }); }, mouseout: (e) => chLyr.resetStyle(e.target) });
      } }).addTo(mp);
    chLyr.bringToBack(); if (mp._base) mp._base.bringToBack();
    $("#tr-legend").innerHTML = legendHtml(k, br, Array.from({ length: br.length + 1 }, (_, i) => colAt(i))) +
      `<div class="elec-legend">${Object.entries(D.classes || {}).filter(([c]) => c === "paved" || c === "unpaved").map(([, c]) => `<span><i style="background:${c.c}"></i>${esc(c.t)}</span>`).join("")}</div>`;
  };
  const drawPois = () => {
    if (!mp) return;
    for (const [k] of secs) {
      const on = st.pois.has(k);
      if (on && !poiLyr[k] && S.d.tpois) {
        const rend = L.canvas({ padding: 0.3 }), c = D.sectors[k].c;
        poiLyr[k] = L.layerGroup((S.d.tpois.features || []).filter((f) => f.properties.s === k).map((f) =>
          L.circleMarker([f.geometry.coordinates[1], f.geometry.coordinates[0]], { renderer: rend, radius: 3.8, weight: 1.2, color: "#fff", fillColor: c, fillOpacity: 0.95 })
            .bindTooltip(`<strong>${esc(D.sectors[k].t)}</strong> · ${esc(String(f.properties.t).replace(/_/g, " "))}${f.properties.n ? `<div class="tip-v">${esc(f.properties.n)}</div>` : ""}`)));
      }
      if (poiLyr[k]) { if (on && !mp.hasLayer(poiLyr[k])) poiLyr[k].addTo(mp); if (!on && mp.hasLayer(poiLyr[k])) mp.removeLayer(poiLyr[k]); }
    }
  };
  const drawRoads = () => {
    if (!mp || !S.d.troads) return;
    if (!roadLyr) {
      const cc = D.classes || {}, w = { trunk: 2.6, motorway: 2.8, primary: 2.2, secondary: 1.6 };
      roadLyr = L.geoJSON(S.d.troads, { interactive: true, style: (f) => ({ color: (cc[f.properties.rclass] || {}).c || IMF.grey,
        weight: w[f.properties.highway] || (f.properties.rclass === "paved" ? 1.4 : 0.8), opacity: f.properties.rclass === "paved" ? 0.95 : 0.7 }),
        onEachFeature: (f, l) => l.bindTooltip(`${esc(String(f.properties.highway).replace(/_/g, " "))} · ${esc((cc[f.properties.rclass] || {}).t || "")}`, { sticky: true }) });
    }
    if (st.roads && !mp.hasLayer(roadLyr)) roadLyr.addTo(mp);
    if (!st.roads && mp.hasLayer(roadLyr)) mp.removeLayer(roadLyr);
  };
  if (S.d.tpois === undefined || S.d.troads === undefined) {
    const base = `data/${S.iso}/`;
    Promise.allSettled([getJSON(base + "transport_pois.geojson"), getJSON(base + "transport_roads.geojson")]).then(([a, b]) => {
      S.d.tpois = a.status === "fulfilled" ? a.value : null; S.d.troads = b.status === "fulfilled" ? b.value : null;
      drawPois(); drawRoads();
    });
  }
  if (window.L) {
    try {
      mp = S.tmap = newMap("tmap");
      addBaseControl(mp);
      if (mp._baseSel) mp._baseSel.onchange = () => { store.set("ntl-base", mp._baseSel.value); setBase(mp, mp._baseSel.value); };
      setTimeout(() => mp.invalidateSize(), 80);
    } catch (e) { console.error(e); }
  }

  /* ------------------------------------------------------------------ charts and table (map view) */
  const drawRank = () => {
    const k = st.v, U = units(st.lv).filter((u) => isNum(u[k])).sort((a, b) => a[k] - b[k]);
    const el = $("#tr-rank"); if (el) el.style.height = Math.max(380, 16 * U.length + 70) + "px";
    plot("tr-rank", U.length ? [{ type: "bar", orientation: "h", y: U.map((u) => u.name), x: U.map((u) => u[k]),
      marker: { color: U.map((u) => (BAD.has(k) ? IMF.orange : IMF.blue)) }, customdata: U.map((u) => [big(u.pop), fmtV(k, u[k], D)]),
      hovertemplate: "%{y}<br>%{customdata[1]}<br>" + esc(T.pop) + " %{customdata[0]}<extra></extra>", showlegend: false }] : [],
      { margin: { l: 120, r: 16, t: 8, b: 36 }, yaxis: { automargin: true, tickfont: { size: 10 } }, xaxis: { title: { text: (D.vars[k] || {}).u || "" } } });
  };
  const drawCls = () => {
    const U = units(levels.includes("ADM1") ? "ADM1" : st.lv).slice().sort((a, b) => a.road_km - b.road_km);
    plot("tr-cls", Object.entries(D.classes || {}).map(([c, v]) => ({ type: "bar", orientation: "h", name: v.t, y: U.map((u) => u.name), x: U.map((u) => u["km_" + c]),
      marker: { color: v.c }, hovertemplate: "%{y}: %{x:,.0f} km<extra>" + esc(v.t) + "</extra>" })), { barmode: "stack", xaxis: { title: { text: "km" } }, margin: { l: 120 } });
    const V = units(levels.includes("ADM1") ? "ADM1" : st.lv).slice().sort((a, b) => (a.total_per_10k || 0) - (b.total_per_10k || 0));
    plot("tr-sec", secs.map(([k, s]) => ({ type: "bar", orientation: "h", name: s.t, y: V.map((u) => u.name), x: V.map((u) => u[k + "_per_10k"]),
      marker: { color: s.c }, hovertemplate: "%{y}: %{x:.2f}<extra>" + esc(s.t) + "</extra>" })), { barmode: "stack", xaxis: { title: { text: FR ? "pour 10 000 hab." : "per 10,000 people" } }, margin: { l: 120 } });
  };
  const COLK = ["name", "pop", "road_km", "road_density", "road_km_per_1000", "paved_ratio", "road_access_score", "inclusion_index", "inclusion_class"];
  const drawTable = () => {
    const [ci, dir] = st.sort, k = COLK[ci];
    const U = units(st.lv).slice().sort((a, b) => { const x = a[k], y = b[k]; if (typeof x === "string" || typeof y === "string") return dir * String(x || "").localeCompare(String(y || ""));
      return dir * ((isNum(x) ? x : -Infinity) - (isNum(y) ? y : -Infinity)); });
    const clsCol = Object.fromEntries((D.score_classes || []).map((c, i) => [c, [IMF.red, IMF.orange, IMF.gold, IMF.light, IMF.blue][i]]));
    $("#tr-table").innerHTML = `<thead><tr>${T.cols.map((c, i) => `<th class="${i ? "num" : ""} sortable" data-i="${i}">${esc(c)}${i === ci ? (dir > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}</tr></thead><tbody>` +
      U.map((u) => `<tr><td>${esc(u.name)}</td><td class="num">${big(u.pop)}</td><td class="num">${big(u.road_km)}</td><td class="num">${sig3(u.road_density)}</td>
        <td class="num">${dec(u.road_km_per_1000, 1)}</td><td class="num">${pct(u.paved_ratio, 0)}</td><td class="num">${dec(u.road_access_score, 1)}</td>
        <td class="num">${dec(u.inclusion_index, 1)}</td><td class="num"><span class="conf" style="border-color:${clsCol[u.inclusion_class] || "var(--border)"}">${esc(u.inclusion_class || "–")}</span></td></tr>`).join("") + "</tbody>";
    $$("#tr-table th").forEach((th) => { th.style.cursor = "pointer"; th.onclick = () => { const i = +th.dataset.i; st.sort = [i, st.sort[0] === i ? -st.sort[1] : (i ? -1 : 1)]; drawTable(); }; });
  };
  const drawMapView = () => { drawChoro(); drawPois(); drawRoads(); drawRank(); drawCls(); drawTable(); };

  /* ------------------------------------------------------------------ correlation view */
  const C0 = () => D.levels[st.lv].corr || { x: [], y: [], matrix: {} };
  const vl = (k) => ((D.vars || {})[k] || {}).t || k;
  const short = (k) => vl(k).replace(/ \(.*\)$/, "");
  const fillXY = () => {
    const all = Object.keys(D.vars).filter((k) => units(st.lv).some((u) => isNum(u[k])));
    $("#tr-x").innerHTML = all.map((k) => `<option value="${k}"${k === st.x ? " selected" : ""}>${esc(vl(k))}</option>`).join("");
    $("#tr-y").innerHTML = all.map((k) => `<option value="${k}"${k === st.y ? " selected" : ""}>${esc(vl(k))}</option>`).join("");
  };
  const drawCM = () => {
    const c = C0(), cell = Object.fromEntries((c.matrix[st.m] || []).map((r) => [r.x + "|" + r.y, r]));
    const z = c.x.map((x) => c.y.map((y) => (cell[x + "|" + y] || {}).r ?? null));
    const txt = c.x.map((x) => c.y.map((y) => { const r = cell[x + "|" + y] || {}; return isNum(r.r) ? dec(r.r, 2) + ((r.p ?? 1) < 0.05 ? "*" : "") : "–"; }));
    const n = ((c.matrix[st.m] || [])[0] || {}).n;
    const el = $("#tr-cm"); if (el) el.style.height = Math.max(380, 30 * c.x.length + 110) + "px";
    plot("tr-cm", c.x.length ? [{ type: "heatmap", z, x: c.y.map(short), y: c.x.map(short), text: txt, texttemplate: "%{text}", zmin: -1, zmax: 1,
      colorscale: [[0, IMF.rust], [0.5, css("--surface-2") || "#f1f1f1"], [1, IMF.blue]], customdata: c.x.map((x) => c.y.map((y) => [x, y])),
      hovertemplate: "%{y} × %{x}<br>r = %{z:.2f}<extra></extra>", colorbar: { thickness: 10, len: 0.8 } }] : [],
      { margin: { l: 260, r: 20, t: 10, b: 90 }, xaxis: { side: "bottom", tickangle: -20 }, yaxis: { autorange: "reversed" } });
    $("#tr-cm-n").textContent = `n = ${n ?? "–"} · ${st.lv}`;
    if (el && el.on && !el._trClick) { el._trClick = true; el.on("plotly_click", (e) => { const p = e.points && e.points[0]; if (!p || !p.customdata) return;
      [st.x, st.y] = p.customdata; fillXY(); drawPair(); $("#tr-sc").scrollIntoView({ behavior: "smooth", block: "center" }); }); }
  };
  const corrOf = (x, y) => Object.keys(D.methods).map((m) => { const r = ((C0().matrix[m] || []).find((q) => q.x === x && q.y === y)); return [m, r]; });
  const drawPair = () => {
    const x = st.x, y = st.y, U = units(st.lv).filter((u) => isNum(u[x]) && isNum(u[y]) && (!st.lx || u[x] > 0) && (!st.ly || u[y] > 0));
    const mx = Math.max(...U.map((u) => u.pop || 1), 1);
    plot("tr-sc", U.length ? [{ type: "scatter", mode: "markers", x: U.map((u) => u[x]), y: U.map((u) => u[y]), text: U.map((u) => u.name),
      marker: { size: U.map((u) => 7 + 30 * Math.sqrt((u.pop || 0) / mx)), color: IMF.blue, opacity: 0.7, line: { color: "#fff", width: 0.6 } },
      hovertemplate: "<b>%{text}</b><br>" + esc(short(x)) + ": %{x:.3~g}<br>" + esc(short(y)) + ": %{y:.3~g}<extra></extra>", showlegend: false }] : [],
      { xaxis: { title: { text: vl(x) }, type: st.lx ? "log" : "linear" }, yaxis: { title: { text: vl(y) }, type: st.ly ? "log" : "linear" }, margin: { l: 64, b: 54 } });
    // all approaches for this pair: precomputed when the pair is in the matrix, computed here otherwise (Pearson, Spearman, logs)
    let rows = corrOf(x, y).filter(([, r]) => r);
    if (!rows.length) rows = localCorr(x, y);
    $("#tr-ap-h").textContent = `${short(x)} × ${short(y)} · ${st.lv}`;
    $("#tr-ap").innerHTML = `<thead><tr>${T.ap_cols.map((c, i) => `<th class="${i ? "num" : ""}">${esc(c)}</th>`).join("")}</tr></thead><tbody>` +
      rows.map(([m, r]) => `<tr><td>${esc(D.methods[m])}</td><td class="num"><b>${isNum(r.r) ? dec(r.r, 2) : "–"}</b></td><td class="num">${isNum(r.p) ? (r.p < 0.001 ? "<0.001" : dec(r.p, 3)) : "–"}</td><td class="num">${r.n ?? "–"}</td></tr>`).join("") + "</tbody>";
    plot("tr-ap-c", rows.length ? [{ type: "bar", orientation: "h", y: rows.map(([m]) => D.methods[m]), x: rows.map(([, r]) => r.r),
      marker: { color: rows.map(([, r]) => ((r.p ?? 1) < 0.05 ? (r.r >= 0 ? IMF.blue : IMF.rust) : IMF.grey)) },
      hovertemplate: "%{y}: %{x:.2f}<extra></extra>", showlegend: false }] : [], { xaxis: { range: [-1, 1], zeroline: true, title: { text: "r" } }, yaxis: { autorange: "reversed" }, margin: { l: 220, t: 6 } });
  };
  // fallback for pairs outside the precomputed matrix
  const rankArr = (a) => { const o = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = Array(a.length); let i = 0;
    while (i < o.length) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
  const pear = (a, b) => { const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
    let c = 0, va = 0, vb = 0; for (let i = 0; i < n; i++) { c += (a[i] - ma) * (b[i] - mb); va += (a[i] - ma) ** 2; vb += (b[i] - mb) ** 2; } return va && vb ? c / Math.sqrt(va * vb) : NaN; };
  const localCorr = (x, y) => {
    const U = units(st.lv).filter((u) => isNum(u[x]) && isNum(u[y])), a = U.map((u) => u[x]), b = U.map((u) => u[y]);
    if (U.length < 5) return [];
    const L2 = U.filter((u) => u[x] > 0 && u[y] > 0);
    return [["pearson", { r: pear(a, b), n: U.length }], ["spearman", { r: pear(rankArr(a), rankArr(b)), n: U.length }],
      ["log", L2.length >= 5 ? { r: pear(L2.map((u) => Math.log(u[x])), L2.map((u) => Math.log(u[y]))), n: L2.length } : { r: null, n: L2.length }]];
  };
  const drawEl = () => {
    const E = C0().elasticity || [];
    $("#tr-el").innerHTML = `<thead><tr>${T.el_cols.map((c, i) => `<th class="${i ? "num" : ""}">${esc(c)}</th>`).join("")}</tr></thead><tbody>` +
      (E.length ? E.map((r) => `<tr><td>${esc(vl(r.x))}</td><td class="num"><b>${dec(r.beta, 2)}</b>${r.p < 0.01 ? "***" : r.p < 0.05 ? "**" : r.p < 0.1 ? "*" : ""}</td><td class="num">${dec(r.se, 2)}</td>
        <td class="num">${r.p < 0.001 ? "<0.001" : dec(r.p, 3)}</td><td class="num">${dec(r.r2, 2)}</td><td class="num">${r.n}</td></tr>`).join("") : `<tr><td colspan="6">${esc(T.na_s)}</td></tr>`) + "</tbody>";
  };
  const drawSens = () => {
    const s = D.levels[st.lv]["sens_" + st.ix]; if (!s) return;
    const names = D.schemes[st.ix] || {}, W = s.weights || {};
    const wtxt = (w) => Object.entries(w || {}).filter(([, v]) => v > 0).map(([k, v]) => `${WK[k] || k} ${Math.round(100 * v)}`).join(" · ");
    $("#tr-se-t").innerHTML = `<thead><tr>${T.se_cols.map((c, i) => `<th class="${i > 1 ? "num" : ""}">${esc(c.replace("{k}", s.k_top))}</th>`).join("")}</tr></thead><tbody>` +
      (s.stats || []).map((r) => `<tr${r.scheme === "baseline" ? ' class="tr-base"' : ""}><td>${esc(names[r.scheme] || r.scheme)}</td><td class="small">${esc(wtxt(W[r.scheme]))}</td>
        <td class="num"><b>${dec(r.spearman, 2)}</b></td><td class="num">${pct(r.top_overlap, 0)}</td><td class="num">${dec(r.mean_shift, 1)}</td><td class="num">${isNum(r.max_shift) ? r.max_shift : "–"}</td></tr>`).join("") + "</tbody>";
    const U = (s.units || []).slice().sort((a, b) => a.ranks.baseline - b.ranks.baseline);
    const el = $("#tr-se"); if (el) el.style.height = Math.max(380, 17 * U.length + 90) + "px";
    const keys = Object.keys(names), sym = ["diamond", "circle", "square", "triangle-up", "x", "star"];
    const tr = [{ type: "scatter", mode: "lines", x: U.flatMap((u) => [Math.min(...Object.values(u.ranks)), Math.max(...Object.values(u.ranks)), null]),
      y: U.flatMap((u) => [u.name, u.name, null]), line: { color: IMF.pale, width: 7 }, hoverinfo: "skip", showlegend: false }];
    keys.forEach((k, i) => tr.push({ type: "scatter", mode: "markers", name: names[k], x: U.map((u) => u.ranks[k]), y: U.map((u) => u.name),
      marker: { symbol: sym[i % sym.length], size: k === "baseline" ? 11 : 7, color: k === "baseline" ? IMF.navy : C().s[(i + 1) % 8], line: { width: k === "baseline" ? 0 : 0.5, color: "#fff" } },
      hovertemplate: "%{y}: " + (FR ? "rang" : "rank") + " %{x}<extra>" + esc(names[k]) + "</extra>" }));
    plot("tr-se", U.length ? tr : [], { xaxis: { title: { text: FR ? "rang (1 = le mieux desservi)" : "rank (1 = best served)" }, range: [0, U.length + 1] },
      yaxis: { autorange: "reversed", tickfont: { size: 10 } }, margin: { l: 120, t: 40 }, legend: { y: 1.08 } });
  };
  const drawHdi = () => {
    const H = D.hdi || [];
    if (!H.length) { $("#tr-hdi").innerHTML = `<p class="help">${esc(T.hd_na)}</p>`; $("#tr-hdi").style.height = "auto"; return; }
    const isos = Object.keys(D.hdi_names || {});
    plot("tr-hdi", isos.map((c, i) => { const z = H.filter((r) => r.iso3 === c && r.indicator === st.hdi).sort((a, b) => a.year - b.year);
      return { x: z.map((r) => r.year), y: z.map((r) => r.value), name: D.hdi_names[c], mode: "lines+markers", marker: { size: c === "MRT" ? 5 : 3 },
        line: { width: c === "MRT" ? 3.4 : 1.8, color: c === "MRT" ? IMF.blue : { MAR: IMF.orange, DZA: IMF.green, SEN: IMF.purple, MLI: IMF.teal }[c] || IMF.grey } }; }).filter((t) => t.y.length),
      { yaxis: { title: { text: (D.hdi_vars || {})[st.hdi] || "" } }, legend: { y: 1.14 } });
  };
  const drawCorrView = () => { fillXY(); drawCM(); drawPair(); drawEl(); drawSens(); drawHdi(); };

  /* ------------------------------------------------------------------ events */
  let view = "map", corrDone = false;
  onSeg("tr-view", (v) => { view = v; $("#tr-map-view").hidden = v !== "map"; $("#tr-corr-view").hidden = v !== "corr";
    if (v === "corr") { drawCorrView(); corrDone = true; } else if (mp) setTimeout(() => mp.invalidateSize(), 40); window.dispatchEvent(new Event("resize")); });
  onSeg("tr-lv", (l) => { st.lv = l; store.set("ntl-tr-lv", l); $("#tr-var").innerHTML = varOpts();
    if (!units(l).some((u) => isNum(u[st.v]))) st.v = "road_density";
    drawMapView(); if (view === "corr" || corrDone) drawCorrView(); });
  $("#tr-var").onchange = (e) => { st.v = e.target.value; drawChoro(); drawRank(); };
  $("#tr-roads").onchange = (e) => { st.roads = e.target.checked; drawRoads(); };
  $("#tr-pois").onchange = (e) => { const s = e.target.dataset.s; if (!s) return; const was = st.pois.size; if (e.target.checked) st.pois.add(s); else st.pois.delete(s); if (!was !== !st.pois.size) drawChoro(); drawPois(); };
  onSeg("tr-m", (m) => { st.m = m; drawCM(); });
  onSeg("tr-ix", (k) => { st.ix = k; drawSens(); });
  onSeg("tr-hd", (k) => { st.hdi = k; drawHdi(); });
  $("#tr-x").onchange = (e) => { st.x = e.target.value; drawPair(); };
  $("#tr-y").onchange = (e) => { st.y = e.target.value; drawPair(); };
  $("#tr-lx").onchange = (e) => { st.lx = e.target.checked; drawPair(); };
  $("#tr-ly").onchange = (e) => { st.ly = e.target.checked; drawPair(); };
  drawMapView();
};
})();
