import { BrowserRouter, Routes, Route } from "react-router-dom";
import GamePage from "./components/GamePage";
import HistoryPage from "./components/HistoryPage";
import { GameProvider } from "./components/context/GameContext";

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>

  );
}

export default App;
