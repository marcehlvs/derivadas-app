import { useState } from "react";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import FuncPlot from "../components/FuncPlot.jsx";
import { AnswerInput } from "../components/ui.jsx";
import { genRational } from "../gens.js";
import { parse, sameFn, num, near, pretty, fmt, lineText } from "../math.js";
import { toggleHelp } from "../helpGate";
import { useSolveOnce } from "../hooks.js";

function Dev({ ex }) {
  const { a, h, s } = ex;
  const w = (v) => (v < 0 ? `(${v})` : v);
  return (
    <div className="hand-calc">
      <p className="hc-title">1) Dominio y asíntotas</p>
      <p>El denominador se anula en x = {h}: Dom f = ℝ − {"{"}{h}{"}"}. Como el numerador no se anula ahí, hay <strong>asíntota vertical x = {h}</strong>.</p>
      <p>Dividiendo: f(x) = {a === 1 ? "" : "−"}(x + {w(h)}) + {a * s * s}/(x − {w(h)}). El resto tiende a 0 en el infinito → <strong>asíntota oblicua {pretty(lineText(a, a * h))}</strong>.</p>
      <p className="hc-title">2) Primera derivada</p>
      <p>f′(x) = {pretty(ex.dText)}. El denominador es siempre positivo, así que f′(x) = 0 cuando el numerador es 0: x = {h - s} y x = {h + s}.</p>
      <p>Signo de f' = signo de {a === 1 ? "" : "−"}(x − {w(h - s)})(x − {w(h + s)}), sin contar x = {h} (no está en el dominio).</p>
      <p>En x = {ex.xMax} f' pasa de + a − → <strong>máximo</strong>, f = {fmt(ex.F(ex.xMax))}. En x = {ex.xMin} pasa de − a + → <strong>mínimo</strong>, f = {fmt(ex.F(ex.xMin))}.</p>
      <p className="hc-title">3) Segunda derivada</p>
      <p>f″(x) = {pretty(ex.d2Text)}. Nunca es 0 (el numerador es constante) → <strong>no hay punto de inflexión</strong>. Cambia de signo en x = {h}, pero ese valor no pertenece al dominio.</p>
      <p>Criterio: f″({ex.xMax}) = {fmt(ex.d2F(ex.xMax))} {ex.d2F(ex.xMax) < 0 ? "< 0 → máximo" : "> 0 → mínimo"}; f″({ex.xMin}) = {fmt(ex.d2F(ex.xMin))} {ex.d2F(ex.xMin) < 0 ? "< 0 → máximo" : "> 0 → mínimo"}.</p>
    </div>
  );
}

export default function EstudioRacional({ onNext, onSolved }) {
  const [ex] = useState(genRational);
  const markSolved = useSolveOnce(onSolved);
  const [v, setV] = useState({ va: "", om: "", ob: "", fp: "", crit: "", mx: "", my: "", nx: "", ny: "", fpp: "", inf: "" });
  const [res, setRes] = useState(null);
  const [dev, setDev] = useState(false);
  const solved = res && Object.values(res).every(Boolean);
  const set = (k) => (s) => { setV((o) => ({ ...o, [k]: s })); setRes(null); };
  const st = (k) => (res ? (res[k] ? "ok" : "bad") : undefined);

  const check = () => {
    const expr = (s, g) => { try { return sameFn(parse(s), g); } catch { return false; } };
    const cs = v.crit.split(/[;,\s]+/).filter(Boolean).map(num).sort((a, b) => a - b);
    const r = {
      va: near(num(v.va), ex.h), om: near(num(v.om), ex.a), ob: near(num(v.ob), ex.a * ex.h),
      fp: expr(v.fp, ex.dF),
      crit: cs.length === 2 && near(cs[0], ex.h - ex.s) && near(cs[1], ex.h + ex.s),
      mx: near(num(v.mx), ex.xMax), my: near(num(v.my), ex.F(ex.xMax)),
      nx: near(num(v.nx), ex.xMin), ny: near(num(v.ny), ex.F(ex.xMin)),
      fpp: expr(v.fpp, ex.d2F),
      inf: /^(no|ninguno|no hay)$/.test(v.inf.trim().toLowerCase()),
    };
    setRes(r);
    if (Object.values(r).every(Boolean)) markSolved();
  };
  const A = (k, w = 70, label = k) => <AnswerInput value={v[k]} onChange={set(k)} width={w} state={st(k)} disabled={solved} label={label} grow={w >= 200} />;
  const lo = Math.min(ex.F(ex.xMax), ex.F(ex.xMin)), hi = Math.max(ex.F(ex.xMax), ex.F(ex.xMin)), pad = (hi - lo) * 0.8 + 2;

  return (
    <div onKeyDown={(e) => e.key === "Enter" && !solved && check()}>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">Estudio de una función racional</h3>
          <p className="ex-prompt">Hallá dominio y asíntotas, y con la 1ª y 2ª derivada los extremos y la concavidad.</p>
        </div>
        <button className="btn btn--ghost" onClick={onNext}><RotateCcw size={14} /> otra función</button>
      </div>
      <div className="eq-big">f(x) = {pretty(ex.f)}</div>

      <h4 className="section-title">Paso 1 · Dominio y asíntotas</h4>
      <div className="answer-row">Dom f = ℝ − {"{"}a{"}"}, con asíntota vertical x = {A("va", 56, "asíntota vertical")}</div>
      <div className="answer-row">Asíntota oblicua: y = {A("om", 56, "pendiente de la asíntota")} x + {A("ob", 56, "ordenada de la asíntota")}</div>

      <h4 className="section-title">Paso 2 · Primera derivada y extremos</h4>
      <div className="answer-row"><span className="answer-row__label" style={{ minWidth: 0 }}>f′(x) =</span>{A("fp", 240, "primera derivada")}</div>
      <div className="answer-row"><span className="answer-row__label" style={{ minWidth: 0 }}>f′(x) = 0 en x =</span>{A("crit", 110, "puntos críticos")}<span className="ans-suffix">(separalos con coma)</span></div>
      <div className="grid-fields">
        <div className="answer-row">Máximo: x = {A("mx", 56, "x del máximo")} y = {A("my", 56, "y del máximo")}</div>
        <div className="answer-row">Mínimo: x = {A("nx", 56, "x del mínimo")} y = {A("ny", 56, "y del mínimo")}</div>
      </div>

      <h4 className="section-title">Paso 3 · Segunda derivada</h4>
      <div className="answer-row"><span className="answer-row__label" style={{ minWidth: 0 }}>f″(x) =</span>{A("fpp", 200, "segunda derivada")}</div>
      <div className="answer-row">Punto de inflexión en x = {A("inf", 70, "inflexión")}<span className="ans-suffix">(un número, o escribí "no" si no hay)</span></div>

      {!solved && <div className="ex-actions"><button className="btn btn--primary" onClick={check}>Verificar todo</button></div>}
      {res && !solved && <p className="feedback feedback--bad">Hay campos con error (marcados en rojo). Pista: el denominador de f' es un cuadrado, así que su signo no cambia.</p>}
      {solved && <p className="feedback feedback--ok">¡Estudio completo! Máximo en ({ex.xMax}, {fmt(ex.F(ex.xMax))}), mínimo en ({ex.xMin}, {fmt(ex.F(ex.xMin))}), sin inflexión.</p>}

      <div className="ex-actions">
        <button className="btn btn--ghost" onClick={() => toggleHelp(dev, setDev)}>
          {dev ? <EyeOff size={14} /> : <Eye size={14} />} {dev ? "ocultar desarrollo" : "ver desarrollo"}
        </button>
        {solved && <button className="btn btn--primary" onClick={onNext}>Siguiente</button>}
      </div>
      {dev && <Dev ex={ex} />}

      {solved && (
        <FuncPlot F={ex.F} xr={[ex.h - ex.s - 3, ex.h + ex.s + 3]} yr={[lo - pad, hi + pad]} vline={ex.h} tangent={{ m: ex.a, b: ex.a * ex.h }} label="Gráfico con asíntotas y extremos" points={[
          { x: ex.xMax, y: ex.F(ex.xMax), label: "máx", color: "#4E55A8" },
          { x: ex.xMin, y: ex.F(ex.xMin), label: "mín", color: "#B14E4E" },
        ]} />
      )}
    </div>
  );
}
