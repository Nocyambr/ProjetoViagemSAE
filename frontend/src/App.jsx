import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SiteShell from './components/SiteShell';
import Login from './pages/Login';
import Register from './pages/Register';
import Schedule from './pages/Schedule';
import Teachers from './pages/Teachers';
import Transports from './pages/Transports';
import Photos from './pages/Photos';
import { clearSession, loadSession, saveSession } from './lib/auth.js';
import { usePortalData } from './lib/usePortalData.js';

function App() {
  const [user, setUser] = useState(() => loadSession());
  const portal = usePortalData();

  function handleLogin(nextUser) {
    saveSession(nextUser);
    setUser(nextUser);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  const protect = (element) => (user ? element : <Navigate to="/login" replace />);

  return (
    <BrowserRouter>
      <SiteShell user={user} hasTrips={portal.trips.length > 0} onLogout={handleLogout}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Register onLogin={handleLogin} />} />
          <Route path="/home" element={protect(<Home user={user} portal={portal} />)} />
          <Route path="/data-horarios" element={protect(<Schedule user={user} portal={portal} />)} />
          <Route path="/locomocoes" element={protect(<Transports user={user} portal={portal} />)} />
          <Route path="/fotos" element={protect(<Photos user={user} portal={portal} />)} />
          <Route path="/professores" element={protect(<Teachers user={user} portal={portal} />)} />
          <Route path="/" element={<Navigate to={user ? '/home' : '/login'} replace />} />
          <Route path="*" element={<Navigate to={user ? '/home' : '/login'} replace />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}

export default App;
