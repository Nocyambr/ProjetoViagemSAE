import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Login() {
  const [notice, setNotice] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setNotice('O acesso ainda não está disponível: a autenticação precisa ser conectada ao servidor.');
  };

  return (
    <div className="relative isolate min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4 py-10">
      <img src="/images/mundo-de-descobertas.webp" alt="" width="2048" height="1024" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-950/65 via-emerald-950/35 to-emerald-950/75" />
      
      <div className="text-white text-center mb-6">
        <h1 className="text-3xl font-bold tracking-widest italic">SESI</h1>
        <p className="text-sm">LOGIN</p>
        <p className="text-xs opacity-90">SESI Aventura Educativa</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800">S.A.E</h2>
        <p className="text-xs text-[#F04D4A] font-medium mb-6">SESI Aventura Educativa</p>
        
        <p className="mb-4 text-sm text-gray-700">Demonstração: login e cadastro ainda indisponíveis.</p>
        <Link to="/home" className="mb-5 block rounded bg-red-600 p-3 font-bold text-white">Explorar demonstração</Link>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {notice && <p role="alert" className="rounded bg-amber-100 p-3 text-sm text-amber-900">{notice}</p>}
          <div className="text-left">
            <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">Email:</label>
            <input 
              id="email" type="email" name="email" autoComplete="email" required
              className="w-full bg-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          
          <div className="text-left">
            <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1">Senha:</label>
            <input 
              id="password" type="password" name="password" autoComplete="current-password" required
              className="w-full bg-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded mt-2 transition-colors"
          >
            ENTRAR
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-600 flex justify-center gap-1">
          <span>Não possui conta?</span>
          <Link to="/register" className="text-red-500 hover:underline">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
