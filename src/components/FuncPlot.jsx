/* Gráfico de una función F(x) con recta tangente y puntos opcionales. */
export default function FuncPlot({ F, xr, yr, tangent, vline, points = [], label = "Gráfico de la función" }) {
  const W = 460, H = 320, P = 24;
  const ys = yr ?? (() => {
    const v = [];
    for (let i = 0; i <= 120; i++) { const y = F(xr[0] + ((xr[1] - xr[0]) * i) / 120); if (Number.isFinite(y)) v.push(y); }
    const lo = Math.min(...v), hi = Math.max(...v), pd = (hi - lo) * 0.15 || 1;
    return [lo - pd, hi + pd];
  })();
  const sx = (x) => P + ((x - xr[0]) / (xr[1] - xr[0])) * (W - 2 * P);
  const sy = (y) => H - P - ((y - ys[0]) / (ys[1] - ys[0])) * (H - 2 * P);
  const path = (g) => {
    let d = "", pen = false;
    for (let i = 0; i <= 240; i++) {
      const x = xr[0] + ((xr[1] - xr[0]) * i) / 240, y = g(x), span = ys[1] - ys[0];
      if (!Number.isFinite(y) || y < ys[0] - span || y > ys[1] + span) { pen = false; continue; }
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  const ticks = (a, b) => { const st = Math.max(1, Math.ceil((b - a) / 10)), out = []; for (let t = Math.ceil(a / st) * st; t <= b; t += st) out.push(t); return out; };
  return (
    <div className="plano-wrap">
      <svg className="plano" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks(xr[0], xr[1]).map((t) => <line key={`x${t}`} x1={sx(t)} x2={sx(t)} y1={P / 2} y2={H - P / 2} stroke="#EDE6D2" />)}
        {ticks(ys[0], ys[1]).map((t) => <line key={`y${t}`} y1={sy(t)} y2={sy(t)} x1={P / 2} x2={W - P / 2} stroke="#EDE6D2" />)}
        {ys[0] < 0 && ys[1] > 0 && <line x1={P / 2} x2={W - P / 2} y1={sy(0)} y2={sy(0)} stroke="#8A8065" strokeWidth="1.3" />}
        {xr[0] < 0 && xr[1] > 0 && <line y1={P / 2} y2={H - P / 2} x1={sx(0)} x2={sx(0)} stroke="#8A8065" strokeWidth="1.3" />}
        <path d={path(F)} fill="none" stroke="#4E55A8" strokeWidth="2.6" />
        {tangent && <path d={path((x) => tangent.m * x + tangent.b)} fill="none" stroke="#F29E4C" strokeWidth="2.2" strokeDasharray="6 4" />}
        {vline !== undefined && <line x1={sx(vline)} x2={sx(vline)} y1={P / 2} y2={H - P / 2} stroke="#B14E4E" strokeWidth="1.8" strokeDasharray="2 5" />}
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r="5.5" fill={p.color ?? "#B14E4E"} stroke="#fff" strokeWidth="1.5" />
            <text x={sx(p.x) + 8} y={sy(p.y) - 8} fontSize="11.5" fontWeight="700" fill="#26233F">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
