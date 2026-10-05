import { useState } from "react";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import FuncPlot from "../components/FuncPlot.jsx";
import { AnswerInput } from "../components/ui.jsx";
import { genTan, TAN_LEVELS } from "../gens.js";
import { num, near, pretty, lineText, fmt } from "../math.js";
import { toggleHelp } from "../helpGate";
import { useSolveOnce } from "../hooks.js";

export default function Tangente({ onSolved }) {
  const [n, setN] = useState(0);
  const level = Math.min(TAN_LEVELS, 1 + Math.floor(n / 2));
  return <Exercise key={n} level={level} onNext={() => setN((v) => v + 1)} onSolved={onSolved} />;
}

function Exercise({ level, onNext, onSolved }) {
  const [ex] = useState(() => genTan(level));
  const markSolved = useSolveOnce(onSolved);
  const [v, setV] = useState({ m: "", b: "" });
  const [res, setRes] = useState(null);
  const [dev, setDev] = useState(false);
  const solved = res?.m && res?.b;
  const set = (k) => (s) => { setV((o) => ({ ...o, [k]: s })); setRes(null); };

  const check = () => {
    const r = { m: near(num(v.m), ex.m), b: near(num(v.b), ex.b) };
    setRes(r);
    if (r.m && r.b) markSolved();
  };
  const st = (k) => (res ? (res[k] ? "ok" : "bad") : undefined);

  return (
    <div>
      <div className="ex-header">
        <div>
          <span className="level-pill">Nivel {level} de {TAN_LEVELS}</span>
          <h3 className="ex-title">Recta tangente a una curva</h3>
          <p className="ex-prompt">{pretty(ex.prompt)} Escribí la recta como y = m·x + b (podés usar fracciones, por ejemplo −3/4).</p>
        </div>
        <button className="btn btn--ghost" onClick={onNext}><RotateCcw size={14} /> otro ejercicio</button>
      </div>

      <div className="eq-big">f(x) = {pretty(ex.f)}</div>

      <div className="answer-row" onKeyDown={(e) => e.key === "Enter" && !solved && check()}>
        <span className="line-answer">
          y =
          <AnswerInput value={v.m} onChange={set("m")} width={72} state={st("m")} disabled={solved} label="pendiente m" />
          x +
          <AnswerInput value={v.b} onChange={set("b")} width={72} state={st("b")} disabled={solved} label="ordenada b" />
        </span>
        {!solved && <button className="btn btn--primary" onClick={check} disabled={!v.m.trim() || !v.b.trim()}>Verificar</button>}
      </div>

      {res && !solved && (
        <p className="feedback feedback--bad">
          {!res.m ? "La pendiente es la derivada evaluada en el punto de tangencia: m = f'(x₀)." : "La pendiente está bien. Ahora b = y₀ − m·x₀."}
        </p>
      )}
      {solved && <p className="feedback feedback--ok">¡Excelente! La tangente es <strong>{lineText(ex.m, ex.b)}</strong>, y toca la curva en ({fmt(ex.x0)}, {fmt(ex.y0)}).</p>}

      <div className="ex-actions">
        <button className="btn btn--ghost" onClick={() => toggleHelp(dev, setDev)}>
          {dev ? <EyeOff size={14} /> : <Eye size={14} />} {dev ? "ocultar desarrollo" : "ver desarrollo"}
        </button>
        {solved && <button className="btn btn--primary" onClick={onNext}>Siguiente</button>}
      </div>
      {dev && <div className="hand-calc">{ex.steps.map((s, i) => <p key={i}><span className="hc-title">{i + 1}) </span>{pretty(s)}</p>)}</div>}

      <FuncPlot
        F={ex.F} xr={[ex.x0 - 6, ex.x0 + 6]} yr={[ex.y0 - 8, ex.y0 + 8]}
        tangent={solved ? { m: ex.m, b: ex.b } : undefined}
        points={solved ? [{ x: ex.x0, y: ex.y0, label: `(${fmt(ex.x0)}, ${fmt(ex.y0)})` }] : []}
        label="Curva y recta tangente"
      />
    </div>
  );
}
