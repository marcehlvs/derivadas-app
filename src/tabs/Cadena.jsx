import ExprExercise from "../components/ExprExercise.jsx";
import { ChainRule } from "../components/MathBits.jsx";
import { genChain, CHAIN_LEVELS } from "../gens.js";

export default function Cadena({ onSolved }) {
  return (
    <ExprExercise
      title="Regla de la cadena"
      prompt="Derivá la función compuesta, donde u es la función de adentro y g la de afuera. Podés dejar la respuesta sin simplificar."
      formula={<ChainRule />}
      gen={genChain} maxLevel={CHAIN_LEVELS} onSolved={onSolved}
    />
  );
}
