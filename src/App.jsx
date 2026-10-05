import { useState } from "react";
import { Star } from "lucide-react";
import Definicion from "./tabs/Definicion.jsx";
import Cadena from "./tabs/Cadena.jsx";
import Tangente from "./tabs/Tangente.jsx";
import Estudio from "./tabs/Estudio.jsx";
import Desafio from "./tabs/Desafio.jsx";
import HelpGateModal from "./components/HelpGateModal.jsx";
import MathKeyboard from "./components/MathKeyboard.jsx";

const TABS = [
  { id: "def", label: "1 · Por definición", Component: Definicion },
  { id: "cadena", label: "2 · Regla de la cadena", Component: Cadena },
  { id: "tangente", label: "3 · Recta tangente", Component: Tangente },
  { id: "estudio", label: "4 · Estudio de función", Component: Estudio },
  { id: "desafio", label: "5 · Desafío", Component: Desafio },
];

export default function App() {
  const [tab, setTab] = useState("def");
  const [solved, setSolved] = useState(0);
  const { Component } = TABS.find((t) => t.id === tab);

  return (
    <div className="board-app">
      <header className="board-header">
        <h1 className="board-title">Derivadas en acción</h1>
        <p className="board-subtitle">Definición, regla de la cadena, recta tangente y estudio completo de funciones</p>
        <span className="solved-badge">
          <Star size={13} fill="#F29E4C" color="#F29E4C" /> {solved} {solved === 1 ? "ejercicio resuelto" : "ejercicios resueltos"}
        </span>
      </header>
      <nav className="tabs-row" aria-label="Secciones">
        {TABS.map((t) => (
          <button key={t.id} className={`chalk-tab ${tab === t.id ? "chalk-tab--active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </nav>
      <main className="paper"><Component key={tab} onSolved={() => setSolved((n) => n + 1)} /></main>
      <HelpGateModal />
      <MathKeyboard />
    </div>
  );
}
