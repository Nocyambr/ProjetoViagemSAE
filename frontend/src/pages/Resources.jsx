import { useNavigate } from 'react-router-dom';
import PreparationChecklist from '../components/PreparationChecklist';

export default function Resources() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#F8E9EB] flex flex-col">

      <div className="flex-1 bg-[#F8E9EB] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600">Recursos</h1>
          <p className="text-sm text-red-600 mb-8">Recursos disponíveis para o programa</p>
          <figure className="mb-6 overflow-hidden rounded-3xl bg-emerald-950 shadow-sm">
            <img src="/images/mochila-de-possibilidades.webp" alt="Ilustração de uma mochila que se transforma em um mundo de trilhas, mapas e descobertas" width="1536" height="1024" loading="lazy" className="h-56 sm:h-72 w-full object-cover" />
            <figcaption className="px-6 py-4 text-sm font-medium text-white">Uma mochila. Mil possibilidades de descobrir.</figcaption>
          </figure>

          <PreparationChecklist />
          <p className="mt-5 text-sm text-gray-600">Confirme com a escola a relação de itens e documentos de cada atividade.</p>
          <button onClick={() => navigate('/home')} className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-bold text-white">Voltar ao início</button>
        </div>
      </div>
    </div>
  );
}
