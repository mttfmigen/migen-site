const { useRef, useEffect, useState } = React;

const AGENCES = [
  { n: "Lyon — Écully", a: "129 ch. du Moulin Carron, 69130", lon: 4.78, lat: 45.76, big: true },
  { n: "Paris", a: "Essonne · Île-de-France", lon: 2.35, lat: 48.85 },
  { n: "Strasbourg", a: "Bas-Rhin · Grand Est", lon: 7.75, lat: 48.58 },
  { n: "Nantes", a: "Loire-Atlantique", lon: -1.55, lat: 47.22 },
  { n: "Toulouse", a: "Haute-Garonne", lon: 1.44, lat: 43.6 }
];

const W = 420, H = 460;

function MigenAgences() {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const [pts, setPts] = useState([]);

  useEffect(() => {
    let dead = false;
    const bbox = {
      type: "Polygon",
      coordinates: [[[-5.4, 41.2], [-5.4, 51.3], [9.9, 51.3], [9.9, 41.2], [-5.4, 41.2]]]
    };
    const proj = d3.geoMercator().fitExtent([[26, 22], [W - 26, H - 22]], bbox);
    setPts(AGENCES.map(h => { const p = proj([h.lon, h.lat]); return { ...h, x: p[0], y: p[1] }; }));

    d3.json((window.__resources && window.__resources.worldAtlas) || "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json").then(topo => {
      if (dead || !ref.current) return;
      const feats = topojson.feature(topo, topo.objects.countries).features;
      const fr = feats.find(f => f.properties && f.properties.name === "France");
      const path = d3.geoPath(proj);
      const svg = d3.select(ref.current).select("#frLand");
      svg.selectAll("path.nb").data(feats.filter(f => f !== fr)).enter().append("path")
        .attr("class", "nb").attr("d", path)
        .attr("fill", "var(--chip)").attr("stroke", "var(--line)").attr("stroke-width", 1);
      if (fr) {
        svg.append("path").attr("d", path(fr))
          .attr("fill", "url(#frFill)")
          .attr("stroke", "var(--ink4)").attr("stroke-width", 1.2)
          .attr("vector-effect", "non-scaling-stroke");
      }
    }).catch(() => {});
    return () => { dead = true; };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
        <defs>
          <clipPath id="frClip"><rect x="0" y="0" width={W} height={H} /></clipPath>
          <linearGradient id="frFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--map-a)" />
            <stop offset="100%" stopColor="var(--map-b)" />
          </linearGradient>
        </defs>
        <g id="frLand" clipPath="url(#frClip)"></g>
        {pts.map(p => (
          <g key={p.n} onMouseEnter={() => setHover(p.n)} onMouseLeave={() => setHover(null)} style={{ cursor: "default" }}>
            <circle cx={p.x} cy={p.y} r={p.big ? 17 : 13} fill="var(--acc)" opacity={hover === p.n ? 0.18 : 0.1} />
            <circle cx={p.x} cy={p.y} r={p.big ? 6.5 : 4.5} fill="var(--acc)" stroke="var(--card)" strokeWidth="2" />
            <text x={p.x + (p.lon > 5 ? -12 : 13)} y={p.y + 4}
              textAnchor={p.lon > 5 ? "end" : "start"}
              style={{
                font: "600 12px var(--ft)", fill: hover === p.n ? "var(--ink)" : "var(--ink2)",
                letterSpacing: "-.01em", pointerEvents: "none"
              }}>{p.n.replace(" — Écully", "").replace("Siège — ", "")}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

module.exports = { MigenAgences };
