import { useParams } from "react-router-dom";
import { Cards } from "../../components/Cards/Cards";
import { PairsCountProvider } from "../../context/PairsCountContext";
import { SuperPowerProvider } from "../../context/SuperPowerContext";

export function GamePage() {
  const { pairsCount } = useParams();
  const parsedPairsCount = parseInt(pairsCount, 10);
  return (
    <SuperPowerProvider>
      <PairsCountProvider initialPairsCount={parsedPairsCount}>
        <Cards pairsCount={parsedPairsCount} previewSeconds={5} />
      </PairsCountProvider>
    </SuperPowerProvider>
  );
}
