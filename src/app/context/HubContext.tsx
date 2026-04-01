import { createContext, useContext } from 'react';

const HubContext = createContext(false);

export const HubProvider = HubContext.Provider;

export const useIsInsideHub = () => useContext(HubContext);
