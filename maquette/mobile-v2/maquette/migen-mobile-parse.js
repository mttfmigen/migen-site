// Lecture du corpus complet (contenu/site/*.md) pour la maquette mobile.
// Règle : tout le texte de la page est conservé ; seules les lignes de travail (URL, Title, Meta, Gabarit, notes de visuel) sont écartées.
(function (W) {
  var META = /^(?:>\s*)?(?:\*\*)?\s*(URL|Title SEO|Title|Meta description|Meta|Gabarit|H1|Slug|Mots?[- ]cl[ée]s?(?: principal)?|Intention|Longueur)\s*(?:\*\*)?\s*:/i;
  var WORK = /^(?:\*\*)?\s*(visuel|image|photo|illustration|note|maillage|bloc|encart|format|sch[ée]ma|lien interne)\b[^:]{0,40}(?:\*\*)?\s*:/i;
  var MAP = { "CHIFFRES CLES": "Chiffres clés", "CHIFFRES CLÉS": "Chiffres clés", "LE PROBLEME": "Le problème", "LE PROBLÈME": "Le problème", "L'OFFRE": "L’offre", "LE DEROULE": "Le déroulé", "LE DÉROULÉ": "Le déroulé", "CE QUE NOUS GARANTISSONS": "Ce que nous garantissons", "PREUVES": "Nos références", "OBJECTIONS": "Questions fréquentes", "CTA": "CTA", "CTA FINAL": "CTA", "HEROS": "HEROS", "HÉROS": "HEROS", "LE CLIENT ET LE SITE": "Le client et le site", "LA SITUATION": "La situation", "CE QUE NOUS AVONS MIS EN PLACE": "Ce que nous avons mis en place", "LE DISPOSITIF": "Le dispositif", "LE RÉSULTAT": "Le résultat", "LE RESULTAT": "Le résultat" };
  function clean(t) { return String(t == null ? "" : t).replace(/\[[^\]]*(?:à compléter|a completer|à renseigner)[^\]]*\]/gi, "").replace(/[ \t]{2,}/g, " ").trim(); }
  function segs(t, keepEdges) {
    t = keepEdges ? String(t == null ? "" : t) : clean(t);
    var out = [], re = /\*\*([\s\S]+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g, last = 0, m;
    while ((m = re.exec(t))) {
      if (m.index > last) out.push({ t: t.slice(last, m.index), href: "", b: false });
      if (m[1] != null) segs(m[1], true).forEach(function (s) { out.push({ t: s.t, href: s.href, b: true }); });
      else out.push({ t: m[2].replace(/\*\*/g, ""), href: m[3], b: false });
      last = re.lastIndex;
    }
    if (last < t.length) out.push({ t: t.slice(last), href: "", b: false });
    return out.filter(function (s) { return s.t; });
  }
  function plain(s) { return (s || []).map(function (x) { return x.t; }).join(""); }
  function normT(t) {
    t = clean(String(t).replace(/\*\*/g, "")).replace(/^SECTION\s*\d+\s*[.·:–—-]?\s*/i, "");
    var base = t.replace(/\s*\([^)]*\)\s*$/, "");
    if (/[A-Z]/.test(base) && base === base.toUpperCase()) {
      var k = base.replace(/’/g, "'").trim();
      if (MAP[k]) return MAP[k];
      if (/^[A-Z0-9À-Ý]{2,5}$/.test(k)) return k;
      if (/^OBJECTIONS/.test(k)) return "Questions fréquentes";
      return base.charAt(0) + base.slice(1).toLowerCase();
    }
    return t;
  }
  function kindOf(t) {
    var x = t.toLowerCase();
    if (x === "cta" || /^cta\b/.test(x)) return "cta";
    if (x === "heros") return "hero";
    if (/chiffres cl/.test(x)) return "stats";
    if (/questions? fr[ée]quentes|^faq\b|objections|questions qu/.test(x)) return "faq";
    if (/r[ée]sultat/.test(x)) return "result";
    if (/client et le site/.test(x)) return "facts";
    if (/pour aller plus loin|[àa] lire aussi/.test(x)) return "related";
    return "text";
  }
  function blocks(lines) {
    var B = [], buf = [], i = 0;
    function flush() { if (buf.length) { var s = segs(buf.join(" ")); if (s.length) B.push({ k: "p", s: s }); buf = []; } }
    while (i < lines.length) {
      var l = String(lines[i]).trim();
      if (!l || /^-{3,}$/.test(l) || /^\*{3,}$/.test(l)) { flush(); i++; continue; }
      if (META.test(l) || WORK.test(l)) { flush(); i++; continue; }
      if (/^#{3,6}\s+/.test(l)) { flush(); B.push({ k: "h3", s: segs(l.replace(/^#+\s+/, "")) }); i++; continue; }
      if (/^\|/.test(l)) {
        flush(); var rows = [];
        while (i < lines.length && /^\|/.test(String(lines[i]).trim())) { var r = String(lines[i]).trim(); if (!/^\|\s*:?-{2,}/.test(r)) rows.push(r.replace(/^\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) { return segs(c); })); i++; }
        if (rows.length) B.push({ k: "tb", head: rows[0], rows: rows.slice(1) });
        continue;
      }
      if (/^>/.test(l)) {
        flush(); var q = [];
        while (i < lines.length && /^>/.test(String(lines[i]).trim())) { var ql = String(lines[i]).trim().replace(/^>\s?/, ""); if (!META.test(ql) && !WORK.test(ql)) q.push(ql); i++; }
        var qj = q.join(" ").trim(), qr = qj.match(/^(?:\*\*)?\s*[ÀA] lire aussi\s*(?:\*\*)?\s*:\s*(.+)$/i); if (qr) { B.push({ k: "rel", s: segs(qr[1]) }); continue; } var qs = segs(qj); if (qs.length) B.push({ k: "q", s: qs });
        continue;
      }
      if (/^[-*•]\s+/.test(l)) {
        flush(); var items = [];
        while (i < lines.length && /^[-*•]\s+/.test(String(lines[i]).trim())) { var it = String(lines[i]).trim().replace(/^[-*•]\s+/, ""); if (!WORK.test(it)) items.push(segs(it)); i++; }
        if (items.length) B.push({ k: "ul", items: items });
        continue;
      }
      if (/^\d+[.)]\s+/.test(l)) {
        flush(); var ol = [];
        while (i < lines.length && /^\d+[.)]\s+/.test(String(lines[i]).trim())) { ol.push(segs(String(lines[i]).trim().replace(/^\d+[.)]\s+/, ""))); i++; }
        B.push({ k: "ol", items: ol });
        continue;
      }
      var rel = l.match(/^(?:\*\*)?\s*[ÀA] lire aussi\s*(?:\*\*)?\s*:\s*(.+)$/i);
      if (rel) { flush(); B.push({ k: "rel", s: segs(rel[1]) }); i++; continue; }
      buf.push(l); i++;
    }
    flush();
    return B;
  }
  function labeled(lines, P, target) {
    var rest = [];
    lines.forEach(function (raw) {
      var l = String(raw).trim(), m = l.match(/^\*\*([^*]+)\*\*\s*:\s*(.+)$/);
      if (!m) { rest.push(raw); return; }
      var lab = m[1].toLowerCase(), v = m[2];
      if (/^h1\b/.test(lab)) return;
      if (WORK.test("**" + m[1] + "** :")) return;
      if (/m[ée]canisme|sous-titre|accroche|chap[ôo]/.test(lab)) { if (target) target.lead = segs(v); else P.sub = clean(v); return; }
      if (/^kicker|sur-titre|surtitre/.test(lab)) { if (target) target.kick = clean(v); else P.kick = clean(v); return; }
      if (/^punchline/.test(lab)) { if (target) target.lead = segs(v); else P.punch = clean(v); return; }
      if (/^cta\b|^bouton/.test(lab)) { var c = { label: clean(v), href: "/contact/" }; if (target) target.btn = c; else P.cta = c; return; }
      rest.push(raw);
    });
    return blocks(rest);
  }
  function faqItems(B) {
    var items = [], cur = null, pre = [];
    B.forEach(function (b) {
      if (b.k === "tb" && b.head.length >= 2 && /question/i.test(plain(b.head[0]))) { b.rows.forEach(function (r) { items.push({ q: r[0], a: [{ k: "p", s: r[1] || [] }] }); }); cur = null; return; }
      if (b.k === "h3") { cur = { q: b.s, a: [] }; items.push(cur); return; }
      if (b.k === "p" && b.s.length && b.s[0].b && /\?\s*$/.test(b.s[0].t)) {
        var rest = b.s.slice(1); if (rest.length) rest[0] = { t: rest[0].t.replace(/^\s*[:.–—-]\s*/, ""), href: rest[0].href, b: rest[0].b };
        cur = { q: [{ t: b.s[0].t, href: "", b: false }], a: rest.filter(function (x) { return x.t; }).length ? [{ k: "p", s: rest }] : [] }; items.push(cur); return;
      }
      if (cur) cur.a.push(b); else pre.push(b);
    });
    return { items: items, pre: pre };
  }
  function statsOf(B) {
    var st = [], other = [];
    B.forEach(function (b) {
      if (b.k === "ul") b.items.forEach(function (s) { var t = plain(s), m = t.match(/^([^:]{1,40}?)\s*:\s*(.+)$/); st.push(m ? { v: m[1].trim(), l: m[2].trim() } : { v: "", l: t }); });
      else if (b.k === "tb") b.rows.forEach(function (r) { st.push({ v: plain(r[0]), l: r.slice(1).map(plain).join(" · ") }); });
      else other.push(b);
    });
    return { stats: st, other: other };
  }
  function parse(md, e) {
    var L = String(md || "").replace(/\r/g, "").split("\n");
    function get(re) { for (var i = 0; i < L.length; i++) { var m = L[i].trim().match(re); if (m) return clean(m[1].replace(/\*\*/g, "")); } return ""; }
    var P = { title: get(/^>?\s*\**\s*(?:Title SEO|Title)\s*\**\s*:\s*(.+)$/i) || (e && e.title) || "", meta: get(/^>?\s*\**\s*(?:Meta description|Meta)\s*\**\s*:\s*(.+)$/i), h1: get(/^\**\s*H1\s*\**\s*:\s*(.+)$/i), sub: "", kick: "", punch: "", cta: null, phone: "", intro: [], secs: [] };
    var chunks = [], cur = { h: null, lines: [] };
    L.forEach(function (raw) {
      var l = raw.trim();
      if (/^##\s+/.test(l)) { chunks.push(cur); cur = { h: l.replace(/^##\s+/, ""), lines: [] }; return; }
      if (/^#\s+/.test(l)) { var t = l.replace(/^#\s+/, ""); if (!P.h1 && !/^\//.test(t)) P.h1 = clean(t.replace(/\*\*/g, "")); return; }
      cur.lines.push(raw);
    });
    chunks.push(cur);
    if (!P.h1) P.h1 = (e && e.h1) || "";
    var pKick = "", pKind = "";
    chunks.forEach(function (c) {
      if (c.h == null) { P.intro = P.intro.concat(labeled(c.lines, P, null)); return; }
      var t = normT(c.h), k = kindOf(t);
      if (k === "hero") { P.intro = P.intro.concat(labeled(c.lines, P, null)); return; }
      var s = { t: k === "cta" ? "" : t, k: k, kick: "", b: [], lead: null, btn: null };
      s.b = k === "cta" ? labeled(c.lines, P, s) : blocks(c.lines);
      if (!s.b.length && !s.lead && !s.btn) { pKick = t; pKind = k; return; }
      if (k === "text" && pKind && pKind !== "text") { s.k = pKind; }
      s.kick = pKick; pKick = ""; pKind = "";
      if (s.k === "faq") { var f = faqItems(s.b); if (f.items.length) { s.faq = f.items; s.b = f.pre; } else s.k = "text"; }
      if (s.k === "stats") { var so = statsOf(s.b); if (so.stats.length) { s.stats = so.stats; s.b = so.other; } else s.k = "text"; }
      P.secs.push(s);
    });
    for (var i = 0; i < P.intro.length; i++) {
      var b = P.intro[i];
      if (b.k === "q") { var lk = b.s.filter(function (x) { return x.href; })[0]; if (lk) { if (!P.cta || P.cta.href === "/contact/") P.cta = { label: lk.t, href: lk.href }; var ph = plain(b.s).match(/0\d(?:[\s.]?\d{2}){4}/); if (ph) P.phone = ph[0]; P.intro.splice(i, 1); break; } }
    }
    return P;
  }
  function gab(u, e) {
    var g = e && e.gabarit ? String(e.gabarit).match(/(\d{1,2})/) : null;
    if (g) return ("0" + g[1]).slice(-2);
    var s = String(u).split("/").filter(Boolean), f = s[0] || "";
    if (!s.length) return "00";
    if (s.length === 1) return "10";
    if (f === "preuves") return "02";
    if (f === "implantations") return s.length === 2 ? "04" : "06";
    if (f === "expertises") return s.length === 2 ? "09" : "05";
    if (f === "secteurs") return "08";
    if (f === "carriere") return s.length === 2 ? "07" : "01";
    if (f === "ressources") return s.length === 2 ? "11" : "01";
    if (f === "guides") return "01";
    if (f === "a-propos") return "10";
    return "03";
  }
  W.MGParse = { parse: parse, segs: segs, plain: plain, gab: gab, clean: clean };
})(typeof window !== "undefined" ? window : this);
