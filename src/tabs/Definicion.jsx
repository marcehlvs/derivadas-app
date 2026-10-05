import ExprExercise from "../components/ExprExercise.jsx";
import { DefLimit } from "../components/MathBits.jsx";
import { genDef, DEF_LEVELS } from "../gens.js";

export default function Definicion({ onSolved }) {
  return (
    <ExprExercise
      title="Derivada por definición"
      prompt="Calculá la derivada con el límite del cociente incremental y escribí el resultado ya simplificado."
      formula={<DefLimit />}
      gen={genDef} maxLevel={DEF_LEVELS} onSolved={onSolved}
    />
  );
}
