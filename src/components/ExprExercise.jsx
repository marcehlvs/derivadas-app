import { useState } from "react";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import { AnswerInput } from "./ui.jsx";
import { parse, sameFn, pretty } from "../math.js";
import { toggleHelp } from "../helpGate";
import { useSolveOnce } from "../hooks.js";

export const SYNTAX = "Revisá que los paréntesis estén cerrados y que no falte ningún signo.";

/* Ejercicio "derivá esta función". La dificultad sube sola cada dos ejercicios. */
export default function ExprExercise({ title, prompt, formula, gen, maxLevel, onSolved }) {
  const [n, setN] = useState(0);
  const level = Math.min(maxLevel, 1 + Math.floor(n / 2));
  return <Exercise key={n} {...{ title, prompt, formula, gen, level, maxLevel, onSolved }} onNext={() => setN((v) => v + 1)} />;
}

function Exercise({ title, prompt, formula, gen, level, maxLevel, onSolved, onNext }) {
  const [ex] = useState(() => gen(level));
  const markSolved = useSolveOnce(onSolved);
  const [val, setVal] = useState("");
  const [state, setState] = useState();
  const [msg, setMsg] = useState("");
  const [dev, setDev] = useState(false);

  const check = () => {
    let g;
    try { g = parse(val); } catch { setState("bad"); setMsg("No pude leer tu respuesta. " + SYNTAX); return; }
    if (sameFn(g, ex.fp)) { setState("ok"); setMsg(""); markSolved(); }
    else { setState("bad"); setMsg("Todavía no coincide. Revisá los signos, los coeficientes y los exponentes."); }
  };

  return (
    <div>
      <div className="ex-header">
        <div>
          <span className="level-pill">Nivel {level} de {maxLevel}</span>
          <h3 className="ex-title">{title}</h3>
          <p className="ex-prompt">{prompt}</p>
        </div>
        <button className="btn btn--ghost" onClick={onNext}><RotateCcw size={14} /> otro ejercicio</button>
      </div>
      {formula}

      <div className="eq-big">f(x) = {pretty(ex.f)}</div>

      <div className="answer-row" onKeyDown={(e) => e.key === "Enter" && state !== "ok" && check()}>
        <span className="answer-row__label" style={{ minWidth: 0 }}>f′(x) =</span>
        <AnswerInput value={val} onChange={(v) => { setVal(v); setState(undefined); setMsg(""); }} grow state={state} disabled={state === "ok"} label="derivada" />
        {state !== "ok" && <button className="btn btn--primary" onClick={check} disabled={!val.trim()}>Verificar</button>}
      </div>

      {msg && <p className="feedback feedback--bad">{msg}</p>}
      {state === "ok" && <p className="feedback feedback--ok">¡Muy bien! f′(x) = {pretty(ex.ans)}</p>}

      <div className="ex-actions">
        <button className="btn btn--ghost" onClick={() => toggleHelp(dev, setDev)}>
          {dev ? <EyeOff size={14} /> : <Eye size={14} />} {dev ? "ocultar desarrollo" : "ver desarrollo"}
        </button>
        {state === "ok" && <button className="btn btn--primary" onClick={onNext}>Siguiente</button>}
      </div>
      {dev && <div className="hand-calc">{ex.steps.map((s, i) => <p key={i}><span className="hc-title">{i + 1}) </span>{pretty(s)}</p>)}</div>}
    </div>
  );
}
