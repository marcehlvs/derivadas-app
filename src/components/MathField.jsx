import { useRef, useState } from "react";
import { applyKey, emptyState, fromString, ser, typedKey } from "../mathEditor.js";
import { activate, deactivateSoon } from "../keypad.js";

const SHOW = { "*": "·", "-": "−" };

/* Campo de escritura matemática: ÷ arma una fracción (numerador arriba, denominador abajo), ^ / xⁿ un exponente, √ una raíz.
   Por dentro es un árbol (ver mathEditor.js); hacia afuera sigue siendo un string que entiende parse(): "(1)/(x)", "x^(2)".
   Un <input> invisible recibe el teclado del celular o de la compu; el teclado en pantalla escribe vía apply(). */
export default function MathField({ value, onChange, native, disabled, label, className = "", style }) {
  const [st, setSt] = useState(() => (value ? fromString(value) : emptyState()));
  const [focus, setFocus] = useState(false);
  const stRef = useRef(st);
  const cbRef = useRef(onChange);
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  // Valor cambiado desde afuera (por ejemplo, al limpiar para otro ejercicio): se reinicia el árbol.
  if (value !== ser(st.tree)) setSt(fromString(value));
  stRef.current = st; // eslint-disable-line react-hooks/refs -- espejo del último estado para los handlers
  cbRef.current = onChange; // eslint-disable-line react-hooks/refs

  const apply = useRef((key) => {
    const next = applyKey(stRef.current, key);
    stRef.current = next;
    setSt(next);
    cbRef.current(ser(next.tree));
  }).current;

  const setCursor = (path, pos) => {
    const next = { tree: stRef.current.tree, cur: { path, pos } };
    stRef.current = next;
    setSt(next);
    inputRef.current?.focus({ preventScroll: true });
  };

  const { tree, cur } = st;
  const same = (path) => path.length === cur.path.length && path.every((s, j) => s.i === cur.path[j].i && s.k === cur.path[j].k);

  const renderList = (list, path) => {
    const here = focus && same(path);
    const out = [];
    list.forEach((n, i) => {
      if (here && cur.pos === i) out.push(<span key={`c${i}`} className="mf-caret" />);
      if (typeof n === "string") {
        out.push(
          <span key={i} className="mf-ch" onMouseDown={(e) => {
            e.preventDefault(); e.stopPropagation();
            const r = e.currentTarget.getBoundingClientRect();
            setCursor(path, e.clientX < r.left + r.width / 2 ? i : i + 1);
          }}>{SHOW[n] ?? n}</span>,
        );
        return;
      }
      const slot = (k) => {
        const p = [...path, { i, k }];
        const inner = renderList(n[k], p);
        return (
          <span className="mf-slot" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCursor(p, n[k].length); }}>
            {inner}{n[k].length === 0 && <span className="mf-ph" />}
          </span>
        );
      };
      if (n.t === "frac") out.push(<span key={i} className="mf-frac"><span className="mf-num">{slot("a")}</span><span className="mf-den">{slot("b")}</span></span>);
      else if (n.t === "sup") out.push(<span key={i} className="mf-sup">{slot("a")}</span>);
      else out.push(<span key={i} className="mf-sqrt">√<span className="mf-rad">{slot("a")}</span></span>);
    });
    if (here && cur.pos === list.length) out.push(<span key="cend" className="mf-caret" />);
    return out;
  };

  return (
    <span
      ref={boxRef}
      className={`mf ${focus ? "mf--focus" : ""} ${disabled ? "mf--disabled" : ""} ${className}`}
      style={style}
      onMouseDown={(e) => { e.preventDefault(); if (!disabled) setCursor([], stRef.current.tree.length); }}
    >
      <span className="mf-line">{renderList(tree, [])}</span>
      <input
        ref={inputRef}
        className="mf-hidden"
        type="text"
        value=""
        onChange={(e) => { for (const c of [...e.target.value]) { const k = typedKey(c); if (k) apply(k); } }}
        onKeyDown={(e) => {
          const a = { ArrowLeft: "left", ArrowRight: "right", Backspace: "bksp" }[e.key];
          if (a) { e.preventDefault(); apply({ a }); }
        }}
        inputMode={native ? "text" : "none"}
        enterKeyHint="done"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        aria-label={label}
        disabled={disabled}
        onFocus={(e) => { setFocus(true); activate(e.target, apply, boxRef.current); }}
        onBlur={(e) => { setFocus(false); deactivateSoon(e.target); }}
      />
    </span>
  );
}
