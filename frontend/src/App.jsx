import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Resources from './pages/Resources';
import ExtraInfo from './pages/ExtraInfo';
import Schedule from './pages/Schedule';
import Teachers from './pages/Teachers';
import Transports from './pages/Transports';
import Authorizations from './pages/Authorizations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/home" replace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/recursos" element={<Resources />} />
        <Route path="/informacoes-extras" element={<ExtraInfo />} />
        <Route path="/data-horarios" element={<Schedule />} />
        <Route path="/professores" element={<Teachers />} />
        <Route path="/locomocoes" element={<Transports />} />
        <Route path="/autorizacoes" element={<Authorizations />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
