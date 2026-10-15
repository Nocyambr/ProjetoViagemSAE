import { useNavigate } from 'react-router-dom';

export default function Authorizations() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#F8E9EB] flex flex-col">

      <div className="flex-1 bg-[#F8E9EB] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600">Autorizações</h1>
          <p className="text-sm text-red-600 mb-8">Confira a documentação da atividade</p>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <p className="font-medium text-sm mb-4">
              Consulte a escola para receber os modelos oficiais e as orientações de entrega. Esta demonstração não recebe documentos nem registra autorizações.
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
