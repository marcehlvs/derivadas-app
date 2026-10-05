import { useState } from "react";
import { Heart, Trophy, Zap } from "lucide-react";
import { AnswerInput } from "../components/ui.jsx";
import { SYNTAX } from "../components/ExprExercise.jsx";
import { genDef, genChain, genTan } from "../gens.js";
import { parse, sameFn, num, near, pretty, fmt } from "../math.js";

const START_LIVES = 3;
const BEST_KEY = "derivadas-en-accion:mejor-puntaje";
const loadBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const saveBest = (v) => { try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* sin almacenamiento */ } };

/* Una pregunta por ronda; el tipo rota (definición, cadena, tangente) y la dificultad sube cada 2 rondas. */
function makeQ(n) {
  const L = Math.min(5, 1 + Math.floor(n / 2)), kind = n % 3;
  if (kind === 0) { const e = genDef(L); return { head: `f(x) = ${pretty(e.f)}`, ask: "Derivá por definición: f′(x) =", expr: true, fp: e.fp, solution: pretty(e.ans) }; }
  if (kind === 1) { const e = genChain(L); return { head: `f(x) = ${pretty(e.f)}`, ask: "Regla de la cadena: f′(x) =", expr: true, fp: e.fp, solution: pretty(e.ans) }; }
  const e = genTan([1, 2, 4, 4, 4][L - 1]);
  return { head: `f(x) = ${pretty(e.f)}`, ask: `Pendiente de la recta tangente en x₀ = ${e.x0}: m =`, expr: false, m: e.m, solution: fmt(e.m) };
}

export default function Desafio({ onSolved }) {
  const [n, setN] = useState(0);
  const [q, setQ] = useState(() => makeQ(0));
  const [val, setVal] = useState("");
  const [lives, setLives] = useState(START_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState("playing"); // playing | won | over
  const [msg, setMsg] = useState("");
  const [gained, setGained] = useState(0);

  const next = (k) => { setN(k); setQ(makeQ(k)); setVal(""); setWrong(0); setMsg(""); setPhase("playing"); };
  const restart = () => { setLives(START_LIVES); setScore(0); setStreak(0); next(0); };

  const submit = () => {
    let ok;
    if (q.expr) { try { ok = sameFn(parse(val), q.fp); } catch { setMsg("No pude leer tu respuesta. " + SYNTAX); return; } }
    else { const v = num(val); if (v === null) { setMsg("Escribí un número o una fracción (ej. −3/4)."); return; } ok = near(v, q.m); }
    if (ok) {
      const pts = Math.max(25, 100 - 25 * wrong) + 10 * streak, total = score + pts;
      setScore(total); setGained(pts); setStreak((s) => s + 1); setPhase("won"); setMsg("");
      if (total > best) { setBest(total); saveBest(total); }
      onSolved?.();
    } else {
      const left = lives - 1;
      setLives(left); setStreak(0); setWrong((w) => w + 1);
      setMsg("No es correcto. Perdés una vida: revisá y probá de nuevo.");
      if (left === 0) setPhase("over");
    }
  };

  return (
    <div>
      <div className="game-bar">
        <div className="game-bar__group">
          <span>Ronda <span className="game-bar__num">{n + 1}</span></span>
          <span>Puntos <span className="game-bar__num">{score}</span></span>
          <span>Racha <span className="game-bar__num">{streak}</span></span>
        </div>
        <div className="game-bar__group">
          <span className="hearts" aria-label={`${lives} vidas`}>
            {Array.from({ length: START_LIVES }, (_, i) => <Heart key={i} size={18} color="#E8635C" fill={i < lives ? "#E8635C" : "none"} />)}
          </span>
          <span title="Mejor puntaje"><Trophy size={15} style={{ verticalAlign: "-2px" }} /> {best}</span>
        </div>
      </div>

      {phase === "over" ? (
        <div className="game-over">
          <h3>¡Se acabaron las vidas!</h3>
          <p className="ex-prompt" style={{ margin: "0 auto 8px" }}>Llegaste a la ronda {n + 1} con <strong>{score}</strong> puntos. Tu mejor puntaje es <strong>{best}</strong>.</p>
          <p className="ex-prompt" style={{ margin: "0 auto 12px" }}>La respuesta de la última era: <strong>{q.solution}</strong></p>
          <button className="btn btn--primary" onClick={restart}>Jugar de nuevo</button>
        </div>
      ) : (
        <>
          <div className="ex-header">
            <div>
              <h3 className="ex-title"><Zap size={18} style={{ verticalAlign: "-3px" }} /> Desafío de derivadas</h3>
              <p className="ex-prompt">Resolvé cada ronda sin perder las 3 vidas. Cada error resta puntos y una vida; las rachas suman bonus.</p>
            </div>
          </div>
          <div className="eq-big">{q.head}</div>
          <div className="answer-row" onKeyDown={(e) => e.key === "Enter" && phase === "playing" && val.trim() && submit()}>
            <span className="answer-row__label" style={{ minWidth: 0 }}>{q.ask}</span>
            <AnswerInput value={val} onChange={(v) => { setVal(v); setMsg(""); }} width={90} grow={q.expr} disabled={phase !== "playing"} state={phase === "won" ? "ok" : undefined} label="respuesta" />
            {phase === "playing" && <button className="btn btn--primary" onClick={submit} disabled={!val.trim()}>¡Listo!</button>}
          </div>
          {msg && <p className="feedback feedback--bad">{msg}</p>}
          {phase === "won" && (
            <>
              <p className="feedback feedback--ok">¡Correcto! +{gained} puntos{streak > 1 ? ` (racha de ${streak})` : ""}.</p>
              <div className="ex-actions"><button className="btn btn--primary" onClick={() => next(n + 1)}>Siguiente ronda</button></div>
            </>
          )}
        </>
      )}
    </div>
  );
}
