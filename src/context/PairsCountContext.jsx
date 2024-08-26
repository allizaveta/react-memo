import { createContext, useContext, useState } from "react";

const PairsCountContext = createContext();

export function usePairsCount() {
  return useContext(PairsCountContext);
}

export function PairsCountProvider({ children, initialPairsCount }) {
  const [pairsCount, setPairsCount] = useState(initialPairsCount);
  return <PairsCountContext.Provider value={{ pairsCount, setPairsCount }}>{children}</PairsCountContext.Provider>;
}
