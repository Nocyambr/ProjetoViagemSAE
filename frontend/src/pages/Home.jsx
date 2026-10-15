import { Link } from 'react-router-dom';
import { useState } from 'react';
import PreparationChecklist from '../components/PreparationChecklist';
import { loadTrips, filterTrips } from '../lib/trips.js';

export default function Home() {
  const [initial] = useState(() => loadTrips());
  const upcoming = filterTrips(initial.trips, '', 'upcoming');
  const next = upcoming[0];

  return (
    <div className="min-h-full bg-[#F8E9EB] text-gray-800 font-sans">
      {/* Header */}

      {/* Banner Image Area */}
      <div className="w-full max-w-6xl mx-auto mt-4 px-4">
        <section className="creative-hero" aria-labelledby="aventura-title">
          <div className="creative-hero-art"><img src="/images/mundo-de-descobertas.webp" alt="Ilustração de um mundo de aventuras que nasce de um caderno, com floresta, ônibus e observatório" width="2048" height="1024" fetchPriority="high" /></div>
          <div className="creative-hero-copy">
            <span className="expedition-label">Caderno de descobertas · SESI</span>
            <h1 id="aventura-title">O mundo é nossa<br /><em>sala de aula.</em></h1>
            <p>Da primeira pergunta à próxima descoberta: prepare-se para aprender além dos muros da escola.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/data-horarios" className="rounded-xl bg-[#f6c45b] px-5 py-3 text-sm font-bold text-emerald-950 shadow-sm hover:bg-[#ffda8d]">Planejar minha aventura ↗</Link>
              <Link to="/recursos" className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Preparar a mochila</Link>
            </div>
            <p className="hero-signature">P.T.S · Programa de Turismo SESI</p>
          </div>
        </section>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-emerald-950 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Sua próxima descoberta</p>
            <h2 className="mt-3 text-xl font-bold">{next ? next.title : 'Vamos planejar uma viagem?'}</h2>
            <p className="mt-3 text-sm text-emerald-100">{next ? `${next.date.split('-').reverse().join('/')} · Saída às ${next.departure}` : 'Adicione uma viagem no cronograma para organizar as próximas atividades.'}</p>
            <p className="mt-3 text-sm">{upcoming.length} {upcoming.length === 1 ? 'viagem a partir de hoje' : 'viagens a partir de hoje'}</p>
            <Link to="/data-horarios" className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-950">Abrir cronograma →</Link>
            {initial.error && <p className="mt-3 text-xs text-amber-200">Resumo indisponível: não foi possível ler as viagens salvas.</p>}
          </section>
          <PreparationChecklist />
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
            <h3 className="text-2xl mb-1">Seu mapa de descobertas</h3>
            <p className="text-xs text-gray-500 mb-4">Escolha a próxima parada da sua aventura.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/professores" className="image-section-card" style={{ '--card-image': 'url(/images/laboratorio-de-curiosidades.webp)' }}>
                <span>Professores Responsáveis<small className="mt-1 block text-xs font-normal text-white/85">Quem acompanha a jornada</small></span><span aria-hidden="true" className="ml-3 text-2xl">↗</span>
              </Link>
              <Link to="/autorizacoes" className="image-section-card" style={{ '--card-image': 'url(/images/mochila-de-possibilidades.webp)' }}>
                <span>Autorizações<small className="mt-1 block text-xs font-normal text-white/85">Documentos para conferir</small></span><span aria-hidden="true" className="ml-3 text-2xl">↗</span>
              </Link>
              <Link to="/informacoes-extras" className="image-section-card" style={{ '--card-image': 'url(/images/mundo-de-descobertas.webp)' }}>
                <span>Informações extras<small className="mt-1 block text-xs font-normal text-white/85">Descubra o programa</small></span><span aria-hidden="true" className="ml-3 text-2xl">↗</span>
              </Link>
              <Link to="/data-horarios" className="image-section-card" style={{ '--card-image': 'url(/images/mundo-de-descobertas.webp)' }}>
                <span>Data e Hora<small className="mt-1 block text-xs font-normal text-white/85">Organize sua próxima parada</small></span><span aria-hidden="true" className="ml-3 text-2xl">↗</span>
              </Link>
              <Link to="/locomocoes" className="image-section-card" style={{ '--card-image': 'url(/images/laboratorio-de-curiosidades.webp)' }}>
                <span>Locomoções<small className="mt-1 block text-xs font-normal text-white/85">Como chegar à aventura</small></span><span aria-hidden="true" className="ml-3 text-2xl">↗</span>
              </Link>
              <Link to="/recursos" className="image-section-card" style={{ '--card-image': 'url(/images/mochila-de-possibilidades.webp)' }}>
                <span>Recursos<small className="mt-1 block text-xs font-normal text-white/85">Prepare o seu kit</small></span><span aria-hidden="true" className="ml-3 text-2xl">↗</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
