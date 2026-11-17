import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { registerAccount } from '../lib/auth.js';
import Icon from '../components/Icon.jsx';

export default function Register({ onLogin }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const result = registerAccount({ name, username, password });
    if (result.error) {
      setError(result.error);
      return;
    }

    setError('');
    onLogin?.(result.account);
    navigate('/home', { replace: true });
  };

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-x-clip bg-[#0b1116] p-3 text-slate-100 sm:p-6">
      <img
        src="/images/laboratorio-de-curiosidades.webp"
        alt=""
        width="1536"
        height="1024"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b1116]/80 via-[#0b1116]/75 to-[#0b1116]/95" />

      <section className="w-full max-w-lg rounded-3xl border border-slate-700/80 bg-[#131d24]/95 p-5 shadow-2xl backdrop-blur-md sm:p-7">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 shadow-md shadow-red-950/50">
            <span className="text-sm font-black tracking-tight text-white">S.A.E</span>
          </div>
          <div>
            <h1 className="text-[clamp(1.125rem,1rem+0.6vw,1.375rem)] font-bold leading-tight text-slate-100">
              Criar conta
            </h1>
            <p className="text-xs text-slate-400">SESI Aventura Educativa</p>
          </div>
        </header>

        <form onSubmit={handleRegister} className="space-y-3.5">
          {error && (
            <p role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/60 bg-rose-950/80 px-3 py-2.5 text-xs font-medium text-rose-200">
              <Icon name="alert" />
              <span>{error}</span>
            </p>
          )}

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-200">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              enterKeyHint="next"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Digite seu nome completo"
              required
              className="min-h-12 w-full rounded-xl border border-slate-500 bg-[#0b1116] px-3.5 py-2.5 text-base text-slate-100 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400"
            />
          </div>

          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-semibold text-slate-200">
              Usuário ou e-mail
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              enterKeyHint="next"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex.: aluno.maria ou maria@sesi.br"
              required
              className="min-h-12 w-full rounded-xl border border-slate-500 bg-[#0b1116] px-3.5 py-2.5 text-base text-slate-100 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-200">
                Senha <span className="text-xs font-normal text-slate-400">(mín. 8)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  enterKeyHint="next"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  minLength={8}
                  className="min-h-12 w-full rounded-xl border border-slate-500 bg-[#0b1116] py-2.5 pl-3.5 pr-16 text-base text-slate-100 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400"
                />
                <button
                  type="button"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Ocultar senhas' : 'Mostrar senhas'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-semibold text-slate-200">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                enterKeyHint="done"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                aria-invalid={error ? 'true' : undefined}
                required
                className={`min-h-12 w-full rounded-xl border bg-[#0b1116] px-3.5 py-2.5 text-base text-slate-100 outline-none transition-colors placeholder:text-slate-400 ${
                  error ? 'border-rose-400 focus:border-rose-400' : 'border-slate-500 focus:border-emerald-400'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="group mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-500"
          >
            <span>CRIAR CONTA</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              <Icon name="arrow-right" />
            </span>
          </button>
        </form>

        <div className="mt-4 border-t border-slate-800 pt-4 text-center">
          <p className="text-sm text-slate-400">
            Já possui uma conta?{' '}
            <Link to="/login" className="font-bold text-rose-400 transition-colors hover:text-rose-300">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
