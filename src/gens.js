/* Generadores de ejercicios. Cada uno devuelve el enunciado, la derivada como función (fp) y el desarrollo. */
import { ri, pick, nz, co, poly } from "./math.js";

const pw = (u, k) => (k === 1 ? `(${u})` : `(${u})^${k}`);
const lx = (a) => `${co(a)}x`;

export const DEF_LEVELS = 5;
/** Derivada por definición: f'(x) = lim h→0 [f(x+h) − f(x)] / h */
export function genDef(L) {
  const a = nz(-4, 4), b = nz(-5, 5), c = ri(-5, 5), k = nz(-6, 6);
  if (L === 1) return { f: poly([a, b]), fp: () => a, ans: `${a}`, steps: [
    `f(x+h) − f(x) = [${a}(x+h) + (${b})] − [${a}x + (${b})] = ${a}h`,
    `Dividimos por h: [f(x+h) − f(x)] / h = ${a}`,
    `Límite con h → 0: f'(x) = ${a}` ] };
  if (L === 2) return { f: poly([a, 0, b]), fp: (x) => 2 * a * x, ans: `${2 * a}x`, steps: [
    `f(x+h) − f(x) = ${a}[(x+h)^2 − x^2] = ${a}(2xh + h^2)  (la constante se cancela)`,
    `Dividimos por h: ${a}(2x + h) = ${2 * a}x + ${a}h`,
    `Límite con h → 0: f'(x) = ${2 * a}x` ] };
  if (L === 3) return { f: poly([a, b, c]), fp: (x) => 2 * a * x + b, ans: poly([2 * a, b]), steps: [
    `f(x+h) − f(x) = ${a}(2xh + h^2) + (${b})h  (la constante se cancela)`,
    `Dividimos por h: ${a}(2x + h) + (${b}) = ${poly([2 * a, b])} + ${a}h`,
    `Límite con h → 0: f'(x) = ${poly([2 * a, b])}` ] };
  if (L === 4) return { f: poly([a, 0, b, 0]), fp: (x) => 3 * a * x * x + b, ans: poly([3 * a, 0, b]), steps: [
    `(x+h)^3 − x^3 = 3x^2h + 3xh^2 + h^3`,
    `[f(x+h) − f(x)] / h = ${a}(3x^2 + 3xh + h^2) + (${b})`,
    `Límite con h → 0: f'(x) = ${poly([3 * a, 0, b])}` ] };
  return { f: `${k}/x`, fp: (x) => -k / (x * x), ans: `${-k}/x^2`, steps: [
    `f(x+h) − f(x) = ${k}/(x+h) − ${k}/x = ${-k}h / [x(x+h)]`,
    `Dividimos por h: ${-k} / [x(x+h)]`,
    `Límite con h → 0: f'(x) = ${-k}/x^2` ] };
}

export const CHAIN_LEVELS = 5;
/** Regla de la cadena: f'(x) = g'(u) · u' */
export function genChain(L) {
  const a = nz(-3, 3), b = nz(1, 5), A = ri(1, 3), n = ri(2, 5), c = ri(0, 4), q = ri(-4, 4);
  let t; // [f, fp, ans, externa, externa', interna u, u']
  if (L === 1) { const u = poly([a, b]); t = [pw(u, n), (x) => n * a * Math.pow(a * x + b, n - 1), `${n * a}${pw(u, n - 1)}`, `u^${n}`, `${n}u^${n - 1}`, u, `${a}`]; }
  else if (L === 2) {
    const u = poly([a, b]), w = pick(["sin", "cos", "exp"]);
    t = w === "sin" ? [`sin(${u})`, (x) => a * Math.cos(a * x + b), `${a}cos(${u})`, "sen(u)", "cos(u)", u, `${a}`]
      : w === "cos" ? [`cos(${u})`, (x) => -a * Math.sin(a * x + b), `${-a}sin(${u})`, "cos(u)", "-sen(u)", u, `${a}`]
      : [`e^(${u})`, (x) => a * Math.exp(a * x + b), `${a}e^(${u})`, "e^u", "e^u", u, `${a}`];
  } else if (L === 3) {
    const u = poly([A, q, c]), du = poly([2 * A, q]), m = ri(2, 4);
    t = [pw(u, m), (x) => m * (2 * A * x + q) * Math.pow(A * x * x + q * x + c, m - 1), `${m}(${du})${pw(u, m - 1)}`, `u^${m}`, `${m}u^${m - 1}`, u, du];
  } else if (L === 4) {
    const u = poly([A, 0, b]), w = pick(["sqrt", "ln", "sin"]);
    t = w === "sqrt" ? [`sqrt(${u})`, (x) => (A * x) / Math.sqrt(A * x * x + b), `${lx(A)}/sqrt(${u})`, "√u", "1/(2√u)", u, `${2 * A}x`]
      : w === "ln" ? [`ln(${u})`, (x) => (2 * A * x) / (A * x * x + b), `${lx(2 * A)}/(${u})`, "ln(u)", "1/u", u, `${2 * A}x`]
      : [`sin(${u})`, (x) => 2 * A * x * Math.cos(A * x * x + b), `${2 * A}x*cos(${u})`, "sen(u)", "cos(u)", u, `${2 * A}x`];
  } else {
    const w = pick([0, 1, 2]);
    t = w === 0 ? [`sin(${lx(A)})^2`, (x) => 2 * A * Math.sin(A * x) * Math.cos(A * x), `${2 * A}sin(${lx(A)})cos(${lx(A)})`, "u^2", "2u", `sen(${lx(A)})`, `${A}cos(${lx(A)})`]
      : w === 1 ? [`ln(1 + e^(${lx(A)}))`, (x) => (A * Math.exp(A * x)) / (1 + Math.exp(A * x)), `${A}e^(${lx(A)})/(1 + e^(${lx(A)}))`, "ln(u)", "1/u", `1 + e^(${lx(A)})`, `${A}e^(${lx(A)})`]
      : [`e^(sin(${lx(A)}))`, (x) => A * Math.cos(A * x) * Math.exp(Math.sin(A * x)), `${A}cos(${lx(A)})e^(sin(${lx(A)}))`, "e^u", "e^u", `sen(${lx(A)})`, `${A}cos(${lx(A)})`];
  }
  const [f, fp, ans, out, dout, u, du] = t;
  return { f, fp, ans, steps: [
    `Interna: u = ${u}.  Externa: g(u) = ${out}.`,
    `Derivamos cada una: g'(u) = ${dout}  y  u' = ${du}.`,
    `Regla de la cadena: f'(x) = g'(u) · u' = ${ans}` ] };
}

export const TAN_LEVELS = 4;
/** Recta tangente: y = m·x + b con m = f'(x0) y b = y0 − m·x0 */
export function genTan(L) {
  let F, dF, x0, f, df, extra = "";
  if (L === 1) { const a = nz(-3, 3), b = ri(-4, 4), c = ri(-5, 5); x0 = ri(-3, 3); F = (x) => a * x * x + b * x + c; dF = (x) => 2 * a * x + b; f = poly([a, b, c]); df = poly([2 * a, b]); }
  else if (L === 2) { const a = nz(-2, 2), b = ri(-3, 3), c = ri(-3, 3); x0 = ri(-2, 2); F = (x) => a * x ** 3 + b * x + c; dF = (x) => 3 * a * x * x + b; f = poly([a, 0, b, c]); df = poly([3 * a, 0, b]); }
  else if (L === 3) {
    const a = nz(-2, 2), b = ri(-4, 4), c = ri(-4, 4), k2 = ri(-5, 5); x0 = ri(-3, 3);
    F = (x) => a * x * x + b * x + c; dF = (x) => 2 * a * x + b; f = poly([a, b, c]); df = poly([2 * a, b]);
    extra = `y = ${poly([dF(x0), k2])}`;
  } else if (pick([0, 1])) { x0 = pick([1, 4, 9]); F = Math.sqrt; dF = (x) => 1 / (2 * Math.sqrt(x)); f = "sqrt(x)"; df = "1/(2sqrt(x))"; }
  else { const k = pick([2, 4, 6, -2, -4]); x0 = pick([1, 2, -1, -2]); F = (x) => k / x; dF = (x) => -k / (x * x); f = `${k}/x`; df = `${-k}/x^2`; }
  const y0 = F(x0), m = dF(x0), b = y0 - m * x0;
  const prompt = L === 3 ? `Hallá la recta tangente a la curva que es paralela a  ${extra}.` : `Hallá la recta tangente a la curva en el punto de abscisa x₀ = ${x0}.`;
  const steps = L === 3 ? [
    `Dos rectas son paralelas si tienen la misma pendiente: m = ${dF(x0)}.`,
    `f'(x) = ${df}. Igualamos f'(x₀) = ${dF(x0)} y despejamos: x₀ = ${x0}.`,
    `y₀ = f(${x0}) = ${y0}.  Entonces b = y₀ − m·x₀ = ${b}.`,
  ] : [
    `f'(x) = ${df}`,
    `m = f'(${x0}) = ${m}`,
    `y₀ = f(${x0}) = ${y0}.  Recta: y − y₀ = m(x − x₀) → b = y₀ − m·x₀ = ${b}.`,
  ];
  return { f, F, dF, x0, y0, m, b, prompt, steps, level: L };
}

/** Estudio de función: cúbica con extremos enteros. f' = 3a(x−p)(x−q), p y q de igual paridad. */
export function genStudy() {
  const a = pick([1, -1, 2, -2]), p = ri(-3, 1), q = p + 2 * ri(1, 2), d = ri(-3, 3), s = p + q;
  const B = (-3 * a * s) / 2, C = 3 * a * p * q;
  const F = (x) => a * x ** 3 + B * x * x + C * x + d;
  return {
    a, p, q, s, F, f: poly([a, B, C, d]), dF: (x) => 3 * a * x * x - 3 * a * s * x + C, d2F: (x) => 6 * a * x - 3 * a * s,
    dText: poly([3 * a, -3 * a * s, C]), d2Text: poly([6 * a, -3 * a * s]),
    xMax: a > 0 ? p : q, xMin: a > 0 ? q : p, xInf: s / 2,
  };
}

/** Estudio de función racional: f = a·(x² + c)/(x − h) = a·(x + h) + a·s²/(x − h), con c = s² − h². Extremos en h ± s. */
export function genRational() {
  const a = pick([1, -1]), h = ri(-2, 2), s = ri(1, 3), c = s * s - h * h;
  const F = (x) => (a * (x * x + c)) / (x - h);
  const den = poly([1, -h]);
  return {
    a, h, s, F, den,
    f: `(${poly([a, 0, a * c])})/(${den})`,
    dF: (x) => (a * (x * x - 2 * h * x - c)) / ((x - h) * (x - h)),
    d2F: (x) => (2 * a * s * s) / Math.pow(x - h, 3),
    dText: `(${poly([a, -2 * a * h, -a * c])})/(${den})^2`,
    d2Text: `${2 * a * s * s}/(${den})^3`,
    xMax: a > 0 ? h - s : h + s, xMin: a > 0 ? h + s : h - s,
  };
}
