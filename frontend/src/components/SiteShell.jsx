import { useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { isTeacher } from '../lib/auth.js';
import Icon from './Icon.jsx';

export default function SiteShell({ user, hasTrips = false, onLogout, children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const teacher = isTeacher(user);
  const isAccountPage = pathname === '/login' || pathname === '/register';

  const sections = [
    { path: '/home', label: 'Início', locked: false },
    { path: '/data-horarios', label: teacher ? 'Configurar Viagens' : 'Cronograma', locked: !teacher && !hasTrips },
    { path: '/locomocoes', label: 'Localização do Ônibus', locked: !hasTrips },
    { path: '/fotos', label: 'Fotos', locked: !hasTrips },
    { path: '/professores', label: 'Professores', locked: !hasTrips },
  ];

  useEffect(() => {
    const fallback = pathname === '/register' ? 'Cadastro' : 'Login';
    const title = sections.find((item) => item.path === pathname)?.label ?? fallback;
    document.title = `${title} | SESI Aventura Educativa`;
    window.scrollTo(0, 0);
    document.getElementById('conteudo')?.focus({ preventScroll: true });
  }, [pathname, teacher]);

  function handleLogout() {
    onLogout?.();
    navigate('/login', { replace: true });
  }

  if (isAccountPage) return children;

  return (
    <div className="min-h-screen bg-[#0b1116] text-slate-100">
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>

      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/home" className="flex items-center gap-3" aria-label="SESI Aventura Educativa - início">
            <span className="rounded-xl bg-red-600 px-3 py-2 font-black italic text-white">SESI</span>
            <span className="text-sm font-bold leading-tight text-slate-100">
              Aventura<br />Educativa
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {user && (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 py-1 pl-1.5 pr-3 text-xs font-semibold text-slate-200">
                <img
                  src={teacher ? '/images/teachers/prof-ricardo.jpg' : '/images/sesi-excursao.jpg'}
                  alt={user.name}
                  className="h-6 w-6 rounded-full border border-slate-600 object-cover"
                />
                <span>{user.username} · {teacher ? 'Professor' : 'Aluno / Pais'}</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-700"
            >
              Sair
            </button>
          </div>
        </div>

        <nav aria-label="Navegação principal" className="site-nav mx-auto max-w-6xl px-4 pb-3">
          {sections.map(({ path, label, locked }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `site-nav-link flex items-center gap-1.5${isActive ? ' is-active' : ''}${locked ? ' opacity-70' : ''}`
              }
            >
              {locked && <Icon name="lock" className="h-3.5 w-3.5 shrink-0" />}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1}>{children}</main>

      <footer className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-6 text-sm text-slate-400">
        <p className="font-semibold text-slate-200">SESI Aventura Educativa</p>
        <button type="button" onClick={handleLogout} className="text-rose-400 underline hover:text-rose-300">
          Sair
        </button>
      </footer>
    </div>
  );
}
