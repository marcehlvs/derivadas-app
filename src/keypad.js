/* Estado compartido del teclado matemático: qué campo está activo y cómo insertar texto en él. */
let active = null; // { el, onChange }
let timer = null;
let snap = { visible: false, native: false };
const listeners = new Set();
const set = (p) => { snap = { ...snap, ...p }; listeners.forEach((f) => f()); };

export const subscribe = (f) => { listeners.add(f); return () => listeners.delete(f); };
export const getSnapshot = () => snap;

export function activate(el, onChange) {
  clearTimeout(timer);
  active = { el, onChange };
  set({ visible: true });
  setTimeout(() => el.scrollIntoView?.({ block: "center", behavior: "smooth" }), 150);
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

/** Aplica una tecla: { s: texto a insertar, back: cuánto retroceder el cursor } o { a: acción }. */
export function press(key) {
  if (!active) return;
  const { el, onChange } = active;
  const v = el.value;
  const s = el.selectionStart ?? v.length;
  const e = el.selectionEnd ?? s;
  const put = (value, pos) => {
    onChange(value);
    el.focus({ preventScroll: true });
    setTimeout(() => { try { el.setSelectionRange(pos, pos); } catch { /* campo desmontado */ } }, 0);
  };
  if (key.a === "enter") return void el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  if (key.a === "left" || key.a === "right") {
    const pos = Math.max(0, Math.min(v.length, (key.a === "left" ? s : e) + (key.a === "left" ? -1 : 1)));
    el.focus({ preventScroll: true });
    return void el.setSelectionRange(pos, pos);
  }
  if (key.a === "bksp") {
    if (s !== e) return put(v.slice(0, s) + v.slice(e), s);
    return s > 0 ? put(v.slice(0, s - 1) + v.slice(s), s - 1) : undefined;
  }
  put(v.slice(0, s) + key.s + v.slice(e), s + key.s.length - (key.back ?? 0));
}
