import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Lobby from './pages/lobby';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
