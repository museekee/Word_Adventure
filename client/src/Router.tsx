import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Game from './pages/game';
import Lobby from './pages/lobby';
import MyComponent from './pages/test';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:rid" element={<Game />} />
        <Route path="/test" element={<MyComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
