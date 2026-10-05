/* Modelo del editor matemático (sin React): una expresión es una lista de nodos.
   Nodo = un carácter (string) o { t: "frac" | "sup" | "sqrt", a: [...], b?: [...] }.
   Cursor = { path: [{ i, k }], pos }: path baja por nodo i y casillero k ("a" | "b") desde la raíz; pos es el lugar dentro de esa lista.
   Todo es puro: applyKey(state, key) devuelve un estado nuevo. ser() lo convierte al texto que entiende parse() de math.js. */

export const emptyState = () => ({ tree: [], cur: { path: [], pos: 0 } });

/** Texto "de teclado" -> estado (todo como caracteres sueltos; sirve para restaurar un valor externo). */
export const fromString = (s) => ({ tree: [...s], cur: { path: [], pos: [...s].length } });

/** Árbol -> texto para parse(): fracción "(a)/(b)", exponente "^(a)", raíz "sqrt(a)". */
export function ser(list) {
  return list.map((n) => {
    if (typeof n === "string") return n;
    if (n.t === "frac") return `(${ser(n.a)})/(${ser(n.b)})`;
    if (n.t === "sup") return `^(${ser(n.a)})`;
    return `sqrt(${ser(n.a)})`;
  }).join("");
}

const listAt = (tree, path) => path.reduce((l, s) => l[s.i][s.k], tree);
const isChar = (n) => typeof n === "string";
const isEmptyNode = (n) => !isChar(n) && n.a.length === 0 && (n.b?.length ?? 0) === 0;
const slots = (n) => (n.t === "frac" ? ["a", "b"] : ["a"]);
const lastSlot = (n) => slots(n).at(-1);

/** Hasta dónde llega hacia atrás el "operando" que se vuelve numerador/base: número, variable, potencias o un grupo entre paréntesis. */
function operandStart(list, pos) {
  let j = pos;
  while (j > 0) {
    const n = list[j - 1];
    if (!isChar(n)) { j--; continue; } // exponente o fracción ya armada
    if (n === ")") {
      let depth = 0;
      let k = j - 1;
      for (; k >= 0; k--) {
        if (list[k] === ")") depth++;
        else if (list[k] === "(" && --depth === 0) break;
      }
      if (k < 0) break;
      j = k;
      while (j > 0 && /^[a-z]$/.test(String(list[j - 1]))) j--; // sin(…), ln(…)
      break;
    }
    if (/^[0-9a-z.,]$/i.test(n)) { j--; continue; }
    break;
  }
  return j;
}

const exit = (cur, node) => { cur.pos = cur.path.at(-1).i + (node ? 1 : 0); cur.path.pop(); };
const enter = (cur, i, k, atEnd, list) => { cur.path.push({ i, k }); cur.pos = atEnd ? list.length : 0; };

function insertText(tree, cur, s, back = 0) {
  const list = listAt(tree, cur.path);
  const chars = [...s];
  list.splice(cur.pos, 0, ...chars);
  cur.pos += chars.length - back;
}

function insertNode(tree, cur, node, intoSlot) {
  const list = listAt(tree, cur.path);
  list.splice(cur.pos, 0, node);
  if (intoSlot) enter(cur, cur.pos, intoSlot, false, node[intoSlot]);
  else cur.pos += 1;
}

function makeFrac(tree, cur) {
  const list = listAt(tree, cur.path);
  const j = operandStart(list, cur.pos);
  const a = list.splice(j, cur.pos - j);
  list.splice(j, 0, { t: "frac", a, b: [] });
  cur.pos = j;
  enter(cur, j, a.length ? "b" : "a", false, []);
}

function makeSup(tree, cur, content) {
  const node = { t: "sup", a: content ? [...content] : [] };
  insertNode(tree, cur, node, content ? null : "a");
}

function left(tree, cur) {
  const list = listAt(tree, cur.path);
  if (cur.pos > 0) {
    const n = list[cur.pos - 1];
    if (isChar(n)) cur.pos--;
    else { const k = lastSlot(n); cur.pos--; enter(cur, cur.pos, k, true, n[k]); }
    return;
  }
  const step = cur.path.at(-1);
  if (!step) return;
  if (step.k === "b") { const n = listAt(tree, cur.path.slice(0, -1))[step.i]; cur.path[cur.path.length - 1] = { i: step.i, k: "a" }; cur.pos = n.a.length; }
  else exit(cur, false);
}

function right(tree, cur) {
  const list = listAt(tree, cur.path);
  if (cur.pos < list.length) {
    const n = list[cur.pos];
    if (isChar(n)) cur.pos++;
    else enter(cur, cur.pos, "a", false, n.a);
    return;
  }
  const step = cur.path.at(-1);
  if (!step) return;
  if (step.k === "a" && listAt(tree, cur.path.slice(0, -1))[step.i].t === "frac") { cur.path[cur.path.length - 1] = { i: step.i, k: "b" }; cur.pos = 0; }
  else exit(cur, true);
}

function backspace(tree, cur) {
  const list = listAt(tree, cur.path);
  if (cur.pos > 0) {
    const n = list[cur.pos - 1];
    if (isChar(n)) { list.splice(cur.pos - 1, 1); cur.pos--; }
    else if (isEmptyNode(n)) { list.splice(cur.pos - 1, 1); cur.pos--; }
    else left(tree, cur); // un nodo con contenido: entrar para borrar de adentro hacia afuera
    return;
  }
  const step = cur.path.at(-1);
  if (!step) return;
  const parent = listAt(tree, cur.path.slice(0, -1));
  const n = parent[step.i];
  if (isEmptyNode(n)) { parent.splice(step.i, 1); cur.path.pop(); cur.pos = step.i; }
  else if (n.t === "frac" && step.k === "b") {
    if (n.b.length === 0) { parent.splice(step.i, 1, ...n.a); cur.path.pop(); cur.pos = step.i + n.a.length; } // deshace el ÷
    else left(tree, cur); // pasar del denominador al numerador
  }
  else if (n.t === "frac") { // al borrar antes del numerador se desarma la fracción
    parent.splice(step.i, 1, ...n.a, ...n.b);
    cur.path.pop(); cur.pos = step.i;
  } else exit(cur, false);
}

/** Tecla: { s: texto, back? } | { a: "frac" | "sup" | "sq" | "sqrt" | "exp" | "left" | "right" | "bksp" }. */
export function applyKey(state, key) {
  const st = structuredClone(state);
  const { tree, cur } = st;
  if (key.s !== undefined) {
    if (key.s === "/") makeFrac(tree, cur);
    else if (key.s === "^") makeSup(tree, cur);
    else insertText(tree, cur, key.s, key.back ?? 0);
  } else if (key.a === "frac") makeFrac(tree, cur);
  else if (key.a === "sup") makeSup(tree, cur);
  else if (key.a === "sq") { insertText(tree, cur, "x"); makeSup(tree, cur, "2"); }
  else if (key.a === "exp") { insertText(tree, cur, "e"); makeSup(tree, cur); }
  else if (key.a === "sqrt") insertNode(tree, cur, { t: "sqrt", a: [] }, "a");
  else if (key.a === "left") left(tree, cur);
  else if (key.a === "right") right(tree, cur);
  else if (key.a === "bksp") backspace(tree, cur);
  return st;
}

/** Letras, dígitos y símbolos permitidos al escribir con teclado físico o del celular. */
export const typedKey = (c) => (/^[0-9a-zA-Z+\-*/^().,·×−]$/.test(c) ? { s: c.toLowerCase() } : null);
