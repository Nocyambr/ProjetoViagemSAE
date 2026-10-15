import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const sections = [
  ['/home', 'Início'], ['/data-horarios', 'Cronograma'], ['/recursos', 'Preparação'],
  ['/autorizacoes', 'Autorizações'], ['/professores', 'Professores'],
  ['/locomocoes', 'Transporte'], ['/informacoes-extras', 'Sobre o programa'],
];

export default function SiteShell({ children }) {
  const { pathname } = useLocation();
  const isAccountPage = pathname === '/login' || pathname === '/register';
  useEffect(() => {
    const title = sections.find(([path]) => path === pathname)?.[1] ?? (pathname === '/register' ? 'Cadastro' : 'Login');
    document.title = `${title} | SESI Aventura Educativa`;
    window.scrollTo(0, 0);
    document.getElementById('conteudo')?.focus({ preventScroll: true });
  }, [pathname]);

  if (isAccountPage) return children;
  return (
    <div className="min-h-screen bg-[#F8E9EB] text-gray-800">
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/home" className="flex items-center gap-3" aria-label="SESI Aventura Educativa — início">
            <span className="rounded-xl bg-red-600 px-3 py-2 font-black italic text-white">SESI</span>
            <span className="text-sm font-bold leading-tight">Aventura<br />Educativa</span>
          </Link>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">Demonstração</span>
        </div>
        <nav aria-label="Navegação principal" className="site-nav mx-auto max-w-6xl px-4 pb-3">
          {sections.map(([path, label]) => <NavLink key={path} to={path} className={({ isActive }) => `site-nav-link${isActive ? ' is-active' : ''}`}>{label}</NavLink>)}
        </nav>
      </header>
      <main id="conteudo" tabIndex={-1}>{children}</main>
      <footer className="mx-auto mt-10 max-w-6xl border-t border-rose-200 px-4 py-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-800">SESI Aventura Educativa</p>
        <p className="mt-1">Ambiente de demonstração. As informações e os contatos apresentados são exemplos.</p>
        <Link to="/login" className="mt-2 inline-block text-red-700 underline">Ver tela de acesso</Link>
      </footer>
    </div>
  );
}
