import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authenticate } from '../lib/auth.js';
import Icon from '../components/Icon.jsx';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const result = authenticate(username, password);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    onLogin?.(result.user);
    navigate('/home', { replace: true });
  };

  const handleAutoFill = (role) => {
    setUsername(role === 'teacher' ? 'professor' : 'usuario1');
    setPassword('senai00');
    setError('');
  };

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center bg-[#0b1116] p-4 py-8 text-slate-100">
      <img src="/images/sesi-cerquilho-hero.jpg" alt="" width="1408" height="768" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b1116]/80 via-[#0b1116]/70 to-[#0b1116]/95" />

      <div className="mb-6 text-center text-white">
        <h1 className="text-3xl font-bold tracking-widest italic">SESI</h1>
        <p className="text-sm text-slate-200">LOGIN</p>
        <p className="text-xs text-slate-300">SESI Aventura Educativa</p>
      </div>

      <section className="w-full max-w-sm rounded-3xl border border-slate-700/80 bg-[#131d24]/95 p-8 text-center shadow-2xl backdrop-blur-md">
        <h2 className="mb-6 text-xl font-semibold text-slate-100">S.A.E</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/60 bg-rose-950/80 p-3 text-sm font-medium text-rose-200">
              <Icon name="alert" />
              <span>{error}</span>
            </p>
          )}

          <div className="text-left">
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-200">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              name="username"
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              required
              aria-invalid={error ? 'true' : undefined}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="usuario1 ou professor"
              className="min-h-12 w-full rounded-xl border border-slate-500 bg-[#0b1116] px-3.5 py-2.5 text-base text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="text-left">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-200">
              Senha
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                enterKeyHint="done"
                required
                aria-invalid={error ? 'true' : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Digite sua senha"
                className="min-h-12 w-full rounded-xl border border-slate-500 bg-[#0b1116] py-2.5 pl-3.5 pr-20 text-base text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-[#0b1116]/70 p-2.5 text-left">
            <p className="mb-2 text-xs font-semibold text-slate-400">Preencher automaticamente</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAutoFill('teacher')}
                className="rounded-xl border border-emerald-500/60 bg-emerald-950/60 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-900/60"
              >
                Professor
              </button>
              <button
                type="button"
                onClick={() => handleAutoFill('student')}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-700"
              >
                Aluno / Pais
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-1 min-h-12 w-full rounded-xl bg-red-600 py-2.5 font-bold text-white transition-colors hover:bg-red-500"
          >
            ENTRAR
          </button>
        </form>

        <div className="mt-5 flex justify-center gap-1 text-xs text-slate-400">
          <span>Não possui conta?</span>
          <Link to="/register" className="text-rose-400 hover:text-rose-300 hover:underline">Cadastre-se</Link>
        </div>
      </section>
    </main>
  );
}
