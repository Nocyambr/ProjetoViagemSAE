import { useNavigate } from 'react-router-dom';

export default function ExtraInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex flex-col">
      <header className="bg-[#2A2A2A] text-white flex justify-between items-center px-4 py-2">
        <span className="font-bold italic bg-red-600 px-2 py-1">SESI SENAI</span>
        <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-bold">SAIR</button>
      </header>

      <div className="flex-1 bg-[#F8E9EB] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600">Informações Extras</h1>
          <p className="text-sm text-red-600 mb-8">Informações adicionais sobre o programa</p>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-red-600 font-bold mb-4">Tópicos Importantes:</h3>

            <div className="mb-6">
              <div className="bg-gray-200 inline-block px-3 py-1 font-bold text-sm mb-2 rounded">
                O que é SESI Aventura Educativa?
              </div>
              <p className="text-sm text-red-800 font-medium">
                SESI Aventura educativa é um programa educativo que combina educação com atividades ao ar livre e desafios colaborativos.
              </p>
            </div>

            <div className="mb-6">
              <div className="bg-gray-200 inline-block px-3 py-1 font-bold text-sm mb-2 rounded">
                Público Alvo:
              </div>
              <p className="text-sm text-red-800 font-medium">
                O programa é destinado a estudantes do ensino fundamental e médio que desejam desenvolver habilidades de liderança e trabalho em equipe.
              </p>
            </div>

            <div className="mb-12">
              <div className="bg-gray-200 inline-block px-3 py-1 font-bold text-sm mb-2 rounded">
                Benefícios:
              </div>
              <p className="text-sm text-red-800 font-medium">
                Desenvolvimento de habilidades de liderança, trabalho em equipe, autoconfiança e contato com natureza.
              </p>
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
