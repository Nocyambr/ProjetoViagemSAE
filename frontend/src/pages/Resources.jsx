import { useNavigate } from 'react-router-dom';

export default function Resources() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex flex-col">
      <header className="bg-[#2A2A2A] text-white flex justify-between items-center px-4 py-2">
        <span className="font-bold italic bg-red-600 px-2 py-1">SESI SENAI</span>
        <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-bold">SAIR</button>
      </header>

      <div className="flex-1 bg-[#F8E9EB] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600">Recursos</h1>
          <p className="text-sm text-red-600 mb-8">Recursos disponíveis para o programa</p>

          <div className="bg-white rounded-3xl p-4 sm:p-10 text-center shadow-sm">
            <h2 className="text-4xl font-bold text-red-600 mb-12">Obrigatório!</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">📷</div>
                <p className="font-medium text-sm">Hidratação</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">🎒</div>
                <p className="font-medium text-sm">Cuidados necessários</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">📄</div>
                <p className="font-medium text-sm">Documentação</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">📱</div>
                <p className="font-medium text-sm">Câmera/Smartphone</p>
              </div>
            </div>

            <p className="text-lg font-medium mb-12">
              Lembrar de usar Mochila e roupas confortáveis para atividades ao ar livre!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
              <button onClick={() => navigate('/home')} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-lg">
                Voltar
              </button>
              <p className="text-xs text-gray-500 max-w-md text-right">
                Atenção: Todos os recursos obrigatórios devem ser providenciados antes do início das atividades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
