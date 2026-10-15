import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8E9EB] text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-[#2A2A2A] text-white flex justify-between items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-bold italic bg-red-600 px-2 py-1">SESI SENAI</span>
        </div>
        <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-bold">
          VOLTAR AO LOGIN
        </button>
      </header>

      {/* Banner Image Area */}
      <div className="w-full max-w-6xl mx-auto mt-4 px-4">
        <div className="bg-gray-800 text-white rounded-xl h-24 flex flex-col items-center justify-center bg-cover bg-center overflow-hidden relative">
          {/* Placeholder for banner image */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-3xl font-bold">P.T.S - Programa de Turismo SESI</h1>
            <p className="text-sm">Informações sobre sua experiência e documentação</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 flex items-center justify-center overflow-hidden">
               {/* placeholder avatar */}
               <span className="text-gray-400">Foto</span>
            </div>
            <h2 className="font-bold text-sm">Aluno</h2>
            <p className="text-xs text-gray-500 mb-4">Participante</p>
            
            <div className="w-full bg-gray-200 text-left px-3 py-2 text-xs mb-2 flex items-center gap-2">
               <div className="w-3 h-3 bg-red-600"></div> Nome de exemplo
            </div>
            <div className="w-full bg-gray-200 text-left px-3 py-2 text-xs mb-4 flex items-center gap-2">
               <div className="w-3 h-3 bg-red-600"></div> E-mail de exemplo
            </div>
            <button onClick={() => navigate('/login')} className="w-full bg-red-600 text-white py-2 rounded text-sm font-bold">Voltar ao login</button>
          </div>

          {/* Proximos Passos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-center">Próximos Passos</h3>
            <ul className="text-sm space-y-2">
              <li className="flex gap-2"><span className="text-green-500">1</span> Complete seu cadastro pessoal</li>
              <li className="flex gap-2"><span className="font-bold">2</span> Agende sua participação</li>
              <li className="flex gap-2"><span className="font-bold">3</span> Preencha as autorizações</li>
              <li className="flex gap-2"><span className="font-bold">4</span> Forneça informações de saúde</li>
              <li className="flex gap-2"><span className="font-bold">5</span> Indique forma de locomoção</li>
            </ul>
          </div>
        </div>

        {/* Right Column (2 cols width) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Informações Gerais</h3>
            <p className="mb-3 text-sm font-semibold text-red-700">Demonstração com dados fictícios. As contas e autorizações ainda não estão disponíveis.</p>
            <p className="text-sm text-gray-600">
              Bem-vindo ao portal do SESI Aventura Educativa. Aqui você encontrará todas as ferramentas necessárias para gerenciar sua participação no programa educacional.
            </p>
          </div>

          {/* Sections Grid */}
          <div>
            <h3 className="text-2xl mb-1">Seções Disponíveis</h3>
            <p className="text-xs text-gray-500 mb-4">Acesse todas as funcionalidades do sistema</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/professores" className="bg-[#FFD700] rounded-xl py-6 flex items-center justify-center font-bold text-lg shadow-sm hover:brightness-95 transition-all">
                Professores Responsáveis
              </Link>
              <Link to="/autorizacoes" className="bg-[#FFD700] rounded-xl py-6 flex items-center justify-center font-bold text-lg shadow-sm hover:brightness-95 transition-all">
                Autorizações
              </Link>
              <Link to="/informacoes-extras" className="bg-[#FFD700] rounded-xl py-6 flex items-center justify-center font-bold text-lg shadow-sm hover:brightness-95 transition-all">
                Informações extras
              </Link>
              <Link to="/data-horarios" className="bg-[#FFD700] rounded-xl py-6 flex items-center justify-center font-bold text-lg shadow-sm hover:brightness-95 transition-all">
                Data e Hora
              </Link>
              <Link to="/locomocoes" className="bg-[#FFD700] rounded-xl py-6 flex items-center justify-center font-bold text-lg shadow-sm hover:brightness-95 transition-all">
                Locomoções
              </Link>
              <Link to="/recursos" className="bg-[#FFD700] rounded-xl py-6 flex items-center justify-center font-bold text-lg shadow-sm hover:brightness-95 transition-all">
                Recursos
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}