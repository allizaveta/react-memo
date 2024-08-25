import { createContext, useState } from "react";

export const SuperPowerContext = createContext();

export function SuperPowerProvider({ children }) {
  const [superPowerUsed, setSuperPowerUsed] = useState(false);

  return (
    <SuperPowerContext.Provider value={{ superPowerUsed, setSuperPowerUsed }}>{children}</SuperPowerContext.Provider>
  );
}
