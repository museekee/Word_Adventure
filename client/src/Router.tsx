import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Game from './pages/game';
import Lobby from './pages/lobby';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:rid" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
