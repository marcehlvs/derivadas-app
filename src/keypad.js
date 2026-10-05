/* Estado compartido del teclado matemático: qué campo está activo y cómo insertar texto en él. */
let active = null; // { el (input que tiene el foco), apply (escribe una tecla en el campo), box (contenedor visible) }
let timer = null;
let snap = { visible: false, native: false };
const listeners = new Set();
const set = (p) => { snap = { ...snap, ...p }; listeners.forEach((f) => f()); };

export const subscribe = (f) => { listeners.add(f); return () => listeners.delete(f); };
export const getSnapshot = () => snap;

export function activate(el, apply, box = el) {
  clearTimeout(timer);
  active = { el, apply, box };
  set({ visible: true });
  setTimeout(() => box.scrollIntoView?.({ block: "center", behavior: "smooth" }), 150);
}
/** Al perder el foco se oculta, salvo que otro campo (o el propio teclado) lo recupere enseguida. */
export function deactivateSoon(el) {
  clearTimeout(timer);
  timer = setTimeout(() => { if (active?.el === el) { active = null; set({ visible: false }); } }, 200);
}
export function hide() { active?.el.blur(); }
export function toggleNative() {
  const el = active?.el;
  set({ native: !snap.native });
  if (el) setTimeout(() => { el.blur(); el.focus(); }, 0); // re-enfocar para que el celular cambie de teclado
}

/** Aplica una tecla: { s: texto, back? } o { a: acción } (ver applyKey en mathEditor.js). "enter" lo resuelve el formulario. */
export function press(key) {
  if (!active) return;
  const { el, apply } = active;
  if (key.a === "enter") return void el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  apply(key);
  el.focus({ preventScroll: true });
}
