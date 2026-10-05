import test from "node:test";
import assert from "node:assert/strict";
import { applyKey, emptyState, ser, typedKey } from "./mathEditor.js";
import { parse } from "./math.js";

const run = (keys, st = emptyState()) => keys.reduce((s, k) => applyKey(s, typeof k === "string" ? typedKey(k) ?? { a: k } : k), st);
const out = (st) => ser(st.tree);

test("÷ toma el operando anterior como numerador y pasa al denominador", () => {
  const st = run(["1", "/", "x"]);
  assert.equal(out(st), "(1)/(x)");
});
test("÷ con paréntesis y función toma todo el grupo", () => {
  assert.equal(out(run(["s", "i", "n", "(", "x", ")", "/", "2"])), "(sin(x))/(2)");
  assert.equal(out(run(["(", "x", "+", "1", ")", "/", "2"])), "((x+1))/(2)");
});
test("exponente: ^ abre el casillero y ▶ sale", () => {
  assert.equal(out(run(["x", "^", "3", "right", "+", "1"])), "x^(3)+1");
  assert.equal(out(run(["x", "^", "3", "+", "1"])), "x^(3+1)");
});
test("x² y eˣ", () => {
  assert.equal(out(run(["sq", "+", "1"])), "x^(2)+1");
  assert.equal(out(run(["exp", "2", "x", "right"])), "e^(2x)");
});
test("raíz como nodo", () => assert.equal(out(run(["sqrt", "x", "+", "1"])), "sqrt(x+1)"));
test("sin() inserta paréntesis y deja el cursor adentro", () => {
  assert.equal(out(run([{ s: "sin()", back: 1 }, "x"])), "sin(x)");
});
test("navegar: numerador -> denominador -> afuera", () => {
  const st = run(["1", "/", "2", "left", "left", "3"]);
  assert.equal(out(st), "(13)/(2)");
  assert.equal(out(run(["1", "/", "2", "right", "+", "x"])), "(1)/(2)+x");
  assert.equal(out(run(["1", "/", "2", "left", "left", "right", "right", "right", "+"])), "(1)/(2)+");
});
test("borrar: vacío elimina el nodo, con contenido entra", () => {
  assert.equal(out(run(["1", "/", "bksp"])), "1");
  assert.equal(out(run(["1", "/", "2", "left", "left", "left", "bksp"])), "12");
  assert.equal(out(run(["x", "^", "bksp"])), "x");
  assert.equal(out(run(["1", "/", "2", "right", "bksp", "bksp"])), "(1)/()");
});
test("÷ sin operando abre el numerador vacío", () => {
  assert.equal(out(run(["/", "1", "right", "2"])), "(1)/(2)");
});
test("lo escrito se evalúa bien con parse()", () => {
  const f = (keys) => parse(out(run(keys)));
  assert.equal(f(["1", "/", "4", "right", "+", "1"])(0), 1.25);
  assert.equal(f(["3", "x", "^", "2", "right", "-", "1"])(2), 11);
  assert.ok(Math.abs(f(["1", "/", "(", "x", "+", "1", ")"])(1) - 0.5) < 1e-9);
  assert.equal(f(["x", "^", "(", "-", "1", ")"])(2), 0.5);
});
