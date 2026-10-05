import { useState } from "react";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import FuncPlot from "../components/FuncPlot.jsx";
import { AnswerInput } from "../components/ui.jsx";
import { genStudy } from "../gens.js";
import { parse, sameFn, num, near, pretty, fmt } from "../math.js";
import { toggleHelp } from "../helpGate";
import { useSolveOnce } from "../hooks.js";
import EstudioRacional from "./EstudioRacional.jsx";

export default function Estudio({ onSolved }) {
  const [n, setN] = useState(0);
  const [mode, setMode] = useState("poli");
  const next = () => setN((v) => v + 1);
  return (
    <div>
      <div className="seg">
        <button className={`seg__btn ${mode === "poli" ? "seg__btn--active" : ""}`} onClick={() => setMode("poli")}>Polinómica</button>
        <button className={`seg__btn ${mode === "racional" ? "seg__btn--active" : ""}`} onClick={() => setMode("racional")}>Racional</button>
      </div>
      {mode === "poli" ? <Study key={n} onNext={next} onSolved={onSolved} /> : <EstudioRacional key={n} onNext={next} onSolved={onSolved} />}
    </div>
  );
}

const sg = (v) => (v > 0 ? "positiva (+)" : "negativa (−)");

function Dev({ ex }) {
  const { a, p, q, xInf } = ex;
  const outer = a > 0 ? "+" : "−", mid = a > 0 ? "−" : "+";
  return (
    <div className="hand-calc">
      <p className="hc-title">1) Primera derivada</p>
      <p>f′(x) = {pretty(ex.dText)} = {3 * a}(x − {p < 0 ? `(${p})` : p})(x − {q < 0 ? `(${q})` : q}). Puntos críticos: f′(x) = 0 → x = {p} y x = {q}.</p>
      <p>Signo de f': {outer} en (−∞, {p}), {mid} en ({p}, {q}), {outer} en ({q}, +∞).</p>
      <p>{a > 0 ? `f crece, decrece y vuelve a crecer` : `f decrece, crece y vuelve a decrecer`}. En x = {ex.xMax} f' pasa de + a − → <strong>máximo</strong>; en x = {ex.xMin} pasa de − a + → <strong>mínimo</strong>.</p>
      <p>Valores: f({ex.xMax}) = {fmt(ex.F(ex.xMax))} (máximo), f({ex.xMin}) = {fmt(ex.F(ex.xMin))} (mínimo).</p>
      <p className="hc-title">2) Segunda derivada</p>
      <p>f″(x) = {pretty(ex.d2Text)}. Criterio: f″({p}) = {ex.d2F(p)} ({sg(ex.d2F(p))}) y f″({q}) = {ex.d2F(q)} ({sg(ex.d2F(q))}) — coincide con el máximo/mínimo de arriba.</p>
      <p>f″(x) = 0 → x = {xInf}. A un lado f″ es {a > 0 ? "negativa" : "positiva"} (cóncava {a > 0 ? "hacia abajo" : "hacia arriba"}) y al otro cambia → <strong>punto de inflexión</strong> en ({xInf}, {fmt(ex.F(xInf))}).</p>
    </div>
  );
}

function Study({ onNext, onSolved }) {
  const [ex] = useState(genStudy);
  const markSolved = useSolveOnce(onSolved);
  const [v, setV] = useState({ fp: "", crit: "", mx: "", my: "", nx: "", ny: "", fpp: "", ix: "", iy: "" });
  const [res, setRes] = useState(null);
  const [dev, setDev] = useState(false);
  const solved = res && Object.values(res).every(Boolean);
  const set = (k) => (s) => { setV((o) => ({ ...o, [k]: s })); setRes(null); };
  const st = (k) => (res ? (res[k] ? "ok" : "bad") : undefined);

  const check = () => {
    const expr = (s, g) => { try { return sameFn(parse(s), g); } catch { return false; } };
    const cs = v.crit.split(/[;,\s]+/).filter(Boolean).map(num).sort((a, b) => a - b);
    const r = {
      fp: expr(v.fp, ex.dF),
      crit: cs.length === 2 && near(cs[0], ex.p) && near(cs[1], ex.q),
      mx: near(num(v.mx), ex.xMax), my: near(num(v.my), ex.F(ex.xMax)),
      nx: near(num(v.nx), ex.xMin), ny: near(num(v.ny), ex.F(ex.xMin)),
      fpp: expr(v.fpp, ex.d2F),
      ix: near(num(v.ix), ex.xInf), iy: near(num(v.iy), ex.F(ex.xInf)),
    };
    setRes(r);
    if (Object.values(r).every(Boolean)) markSolved();
  };
  const A = (k, w = 70, label = k) => <AnswerInput value={v[k]} onChange={set(k)} width={w} state={st(k)} disabled={solved} label={label} grow={w >= 200} />;

  return (
    <div onKeyDown={(e) => e.key === "Enter" && !solved && check()}>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">Estudio completo de una función</h3>
          <p className="ex-prompt">Con la primera derivada hallá los puntos críticos y los extremos; con la segunda, la concavidad y el punto de inflexión. Dom f = ℝ.</p>
        </div>
        <button className="btn btn--ghost" onClick={onNext}><RotateCcw size={14} /> otra función</button>
      </div>
      <div className="eq-big">f(x) = {pretty(ex.f)}</div>

      <h4 className="section-title">Paso 1 · Primera derivada y puntos críticos</h4>
      <div className="answer-row"><span className="answer-row__label" style={{ minWidth: 0 }}>f′(x) =</span>{A("fp", 220, "primera derivada")}</div>
      <div className="answer-row"><span className="answer-row__label" style={{ minWidth: 0 }}>f′(x) = 0 en x =</span>{A("crit", 110, "puntos críticos")}<span className="ans-suffix">(separalos con coma)</span></div>

      <h4 className="section-title">Paso 2 · Máximo y mínimo local (criterio de la 1ª derivada)</h4>
      <div className="grid-fields">
        <div className="answer-row">Máximo: x = {A("mx", 56, "x del máximo")} y = {A("my", 56, "y del máximo")}</div>
        <div className="answer-row">Mínimo: x = {A("nx", 56, "x del mínimo")} y = {A("ny", 56, "y del mínimo")}</div>
      </div>

      <h4 className="section-title">Paso 3 · Segunda derivada e inflexión</h4>
      <div className="answer-row"><span className="answer-row__label" style={{ minWidth: 0 }}>f″(x) =</span>{A("fpp", 200, "segunda derivada")}</div>
      <div className="answer-row">Punto de inflexión: x = {A("ix", 56, "x de inflexión")} y = {A("iy", 56, "y de inflexión")}</div>

      {!solved && <div className="ex-actions"><button className="btn btn--primary" onClick={check}>Verificar todo</button></div>}
      {res && !solved && <p className="feedback feedback--bad">Hay campos con error (marcados en rojo). Recordá: en un máximo f″ &lt; 0 y en un mínimo f″ &gt; 0.</p>}
      {solved && <p className="feedback feedback--ok">¡Estudio completo! Máximo en ({ex.xMax}, {fmt(ex.F(ex.xMax))}), mínimo en ({ex.xMin}, {fmt(ex.F(ex.xMin))}) e inflexión en ({ex.xInf}, {fmt(ex.F(ex.xInf))}).</p>}

      <div className="ex-actions">
        <button className="btn btn--ghost" onClick={() => toggleHelp(dev, setDev)}>
          {dev ? <EyeOff size={14} /> : <Eye size={14} />} {dev ? "ocultar desarrollo" : "ver desarrollo"}
        </button>
        {solved && <button className="btn btn--primary" onClick={onNext}>Siguiente</button>}
      </div>
      {dev && <Dev ex={ex} />}

      {solved && (
        <FuncPlot F={ex.F} xr={[ex.p - 3, ex.q + 3]} label="Gráfico con extremos e inflexión" points={[
          { x: ex.xMax, y: ex.F(ex.xMax), label: "máx", color: "#3E7A70" },
          { x: ex.xMin, y: ex.F(ex.xMin), label: "mín", color: "#B14E4E" },
          { x: ex.xInf, y: ex.F(ex.xInf), label: "inflexión", color: "#F29E4C" },
        ]} />
      )}
    </div>
  );
}
