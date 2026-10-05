/* Piezas visuales para fórmulas: fracción, límite y ayuda de escritura. */
export const Frac = ({ n, d }) => <span className="frac"><span>{n}</span><span>{d}</span></span>;
export const Lim = ({ sub }) => <span className="lim"><span>lím</span><span className="lim__sub">{sub}</span></span>;

/** f′(x) = lím(h→0) [f(x+h) − f(x)] / h */
export const DefLimit = () => (
  <div className="math-block" role="math" aria-label="f prima de x es el límite, cuando h tiende a cero, de f de x más h menos f de x, sobre h">
    f′(x) = <Lim sub="h → 0" /> <Frac n="f(x + h) − f(x)" d="h" />
  </div>
);
export const ChainRule = () => (
  <div className="math-block" role="math" aria-label="f prima de x es g prima de u por u prima">
    f′(x) = g′(u) · u′
  </div>
);
