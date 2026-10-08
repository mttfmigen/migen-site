/*
 * LE CODE DE MISE EN PAGE DE LA MAQUETTE, recopié tel quel.
 *
 * Source : les méthodes `cx*` de l'application autonome
 * (`maquette/site-final-autonome.html`), identiques à celles de
 * `design_handoff_migen_site/maquette/Migen - Site final.dc.html` (comparées
 * octet pour octet le 08/10). C'est ce code qui range le texte d'une page
 * « générique » (gabarit `vente` ou `edito` de la maquette, 8 des 28 pages du
 * gabarit 03) dans ses écrans : constat, méthode, références, sections
 * numérotées, bento, accordéons, « Lire la suite »… Le réécrire aurait été
 * le moyen sûr de s'en écarter : il est recopié, et seul `vue()`, en bas, est
 * de nous (la partie « page c » de `cxVals`, sans l'index de la maquette).
 *
 * Fichier JS volontairement (allowJs, non vérifié par tsc) : les méthodes ne
 * sont pas retouchées. Les trois liens de navigation (`cxGo`, `cxLinkGo`,
 * `nav`) rendent une URL au lieu d'un gestionnaire de clic.
 */

const ECRANS = { accueil: "/", realisations: "/preuves/", carriere: "/carriere/", contact: "/contact/" };

/** Les cibles des pastilles « Sur cette page » que pose `cxSpine`. */
const ANCRES = {
  "Le constat": "#sp-problem", "La méthode": "#sp-method", "Le périmètre": "#sp-include",
  "Nos engagements": "#sp-commit", "Références": "#sp-proof", "Questions": "#sp-faq",
  "Demander un devis": "#cx-form",
};

const CX_FAMS = [["Offres", "Offres"], ["Expertises", "Expertises"], ["Secteurs", "Secteurs"], ["Implantations", "Nos implantations"], ["Metiers-Carriere", "Métiers & carrière"], ["Ressources", "Ressources"], ["Preuves", "Cas clients"], ["Entreprise", "Entreprise"]];
const CX_IMG = { "Offres": "assets/web/team-electric.jpg", "Expertises": "assets/web/ph-robots-solaire.jpg", "Secteurs": "assets/web/x-auto-ligne.jpg", "Implantations": "assets/web/team-grind-sparks.jpg", "Metiers-Carriere": "assets/web/team-duo.jpg", "Ressources": "assets/web/ph-technicien.jpg", "Preuves": "assets/web/x-elec-disjoncteur.jpg", "Entreprise": "assets/web/team-grind-front.jpg" };

class Maquette {
  constructor() {
    this.state = {};
  }
  setState() {}
  nav(page) {
    return ECRANS[page] ?? "/";
  }
  cxGo(url) {
    return url;
  }
  cxLinkGo(href) {
    return href;
  }

  cxFormat(e) {
    const u = e.url;
    if (/^\/expertises\//.test(u)) return "Expertise";
    if (/^\/(offres|bureau-etudes|travaux-industriels)\//.test(u)) return "Offre";
    if (/^\/secteurs\//.test(u)) return "Secteur";
    if (/^\/implantations\//.test(u)) return "Implantation";
    if (/\/articles\/.+/.test(u)) return "Article";
    if (/\/fiches-pratiques\/.+/.test(u)) return "Fiche pratique";
    if (/\/fiches-techniques\/.+/.test(u)) return "Fiche technique";
    if (/\/livres-blancs\/.+/.test(u)) return "Livre blanc";
    if (/\/process\/.+/.test(u)) return "Process";
    if (/^\/carriere\/.+/.test(u) && !/alternance/.test(u)) return "Fiche métier";
    if (/^\/carriere\//.test(u)) return "Carrière";
    if (e.famille === "Ressources") return "Ressources";
    return "Guide";
  }
  cxParse(md) {
    const lines = md.replace(/\r/g, "").split("\n");
    const sep = lines.findIndex(l => l.trim() === "---");
    const body = sep >= 0 ? lines.slice(sep + 1) : lines;
    const blocks = [];
    let blank = false;
    const last = () => blocks[blocks.length - 1];
    const handle = raw => {
      const t = raw.trim();
      if (!t) { blank = true; return; }
      if (/^#\s/.test(t)) { blank = false; return; }
      if (/^##\s/.test(t)) {
        const h = t.replace(/^##\s+/, "");
        const glued = h.match(/^(.*?\D)(\d+\.\s+\*\*.*)$/);
        if (glued) { blocks.push({ type: "h2", text: glued[1].trim() }); blank = false; handle(glued[2]); return; }
        blocks.push({ type: "h2", text: h }); blank = false; return;
      }
      if (/^###\s/.test(t)) { blocks.push({ type: "h3", text: t.replace(/^###\s+/, "") }); blank = false; return; }
      if (/^>/.test(t)) {
        const x = t.replace(/^>\s?/, "");
        if (last() && last().type === "quote" && !blank) last().text += " " + x; else blocks.push({ type: "quote", text: x });
        blank = false; return;
      }
      if (/^\|/.test(t)) {
        const cells = t.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
        if (cells.every(c => /^:?-{2,}:?$/.test(c))) { blank = false; return; }
        if (last() && last().type === "table") last().rows.push(cells); else blocks.push({ type: "table", head: cells, rows: [] });
        blank = false; return;
      }
      if (/^[-*]\s+/.test(t)) {
        const x = t.replace(/^[-*]\s+/, "");
        if (last() && last().type === "ul") last().items.push(x); else blocks.push({ type: "ul", items: [x] });
        blank = false; return;
      }
      const ol = t.match(/^(\d+)\.\s+(.*)$/);
      if (ol) {
        if (last() && last().type === "ol") last().items.push(ol[2]); else blocks.push({ type: "ol", items: [ol[2]] });
        blank = false; return;
      }
      blocks.push({ type: "p", text: t });
      blank = false;
    };
    body.forEach(handle);
    return blocks;
  }
  cxSegs(text) {
    const out = [];
    const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
    let i = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > i) out.push({ t: text.slice(i, m.index), plain: true, bold: false, link: false });
      if (m[1] !== undefined) out.push({ t: m[1], plain: false, bold: true, link: false });
      else {
        const href = m[3];
        const internal = href.charAt(0) === "/";
        out.push({ t: m[2].replace(/\*\*/g, ""), plain: false, bold: false, link: true, href: internal ? "#" : href, go: internal ? this.cxLinkGo(href) : undefined });
      }
      i = re.lastIndex;
    }
    if (i < text.length) out.push({ t: text.slice(i), plain: true, bold: false, link: false });
    return out;
  }
  cxSplit(txt) {
    const m = txt.match(/^\*\*(.+?)\*\*\s*[:.,—–-]?\s*(.*)$/);
    if (!m) return null;
    // Le texte qui suit « Titre : » commence en minuscule dans la source.
    const rest = m[2] ? m[2].charAt(0).toUpperCase() + m[2].slice(1) : "";
    return { title: m[1].replace(/[:.]\s*$/, ""), rest };
  }
  cxBlock(b) {
    const F = { isP: false, isH3: false, isUl: false, isUl2: false, isCards: false, isRows: false, isOl: false, isOlRows: false, isQuote: false, isCta: false, isLinkCard: false, isTable: false };
    if (b.type === "p") return Object.assign({}, F, { isP: true, segs: this.cxSegs(b.text) });
    if (b.type === "h3") return Object.assign({}, F, { isH3: true, text: b.text.replace(/\*\*/g, "") });
    if (b.type === "quote") {
      const only = b.text.trim().match(/^\[([^\]]+)\]\(([^)]+)\)\s*(?:[·|]\s*04[\s\d]*)?$/);
      if (only) return Object.assign({}, F, { isLinkCard: true, title: only[1], go: this.cxLinkGo(only[2]) });
      const cta = /04 78 33 72 05|formulaire|devis|prenez contact|rappelons|rappelle/i.test(b.text);
      const txt = b.text.replace(/\s*(?:Ou appelez le\s*)?04 78 33 72 05[,.]?\s*(du lundi au vendredi[^.]*\.)?\s*/gi, " ").replace(/\s{2,}/g, " ").trim();
      return Object.assign({}, F, { isCta: cta, isQuote: !cta, segs: this.cxSegs(cta ? txt : b.text) });
    }
    if (b.type === "ul") {
      const parts = b.items.map(x => this.cxSplit(x));
      if (b.items.length >= 2 && parts.every(p => p && p.rest.length > 18)) {
        const items = parts.map((p, i) => ({ n: String(i + 1).padStart(2, "0"), title: p.title, segs: this.cxSegs(p.rest),
          rowCss: "display:grid;grid-template-columns:40px minmax(0,.85fr) minmax(0,1.4fr);gap:26px;padding:22px 0" + (i < parts.length - 1 ? ";border-bottom:1px solid var(--line)" : "") }));
        // Au-delà de trois, des cartes étroites deviennent un mur : on passe en lignes.
        return Object.assign({}, F, parts.length <= 3 ? { isCards: true, items } : { isRows: true, items });
      }
      const avg = b.items.reduce((n, x) => n + x.length, 0) / b.items.length;
      const items = b.items.map(x => ({ segs: this.cxSegs(x) }));
      return Object.assign({}, F, avg < 72 && b.items.length >= 4 ? { isUl2: true, items } : { isUl: true, items });
    }
    if (b.type === "ol") {
      const n = b.items.length;
      const avg = b.items.reduce((k, x) => k + x.length, 0) / n;
      const items = b.items.map((x, i) => {
        const p = this.cxSplit(x);
        return { n: String(i + 1).padStart(2, "0"), hasTitle: !!p, title: p ? p.title : "", segs: this.cxSegs(p ? p.rest : x),
          railCss: i < n - 1 ? "flex:1;width:1px;background:var(--line);margin-top:8px" : "display:none" };
      });
      return Object.assign({}, F, n <= 4 && avg < 200 ? { isOl: true, items } : { isOlRows: true, items });
    }
    if (b.type === "table" && b.head.length === 2 && b.rows.length >= 3) {
      return Object.assign({}, F, { isDuo: true, duo: b.rows.map((r, i) => ({ n: String(i + 1).padStart(2, "0"), l: this.cxSegs(r[0] || ""), r: this.cxSegs(r[1] || "") })) });
    }
    if (b.type === "table") {
      const th = "text-align:left;padding:14px 18px;font:600 10.5px var(--fb);letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);border-bottom:1px solid var(--line)";
      return Object.assign({}, F, { isTable: true,
        head: b.head.map((t, i) => ({ t: t.replace(/\*\*/g, ""), css: th + (i === 1 ? ";color:var(--acc-ink)" : "") })),
        rows: b.rows.map((r, ri) => ({ cells: r.map((c, i) => ({ segs: this.cxSegs(c),
          css: "padding:14px 18px;vertical-align:top;font:" + (i === 0 ? "600 14px/1.45 var(--ft);letter-spacing:-.015em;color:var(--ink)" : "400 14px/1.6 var(--fb);color:var(--ink2)") + (ri < b.rows.length - 1 ? ";border-bottom:1px solid var(--line)" : "") })) }))
      });
    }
    return F;
  }
  cxLen(b) {
    const seg = a => (a || []).reduce((n, x) => n + (x.t ? x.t.length : 0), 0);
    if (b.segs) return seg(b.segs);
    if (b.items) return b.items.reduce((n, it) => n + seg(it.segs) + (it.title ? it.title.length : 0), 0);
    if (b.rows) return b.rows.length * 90;
    if (b.units) return b.units.length * 260;
    if (b.unit) return 320;
    return (b.text || b.title || "").length;
  }
  cxBento(b, cols) {
    const n = b.items.length;
    const span = b.items.map((_, i) => (i === 0 && cols > 1 ? 2 : 1));
    if (cols === 3) { let t = span.reduce((a, x) => a + x, 0); let j = n - 1; while (t % 3 && j > 0) { span[j] = 2; t++; j--; } }
    if (cols === 2) { const t = span.reduce((a, x) => a + x, 0); if (t % 2) span[n - 1] = 2; }
    const glass = "background:rgba(255,255,255,var(--gl-a));backdrop-filter:blur(var(--gl-b)) saturate(150%);-webkit-backdrop-filter:blur(var(--gl-b)) saturate(150%);border:1px solid var(--gbd);box-shadow:0 1px 1px rgba(0,0,0,.04),0 20px 46px -32px rgba(0,0,0,.3)";
    return Object.assign({}, b, { isRows: false, isCards: false, isBento: true,
      gridCss: "display:grid;grid-template-columns:repeat(" + cols + ",minmax(0,1fr));gap:12px;margin:8px 0 26px",
      items: b.items.map((it, i) => {
        const dark = i === 0;
        const lm = String(it.title || "").match(/^\s*\[([^\]]+)\]\(([^)]+)\)\s*$/);
        const title = lm ? lm[1] : String(it.title || "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
        return Object.assign({}, it, { title, href: lm ? lm[2] : "", hasHref: !!lm, noHref: !lm, go: lm ? this.cxGo(lm[2]) : null,
          cellCss: "grid-column:span " + span[i] + ";border-radius:var(--rad);padding:24px 26px;min-height:150px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;" + (dark ? "background:#1c1b19;color:#fff" : glass + ";color:var(--ink)"),
          titleCss: "font:600 calc(" + (span[i] > 1 ? "19px" : "16px") + " * var(--ts))/1.3 var(--ft);letter-spacing:-.025em;margin-bottom:6px;color:" + (dark ? "#fff" : "var(--ink)"),
          txtCss: "font:400 14px/1.6 var(--fb);color:" + (dark ? "rgba(255,255,255,.7)" : "var(--ink2)")
        });
      })
    });
  }
  cxInner(b) {
    const it = b.items || [];
    if (b.isP || b.isLead) return { p: true, segs: b.segs };
    if (b.isUl || b.isUl2) return { ul: true, items: it };
    if (b.isCards || b.isRows || b.isBento) return { ult: true, items: it };
    if (b.isOl || b.isOlRows) return { ol: true, items: it };
    if (b.isQuote || b.isCta) return { q: true, segs: b.segs };
    if (b.isTable) return { tb: true, head: b.head, rows: b.rows };
    if (b.isLinkCard) return { lk: true, title: b.title, go: b.go };
    return { p: true, segs: [] };
  }
  cxGroup(blocks, key) {
    const out = [];
    let run = null;
    const flush = () => {
      if (!run) return;
      const n = run.length;
      // Une citation finale appartient à la H2, pas à la dernière H3.
      let tail = null;
      const last = run[n - 1];
      if (last.raw.length > 1 && (last.raw[last.raw.length - 1].isQuote || last.raw[last.raw.length - 1].isCta)) tail = last.raw.pop();
      const units = run.map((u, j) => {
        const k = key + "-" + out.length + "-" + j;
        const open = n >= 5 ? (this.state.cSub === undefined ? j === 0 : this.state.cSub === k) : true;
        return { title: u.title, n: String(j + 1).padStart(2, "0"), blocks: u.raw.map(x => this.cxInner(x)), open,
          toggle: () => this.setState(st => ({ cSub: st.cSub === k ? null : k })),
          iconCss: "display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;flex:none;font:400 18px/1 var(--fb);transition:transform var(--tr),background var(--tr);background:" + (open ? "var(--acc)" : "var(--chip)") + ";color:" + (open ? "#fff" : "var(--ink2)") + ";transform:rotate(" + (open ? 45 : 0) + "deg)" };
      });
      if (n === 1) out.push({ isSub: true, unit: units[0] });
      else if (n <= 4) out.push({ isSubGrid: true, units, gridCss: "display:grid;gap:12px;margin:10px 0 26px;grid-template-columns:repeat(" + (n === 3 ? 3 : 2) + ",minmax(0,1fr))" });
      else out.push({ isSubAcc: true, units });
      if (tail) out.push(tail);
      run = null;
    };
    blocks.forEach(b => {
      if (b.isH3) { if (!run) run = []; run.push({ title: b.text, raw: [] }); return; }
      if (run) { run[run.length - 1].raw.push(b); return; }
      out.push(b);
    });
    flush();
    return out;
  }
  cxShape(o, k, vente) {
    const LAY = ["split", "mediaL", "mediaR", "wide"];
    // Un tableau a besoin de toute la largeur : jamais à côté d'une colonne
    // latérale. Ces sections sortent de la rotation, qui reprend ensuite là
    // où elle s'était arrêtée — sinon les pleines largeurs s'enchaînent.
    const hasTable = o.all.some(b => b.isTable);
    if (vente && k === 0) this._layI = 0;
    let lay = "edito";
    if (vente) {
      if (hasTable) lay = "wide";
      else {
        const PICK = ["split", "mediaL", "mediaR"];
        lay = PICK[(this._layI || 0) % 3];
        this._layI = (this._layI || 0) + 1;
      }
    }
    let blocks = o.all.map(b => {
      const n = b.items ? b.items.length : 0;
      if (b.isRows && n >= 4 && n <= 8 && (lay === "wide" || lay === "mediaR" || lay === "edito")) return this.cxBento(b, lay === "wide" ? 3 : 2);
      return b;
    });
    // Chapô et regroupement des H3 : seul le gabarit de vente sait les afficher.
    if (vente) {
      blocks = this.cxGroup(blocks, o.id || ("s" + k));
      if (blocks[0] && blocks[0].isP) blocks[0] = Object.assign({}, blocks[0], { isP: false, isLead: true });
    }
    const total = blocks.reduce((a, b) => a + this.cxLen(b), 0);
    const limit = vente ? 1500 : 2400;
    let head = blocks, more = [];
    if (total > limit && blocks.length >= 4) {
      let acc = 0, cut = 0;
      for (let i = 0; i < blocks.length; i++) { acc += this.cxLen(blocks[i]); cut = i + 1; if (acc >= (vente ? 650 : 1000) && cut >= 2) break; }
      while (cut > 1 && blocks[cut - 1].isH3) cut--;
      const rest = blocks.slice(cut);
      if (rest.reduce((a, b) => a + this.cxLen(b), 0) > 300) { head = blocks.slice(0, cut); more = rest; }
    }
    o.head = head; o.more = more; o.hasMore = more.length > 0;
    o.lay = lay;
    if (!vente) return o;
    // Deux pleines largeurs de suite : la seconde reçoit un bandeau photo.
    if (k === 0) this._prevWide = false;
    o.hasBanner = lay === "wide" && this._prevWide;
    this._prevWide = lay === "wide" && !o.hasBanner;
    const STATS = [["10\u00a0%", "des techniciens réussissent notre double évaluation"], ["1\u00a0h", "pour vous rappeler, en jours ouvrés"], ["5", "agences pour intervenir partout en France"], ["+200", "clients industriels suivis"]];
    const st = STATS[Math.floor(k / 4) % STATS.length];
    o.statN = st[0]; o.statT = st[1];
    o.hasCtaBand = k % 2 === 1;
    o.ctaTopic = (this._cxTopic || "votre maintenance");
    o.titleAside = lay === "split" || lay === "wide";
    o.titleMain = !o.titleAside;
    o.hasMedia = lay === "split";
    o.mediaTall = lay === "mediaL";
    o.mediaStat = lay === "mediaR";
    o.gridCss = lay === "wide" ? "max-width:1200px;margin:0 auto;padding:0 40px"
      : "max-width:1200px;margin:0 auto;padding:0 40px;display:grid;gap:56px;align-items:start;grid-template-columns:" +
        (lay === "split" ? "minmax(0,.78fr) minmax(0,1.42fr)" : lay === "mediaL" ? "minmax(0,.86fr) minmax(0,1.14fr)" : "minmax(0,1.14fr) minmax(0,.86fr)");
    o.asideCss = lay === "wide" ? "max-width:820px;margin-bottom:30px" : "position:sticky;top:110px" + (lay === "mediaR" ? ";order:2" : "");
    return o;
  }
  cxSection(sec, i, kind, url) {
    const id = "c" + (i + 1);
    const raw = sec.raw;
    const out = { faqCls: "",  id, num: String(i + 1).padStart(2, "0"), title: sec.title, isFaq: false, isCases: false, isSplit: false, isStd: false,
      afterCta: kind === "vente" && i === 1, afterDiag: url === "/offres/zero-arret/" && i === 0,
      afterTest: kind === "carriere" && i === 1, afterCtaEdito: kind !== "vente" && kind !== "carriere" && i === 1,
      all: raw.map(b => this.cxBlock(b)) };
    if (kind !== "vente") return out;
    if (/questions fréquentes|faq/i.test(sec.title) && raw.some(b => b.type === "h3")) {
      const intro = [], faqs = [];
      raw.forEach(b => {
        if (b.type === "h3") faqs.push({ q: b.text.replace(/\*\*/g, ""), raw: [] });
        else if (faqs.length) faqs[faqs.length - 1].raw.push(b); else intro.push(b);
      });
      out.isFaq = true; out.faqCls = "mg-faqph mg-faqsec";
      out.intro = intro.map(b => this.cxBlock(b));
      out.faqs = faqs.map((f, j) => {
        const key = id + "-" + j;
        const open = this.state.cFaq === key;
        return { q: f.q, open, blocks: f.raw.map(b => this.cxBlock(b)), toggle: () => this.setState(st => ({ cFaq: st.cFaq === key ? null : key })),
          iconCss: "display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;flex:none;font:400 20px/1 var(--fb);transition:transform var(--tr),background var(--tr);background:" + (open ? "var(--acc)" : "var(--chip)") + ";color:" + (open ? "#fff" : "var(--ink2)") + ";transform:rotate(" + (open ? 45 : 0) + "deg)" };
      });
      return out;
    }
    const caseList = raw.find(b => b.type === "ul" && b.items.length >= 2 && b.items.every(x => /\]\(\/preuves\//.test(x)));
    if (caseList) {
      out.isCases = true;
      out.intro = raw.filter(b => b !== caseList).map(b => this.cxBlock(b));
      out.cases = caseList.items.map(x => {
        const m = x.match(/\[(.+?)\]\((.+?)\)/);
        const label = (m ? m[1] : x).replace(/^Étude de cas\s*/i, "");
        const bits = label.split(/\s*:\s*/);
        return { client: bits[0], sub: bits[1] || "Étude de cas", go: this.nav("realisations") };
      });
      return out;
    }
    const lab = [];
    raw.forEach((b, k) => { if (b.type === "p" && /^\*\*[^*]{2,48}[.:]\*\*/.test(b.text)) lab.push(k); });
    if (lab.length >= 2 && lab[0] <= 1) {
      out.isSplit = true;
      out.intro = raw.slice(0, lab[0]).map(b => this.cxBlock(b));
      out.hasIntro = out.intro.length > 0;
      out.panels = lab.map((start, k) => {
        const end = k + 1 < lab.length ? lab[k + 1] : raw.length;
        const m = raw[start].text.match(/^\*\*([^*]+?)[.:]?\*\*\s*(.*)$/);
        const blocks = [];
        if (m && m[2]) blocks.push({ type: "p", text: m[2] });
        raw.slice(start + 1, end).forEach(b => blocks.push(b));
        return { label: m ? m[1] : "", dark: k % 2 === 1, light: k % 2 === 0, blocks: blocks.map(b => this.cxBlock(b)) };
      });
      out.two = out.panels.length === 2;
      out.many = out.panels.length !== 2;
      return out;
    }
    out.isStd = true;
    // Une section sur trois porte une image : le rythme vient de l'alternance texte / photo.
    const POOL = ["assets/web/team-electric.jpg", "assets/web/ph-tuyaux.jpg", "assets/web/x-soudure.jpg", "assets/web/ph-robots-solaire.jpg", "assets/web/x-cimenterie.jpg", "assets/web/team-grind-sparks.jpg", "assets/web/ph-hero-raffinerie.jpg", "assets/web/team-duo.jpg"];
    const seed = url.length + url.charCodeAt(url.length - 2);
    out.hasMedia = i % 3 === 1;
    out.noMedia = !out.hasMedia;
    out.mediaCss = "position:absolute;inset:0;background:var(--ph) url('" + POOL[(seed + i) % POOL.length] + "') center/cover no-repeat;filter:saturate(var(--sat)) contrast(1.05);opacity:var(--ph-op)";
    const first = raw[0];
    out.hasLead = !!first && first.type === "p";
    out.leadSegs = out.hasLead ? this.cxSegs(first.text) : [];
    out.blocks = (out.hasLead ? raw.slice(1) : raw).map(b => this.cxBlock(b));
    return out;
  }
  cxRole(t) {
    const x = t.toLowerCase();
    if (/questions fréquentes|faq/.test(x)) return "faq";
    if (/ils l.ont fait|référence|études? de cas|preuve|nous font confiance/.test(x)) return "proof";
    if (/comment ça se passe|étape|méthode|déroul|processus|notre approche|comment nous|comment travaill/.test(x)) return "method";
    if (/inclus|compris dans|périmètre/.test(x)) return "include";
    if (/délai|engagement|garantie|pourquoi (choisir|migen|nous)|ce qui (nous )?distingue|nos atouts|avantages/.test(x)) return "commit";
    if (/problème|constat|enjeu|répond|risque|coût|pourquoi/.test(x)) return "problem";
    return "detail";
  }
  cxPlain(t) { return t.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); }
  cxFirst(t, n) {
    return this.cxPlain(t);
  }
  cxFirst(t, n) {
    return this.cxPlain(t);
  }
  cxItem(x, n) {
    const p = this.cxSplit(x);
    return { title: p ? p.title : "", hasTitle: !!p, text: this.cxFirst(p ? p.rest : x, n) };
  }
  cxSpine(secs, e) {
    const used = {};
    const pick = role => { const s = secs.find(sc => !sc._used && this.cxRole(sc.title) === role); if (s) s._used = true; return s; };
    const lead = raw => { const p = raw.find(b => b.type === "p" && !/^\*\*[^*]{2,48}[.:]\*\*/.test(b.text)); return p ? this.cxFirst(p.text, 260) : ""; };
    const out = {};

    const pb = pick("problem");
    if (pb) {
      const raw = pb.raw;
      const lab = [];
      raw.forEach((b, k) => { if (b.type === "p" && /^\*\*[^*]{2,48}[.:]\*\*/.test(b.text)) lab.push(k); });
      const v = { title: pb.title, lead: lead(raw), hasSplit: false, hasPains: false };
      if (lab.length >= 2) {
        const panel = k => {
          const start = lab[k], end = k + 1 < lab.length ? lab[k + 1] : raw.length;
          const m = raw[start].text.match(/^\*\*([^*]+?)[.:]?\*\*\s*(.*)$/);
          const ul = raw.slice(start + 1, end).find(b => b.type === "ul");
          return { label: m ? m[1] : "", text: m && m[2] ? this.cxFirst(m[2], 200) : "", items: ul ? ul.items.map(x => this.cxItem(x, 120)) : [] };
        };
        v.hasSplit = true; v.before = panel(0); v.after = panel(1);
        // Le chapô vient de ce qui précède le constat, jamais d'un paragraphe de fin de section.
        const pre = raw.slice(0, lab[0]).find(b => b.type === "p");
        v.lead = pre ? this.cxFirst(pre.text, 260) : "";
      } else {
        const ul = raw.find(b => b.type === "ul");
        if (ul) { v.hasPains = true; v.pains = ul.items.map(x => this.cxItem(x, 150)); }
      }
      v.hasLead = !!v.lead;
      out.problem = v;
    }

    const me = pick("method");
    if (me) {
      const list = me.raw.find(b => b.type === "ol") || me.raw.find(b => b.type === "ul");
      out.method = { title: me.title, lead: lead(me.raw), steps: list ? list.items.map((x, i) => Object.assign({ n: String(i + 1).padStart(2, "0") }, this.cxItem(x, 170))) : [] };
      if (!out.method.steps.length) { me._used = false; delete out.method; }
    }

    const inc = pick("include");
    if (inc) {
      const raw = inc.raw;
      const tbl = raw.find(b => b.type === "table");
      let yes = [], you = [];
      if (tbl && tbl.head.length >= 3) {
        yes = tbl.rows.map(r => ({ title: this.cxPlain(r[0]), text: this.cxPlain(r[1]) }));
        you = tbl.rows.map(r => ({ title: this.cxPlain(r[0]), text: this.cxPlain(r[2]) }));
      } else {
        raw.forEach((b, k) => {
          if (b.type !== "p") return;
          const nx = raw[k + 1];
          if (!nx || nx.type !== "ul") return;
          const arr = nx.items.map(x => ({ title: "", text: this.cxFirst(x, 150) }));
          if (/non inclus|pas inclus|reste/i.test(b.text)) you = arr; else if (!yes.length) yes = arr;
        });
      }
      out.include = { title: inc.title, lead: lead(raw), yes: yes, you: you, hasYou: you.length > 0 };
      if (!yes.length) { inc._used = false; delete out.include; }
    }

    const cm = pick("commit");
    if (cm) {
      const ul = cm.raw.find(b => b.type === "ul");
      const cards = ul ? ul.items.map((x, i) => Object.assign({ first: i === 0, rest: i !== 0 }, this.cxItem(x, 150))) : [];
      if (cards.length >= 2) out.commit = { title: cm.title, lead: lead(cm.raw), cards };
      else cm._used = false;
    }

    const pr = pick("proof");
    if (pr) {
      const ul = pr.raw.find(b => b.type === "ul" && b.items.some(x => /\]\(\/preuves\//.test(x)));
      out.proof = { title: pr.title, lead: lead(pr.raw), cases: ul ? ul.items.map(x => {
        const m = x.match(/\[(.+?)\]/);
        const bits = (m ? m[1] : this.cxPlain(x)).replace(/^Étude de cas\s*/i, "").split(/\s*:\s*/);
        return { client: bits[0], sub: bits[1] || "Étude de cas", go: this.nav("realisations") };
      }) : [] };
    }

    const fq = pick("faq");
    if (fq) {
      const faqs = [];
      fq.raw.forEach(b => {
        if (b.type === "h3") faqs.push({ q: b.text.replace(/\*\*/g, ""), raw: [] });
        // FAQ rédigée en liste : « - **Question ?** Réponse »
        else if (b.type === "ul" && b.items.some(x => /^\*\*[^*]+\?\*\*/.test(x))) b.items.forEach(x => {
          const m = x.match(/^\*\*([^*]+\?)\*\*\s*(.*)$/);
          if (m) faqs.push({ q: m[1], raw: m[2] ? [{ type: "p", text: m[2] }] : [] });
          else if (faqs.length) faqs[faqs.length - 1].raw.push({ type: "p", text: x });
        });
        else if (faqs.length) faqs[faqs.length - 1].raw.push(b);
      });
      out.faq = { title: fq.title, items: faqs.map((f, j) => {
        const key = "fq-" + j; const open = this.state.cFaq === key;
        return { q: f.q, open, blocks: f.raw.map(b => this.cxBlock(b)), toggle: () => this.setState(st => ({ cFaq: st.cFaq === key ? null : key })),
          iconCss: "display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;flex:none;font:400 20px/1 var(--fb);transition:transform var(--tr),background var(--tr);background:" + (open ? "var(--acc)" : "var(--chip)") + ";color:" + (open ? "#fff" : "var(--ink2)") + ";transform:rotate(" + (open ? 45 : 0) + "deg)" };
      }) };
    }

    out.detail = secs.filter(sc => !sc._used).map((sc, j) => {
      const key = "dt-" + j; const open = this.state.cDet === key;
      return { title: sc.title, open, blocks: sc.raw.map(b => this.cxBlock(b)), toggle: () => this.setState(st => ({ cDet: st.cDet === key ? null : key })),
        iconCss: "display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;flex:none;font:400 20px/1 var(--fb);transition:transform var(--tr),background var(--tr);background:" + (open ? "var(--acc)" : "var(--chip)") + ";color:" + (open ? "#fff" : "var(--ink2)") + ";transform:rotate(" + (open ? 45 : 0) + "deg)" };
    });
    const nav = [];
    const jump = id => ev => { if (ev) ev.preventDefault(); const el = document.getElementById(id); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100); };
    if (out.problem) nav.push({ title: "Le constat", go: jump("sp-problem") });
    if (out.method) nav.push({ title: "La méthode", go: jump("sp-method") });
    if (out.include) nav.push({ title: "Le périmètre", go: jump("sp-include") });
    if (out.commit) nav.push({ title: "Nos engagements", go: jump("sp-commit") });
    if (out.proof) nav.push({ title: "Références", go: jump("sp-proof") });
    if (out.faq) nav.push({ title: "Questions", go: jump("sp-faq") });
    nav.push({ title: "Demander un devis", go: jump("cx-form") });
    return {
      spNav: nav,
      spHasProblem: !!out.problem, spProblem: out.problem || { before: {}, after: {} },
      spHasMethod: !!out.method, spMethod: out.method || {},
      spHasInclude: !!out.include, spInclude: out.include || {},
      spHasCommit: !!out.commit, spCommit: out.commit || {},
      spHasProof: !!out.proof, spProof: out.proof || {},
      spHasFaq: !!out.faq, spFaq: out.faq || {},
      spHasDetail: out.detail.length > 0, spDetail: out.detail, spH1: e.h1
    };
  }
  /**
   * La vue d'une page, comme `cxVals` la calcule pour l'écran « c ».
   * `page` : { url, h1, famille, mots, mode: "vente" | "edito", blocs, fil, liees }.
   * `blocs` est la sortie de `cxParse` sur le markdown de la page ; `fil` et
   * `liees` remplacent ce que la maquette lit dans son index.
   */
  vue(page) {
    const { url, mode, blocs: doc, fil, liees } = page;
    const e = { url, h1: page.h1, famille: page.famille, mots: page.mots };
    const kind = mode;
    const firstH2 = doc.findIndex(b => b.type === "h2");
    const introRaw = firstH2 === -1 ? doc : doc.slice(0, firstH2);
    const ps = introRaw.map((b, k) => (b.type === "p" ? k : -1)).filter(k => k >= 0);
    const leadK = ps[0], subK = ps[1];
    const introRest = introRaw.filter((b, k) => k !== leadK && !(kind === "vente" && k === subK) && !(kind === "vente" && b.type === "quote" && /04 78 33 72 05|rappel/i.test(b.text)));
    const secs = [];
    doc.slice(firstH2 === -1 ? doc.length : firstH2).forEach(b => {
      if (b.type === "h2") secs.push({ title: b.text.replace(/\*\*/g, ""), raw: [] });
      else if (secs.length) secs[secs.length - 1].raw.push(b);
    });
    const sections = secs.map((sc, i) => {
      const o = this.cxShape(this.cxSection(sc, i, kind, url), i, false);
      if (/^questions/i.test(sc.title || "")) {
        let nq = 0;
        ["head", "more"].forEach(kk => { if (!o[kk]) return; o[kk] = o[kk].map(b => {
          if (!b.isP || !b.segs || !b.segs.length || !b.segs[0].bold || !/\?\s*$/.test(b.segs[0].t)) return b;
          nq++;
          return { isFaqItem: true, q: b.segs[0].t, a: b.segs.slice(1), open: nq === 1, isP: false };
        }); });
      }
      o.hasFig = kind !== "vente" && i % 3 === 1;
      o.figCss = "position:absolute;inset:0;background:var(--ph) url('" + ["assets/web/team-electric.jpg", "assets/web/x-robotique.jpg", "assets/web/team-grind-close.jpg", "assets/web/x-mecanique-portrait.jpg", "assets/web/ph-technicien.jpg", "assets/web/team-duo.jpg"][(url.length + i) % 6] + "') center/cover no-repeat;filter:saturate(var(--sat)) contrast(1.05);opacity:var(--ph-op)";
      return o;
    });
    const toc = sections.map(sc => ({ num: sc.num, title: sc.title.length > 54 ? sc.title.slice(0, 52) + "…" : sc.title, go: "#" + sc.id }));
    const crumbs = fil.map((c, i) => ({ label: c.label, go: c.href, link: i < fil.length - 1, last: i === fil.length - 1 }));
    const famLabel = f => (CX_FAMS.find(x => x[0] === f) || [f, f])[1];
    const rel = liees.map(p => ({ h1: p.h1, fam: p.fam, go: p.href }));
    const base = { spH1: e.h1 };
    if (kind === "vente") {
      Object.assign(base, this.cxSpine(secs, e));
      // `cxSpine` pose des gestionnaires de défilement : ici, leurs ancres.
      base.spNav = base.spNav.map(n => ({ title: n.title, go: ANCRES[n.title] }));
      const rest = secs.map((sc, i) => [sc, i]).filter(([sc]) => !sc._used);
      const POOL = ["assets/web/team-electric.jpg", "assets/web/x-elec-cablage.jpg", "assets/web/team-grind-close.jpg", "assets/web/x-logistique-convoyeurs.jpg", "assets/web/ph-technicien.jpg", "assets/web/team-grind-sparks.jpg", "assets/web/x-caoutchouc-atelier.jpg", "assets/web/team-duo.jpg"];
      base.spRest = rest.map(([sc, i], k) => {
        const o = this.cxSection(sc, i, "guide", url);
        o.num = String(k + 1).padStart(2, "0");
        if (o.all[0] && o.all[0].isP) o.all[0] = Object.assign({}, o.all[0], { isP: false, isLead: true });
        o.bandCss = "scroll-margin-top:90px;padding:var(--sec) 0;" + (k % 2 === 1 ? "background:var(--card);border-top:1px solid var(--line);border-bottom:1px solid var(--line)" : "");
        this.cxShape(o, k, true);
        o.mediaCss = "position:absolute;inset:0;background:var(--ph) url('" + POOL[(url.length + k) % POOL.length] + "') center/cover no-repeat;filter:saturate(var(--sat)) contrast(1.05);opacity:var(--ph-op)";
        return o;
      });
      base.spNav = base.spRest.map(o => ({ title: o.title.length > 38 ? o.title.slice(0, 36) + "…" : o.title, go: "#" + o.id })).concat(base.spNav || []);
      base.spHasRest = base.spRest.length > 0;
    }
    return Object.assign(base, {
      cVente: kind === "vente", cEdito: kind !== "vente",
      cH1: e.h1, cFam: famLabel(e.famille), cFormat: this.cxFormat(e),
      cRead: Math.max(1, Math.round(e.mots / 220)) + " min de lecture",
      cLeadSegs: leadK !== undefined ? this.cxSegs(introRaw[leadK].text) : [],
      cHasSub: kind === "vente" && subK !== undefined, cSubSegs: subK !== undefined ? this.cxSegs(introRaw[subK].text) : [],
      cIntro: introRest.map(b => this.cxBlock(b)), cHasIntro: introRest.length > 0,
      cBgCss: "position:absolute;inset:0;background:var(--ph) url('" + (CX_IMG[e.famille] || CX_IMG.Offres) + "') center/cover no-repeat;filter:saturate(var(--sat)) contrast(1.05);opacity:var(--ph-op)",
      cCrumbs: crumbs, cSections: sections, cToc: toc, cChips: toc.slice(0, 5),
      cRelated: rel, cHasRelated: rel.length > 0
    });
  }
}

/** La vue d'une page générique de la maquette. Voir `Maquette.prototype.vue`. */
export function vueGenerique(page) {
  return new Maquette().vue(page);
}

/** Le découpage du markdown par la maquette (`cxParse`), pour l'import des fiches. */
export function blocsDuMarkdown(md) {
  return Maquette.prototype.cxParse.call(null, md);
}
