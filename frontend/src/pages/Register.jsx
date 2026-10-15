import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Register() {

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setError('O cadastro ainda não está disponível: é necessário conectar o formulário à API de usuários.');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f9fc] px-4 py-8 flex items-center justify-center">

      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#F04D4A]/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[#F04D4A]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        <header className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F04D4A] shadow-lg shadow-red-500/20">
            <span className="text-xl font-black tracking-tight text-white">
              S.A.E
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            SESI Aventura Educativa
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Conheça o formulário de cadastro.
          </p>
        </header>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-8">

          <div className="mb-7">
            <h2 className="text-xl font-bold text-gray-900">
              Criar sua conta
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Demonstração: o cadastro ainda está indisponível. Não informe dados reais.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Nome completo
              </label>

              <input
                id="name"
                name="name"
                autoComplete="name"
                type="text"
                placeholder="Digite seu nome completo"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F04D4A] focus:bg-white focus:ring-4 focus:ring-[#F04D4A]/10"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                E-mail
              </label>

              <input
                id="email"
                name="email"
                autoComplete="email"
                type="email"
                placeholder="Digite seu e-mail"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F04D4A] focus:bg-white focus:ring-4 focus:ring-[#F04D4A]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Senha
              </label>

              <input
                id="password"
                name="password"
                autoComplete="new-password"
                type="password"
                placeholder="Crie uma senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F04D4A] focus:bg-white focus:ring-4 focus:ring-[#F04D4A]/10"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Mínimo de 8 caracteres.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirmar senha
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 ${
                  error
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                    : 'border-gray-200 focus:border-[#F04D4A] focus:ring-[#F04D4A]/10'
                }`}
              />

              {error && (
                <p role="alert" className="mt-2 text-xs font-medium text-red-500">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F04D4A] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 hover:bg-[#df403d] hover:shadow-xl hover:shadow-red-500/25 active:translate-y-0"
            >
              <span>CRIAR CONTA</span>

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          </form>

          <div className="mt-7 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="font-bold text-[#F04D4A] transition-colors hover:text-[#c93633]"
              >
                Entrar
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} SESI Aventura Educativa
        </p>
      </div>
    </main>
  );
}