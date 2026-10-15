import { useNavigate } from 'react-router-dom';

export default function Authorizations() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex flex-col">
      <header className="bg-[#2A2A2A] text-white flex justify-between items-center px-4 py-2">
        <span className="font-bold italic bg-red-600 px-2 py-1">SESI SENAI</span>
        <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-bold">SAIR</button>
      </header>

      <div className="flex-1 bg-[#F8E9EB] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600">Autorizações</h1>
          <p className="text-sm text-red-600 mb-8">Gerencie suas autorizações e documentos</p>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <p className="font-medium text-sm mb-4">
              Informação: Aqui você poderá gerenciar todas as suas autorizações necessárias para participar do programa.
            </p>
            
            <h4 className="font-medium text-sm mb-2">Documentos Necessários:</h4>
            <ul className="list-disc list-inside text-sm font-medium mb-12">
              <li>Termo de Consentimento</li>
              <li>Autorização de Responsável</li>
              <li>Termo de Uso de Imagem</li>
            </ul>

            <button onClick={() => navigate('/home')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
