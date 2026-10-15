import { useNavigate } from 'react-router-dom';

export default function Transports() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex flex-col">
      <header className="bg-[#2A2A2A] text-white flex justify-between items-center px-4 py-2">
        <span className="font-bold italic bg-red-600 px-2 py-1">SESI SENAI</span>
        <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-bold">SAIR</button>
      </header>

      <div className="flex-1 bg-[#F8E9EB] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600">Locomoções</h1>
          <p className="text-sm text-red-600 mb-8">Exemplos de transporte — disponibilidade não confirmada</p>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h4 className="text-xs text-red-600 font-bold mb-4">Opções de Transporte:</h4>

            <div className="bg-gray-100 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
              <p className="text-xs mb-1">Transporte Privado 3ºB</p>
              <h5 className="font-bold text-sm mb-1">Ônibus Calvip</h5>
              <p className="text-xs text-gray-600">A confirmar</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-xs mb-1">Transporte Privado 2ºA</p>
              <h5 className="font-bold text-sm mb-1">Ônibus Calvip</h5>
              <p className="text-xs text-gray-600">A confirmar</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-xs mb-1">Transporte Privado 9ºA</p>
              <h5 className="font-bold text-sm mb-1">Ônibus Calvip</h5>
              <p className="text-xs text-gray-600">A confirmar</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-8">
              <p className="text-xs mb-1">Transporte Privado 9ºA</p>
              <h5 className="font-bold text-sm mb-1">Ônibus Calvip</h5>
              <p className="text-xs text-gray-600">A confirmar</p>
            </div>

            <button onClick={() => navigate('/home')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}