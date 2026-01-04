import { createContext, useReducer } from 'react';
import { gameReducer, initialState } from '../Reducer/GameReducer';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
