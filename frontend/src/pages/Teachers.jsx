import { useNavigate } from 'react-router-dom';

export default function Teachers() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex flex-col">
      <header className="bg-[#2A2A2A] text-white flex justify-between items-center px-4 py-2">
        <span className="font-bold italic bg-red-600 px-2 py-1">SESI SENAI</span>
        <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-bold">SAIR</button>
      </header>

      <div className="flex-1 bg-[#F8E9EB] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600">Professores Responsáveis</h1>
          <p className="text-sm text-red-600 mb-8">Equipe demonstrativa — contatos reais ainda não cadastrados</p>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <p className="text-xs font-bold mb-6">
              <span className="text-red-600">Informações:</span> Aqui estão os professores e educadores responsáveis pelo programa SESI Aventura Educativa.
            </p>

            <h4 className="font-bold text-sm mb-4">Equipe Responsável:</h4>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h5 className="font-bold text-sm mb-2">Professor Coordenador</h5>
              <p className="text-xs text-gray-500">Email: coordenador@example.com</p>
              <p className="text-xs text-gray-500">Telefone: Não informado</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-8">
              <h5 className="font-bold text-sm mb-2">Educador Responsável</h5>
              <p className="text-xs text-gray-500">Email: educador@example.com</p>
              <p className="text-xs text-gray-500">Telefone: Não informado</p>
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
