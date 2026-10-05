/* Utilidades matemáticas: azar, formato, intérprete seguro de expresiones y comparación numérica. */
export const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = (a) => a[ri(0, a.length - 1)];
export const nz = (a, b) => { let v = 0; while (!v) v = ri(a, b); return v; };
export const co = (k) => (k === 1 ? "" : k === -1 ? "-" : String(k));

const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻" };
/** Texto "de teclado" -> texto lindo para mostrar (x^2 -> x², sqrt( -> √(, etc.). */
export const pretty = (s) =>
  s.replace(/\^(-?\d+)/g, (_, d) => [...d].map((c) => SUP[c]).join(""))
    .replace(/\*/g, "·").replace(/sqrt\(/g, "√(").replace(/ - /g, " − ").replace(/(^|[(=/])-/g, "$1−").replace(/''/g, "″").replace(/'/g, "′");

/** Polinomio desde coeficientes (de mayor a menor grado): poly([2,-3,1]) = "2x^2 - 3x + 1". */
export function poly(c) {
  const n = c.length - 1;
  let s = "";
  c.forEach((a, i) => {
    const p = n - i;
    if (!a) return;
    const abs = Math.abs(a);
    const body = p === 0 ? `${abs}` : `${abs === 1 ? "" : abs}x${p > 1 ? "^" + p : ""}`;
    s += s ? (a < 0 ? " - " : " + ") + body : (a < 0 ? "-" : "") + body;
  });
  return s || "0";
}

/** Número como entero o fracción simple. */
export function fmt(n) {
  if (Number.isInteger(n)) return String(n).replace("-", "−");
  for (let d = 2; d <= 24; d++) {
    const k = n * d;
    if (Math.abs(k - Math.round(k)) < 1e-9) return `${Math.round(k)}/${d}`.replace("-", "−");
  }
  return n.toFixed(3);
}
export const lineText = (m, b) => (m === 0 ? `y = ${fmt(b)}` : `y = ${m === 1 ? "" : m === -1 ? "−" : fmt(m)}x ${b < 0 ? "−" : "+"} ${fmt(Math.abs(b))}`.replace(/ \+ 0$| − 0$/, ""));

/* ---- Intérprete: + - * / ^, paréntesis, x, e, pi, sqrt sin cos tan ln exp, producto implícito (2x, 3(x+1)) ---- */
const FN = { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, ln: Math.log, exp: Math.exp };
export function parse(src) {
  const s = src.toLowerCase().replace(/²/g, "^2").replace(/³/g, "^3").replace(/−/g, "-").replace(/[·×]/g, "*").replace(/,/g, ".").replace(/\s+/g, "");
  if (!s) throw new Error("vacío");
  let i = 0;
  const at = (c) => s[i] === c;
  const close = () => { if (!at(")")) throw new Error("falta )"); i++; };
  const expr = () => {
    let l = term();
    while (at("+") || at("-")) { const op = s[i++], a = l, b = term(); l = op === "+" ? (x) => a(x) + b(x) : (x) => a(x) - b(x); }
    return l;
  };
  const term = () => {
    let l = unary();
    while (at("*") || at("/") || /[0-9.(a-z]/.test(s[i] ?? "")) {
      const op = at("*") || at("/") ? s[i++] : "*", a = l, b = unary();
      l = op === "*" ? (x) => a(x) * b(x) : (x) => a(x) / b(x);
    }
    return l;
  };
  const unary = () => {
    if (at("-")) { i++; const a = unary(); return (x) => -a(x); }
    if (at("+")) { i++; return unary(); }
    const a = atom();
    if (at("^")) { i++; const b = unary(); return (x) => Math.pow(a(x), b(x)); }
    return a;
  };
  const atom = () => {
    if (at("(")) { i++; const a = expr(); close(); return a; }
    const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if (m) { i += m[0].length; const v = parseFloat(m[0]); return () => v; }
    for (const n of Object.keys(FN)) {
      if (s.startsWith(n, i)) { i += n.length; if (!at("(")) throw new Error("falta ("); i++; const a = expr(); close(); const f = FN[n]; return (x) => f(a(x)); }
    }
    if (s.startsWith("pi", i)) { i += 2; return () => Math.PI; }
    if (at("e")) { i++; return () => Math.E; }
    if (at("x")) { i++; return (x) => x; }
    throw new Error("símbolo");
  };
  const f = expr();
  if (i < s.length) throw new Error("sobran símbolos");
  return f;
}

/** Valor numérico de una respuesta ("-3/4", "2.5") o null si no se entiende. */
export function num(str) {
  try { const v = parse(str)(0); return Number.isFinite(v) ? v : null; } catch { return null; }
}
export const near = (a, b) => a !== null && Math.abs(a - b) < 1e-6;

/** Dos funciones son "la misma" si coinciden en varios puntos (dominio x > 0 para que sirvan sqrt y ln). */
export const XS = [0.7, 1.1, 1.9, 2.6, 3.4, 4.3];
export function sameFn(f, g) {
  let ok = 0;
  for (const x of XS) {
    const a = f(x), b = g(x);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    if (Math.abs(a - b) > 1e-6 * (1 + Math.abs(b))) return false;
    ok++;
  }
  return ok >= 4;
}
