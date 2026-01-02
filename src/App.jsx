import { BrowserRouter, Routes, Route } from "react-router-dom";
import GamePage from "./components/GamePage";
import HistoryPage from "./components/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
