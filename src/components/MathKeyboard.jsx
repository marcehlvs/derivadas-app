import { useEffect, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { getSnapshot, hide, press, subscribe, toggleNative } from "../keypad.js";

const d = (n) => ({ l: n, s: n });
const ROWS = [
  [d("7"), d("8"), d("9"), { l: "÷", a: "frac", c: "op", aria: "dividido: arma una fracción" }, { l: "(", s: "(", c: "op" }, { l: ")", s: ")", c: "op" }],
  [d("4"), d("5"), d("6"), { l: "·", s: "*", c: "op", aria: "por" }, { l: "x", s: "x", c: "var" }, { l: "xⁿ", a: "sup", c: "op", aria: "elevado a" }],
  [d("1"), d("2"), d("3"), { l: "−", s: "-", c: "op", aria: "menos" }, { l: "x²", a: "sq", c: "var", aria: "x al cuadrado" }, { l: "√", a: "sqrt", c: "fn", aria: "raíz cuadrada" }],
  [d("0"), { l: ".", s: "." }, { l: ",", s: ",", aria: "coma" }, { l: "+", s: "+", c: "op", aria: "más" }, { l: "◀", a: "left", aria: "mover a la izquierda" }, { l: "▶", a: "right", aria: "mover a la derecha" }],
  [{ l: "sin", s: "sin()", back: 1, c: "fn" }, { l: "cos", s: "cos()", back: 1, c: "fn" }, { l: "ln", s: "ln()", back: 1, c: "fn" }, { l: "eˣ", a: "exp", c: "fn", aria: "e elevado a" }, { l: "⌫", a: "bksp", c: "act", aria: "borrar" }, { l: "✓", a: "enter", c: "go", aria: "verificar" }],
];

/* Teclado en pantalla: se monta una sola vez en App y escribe en el campo AnswerInput que tenga el foco. */
export default function MathKeyboard() {
  const { visible, native } = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    document.body.classList.toggle("kb-open", visible);
    document.body.classList.toggle("kb-native", visible && native);
    return () => document.body.classList.remove("kb-open", "kb-native");
  }, [visible, native]);

  if (!visible) return null;
  return (
    <div className="kb" role="group" aria-label="Teclado matemático" onMouseDown={(e) => e.preventDefault()}>
      <div className="kb__bar">
        <span>Teclado matemático</span>
        <span className="kb__bar-actions">
          <button type="button" className="kb__chip" onClick={toggleNative}>{native ? "123 · matemático" : "ABC · del celular"}</button>
          <button type="button" className="kb__chip" onClick={hide} aria-label="ocultar teclado"><ChevronDown size={14} /></button>
        </span>
      </div>
      {!native && ROWS.map((row, i) => (
        <div className="kb__row" key={i}>
          {row.map((k) => (
            <button key={k.l} type="button" className={`kb__key ${k.c ? `kb__key--${k.c}` : ""}`} aria-label={k.aria} onClick={() => press(k)}>
              {k.l}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
