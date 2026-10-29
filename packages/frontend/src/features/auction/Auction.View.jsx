import { Badge, Button, Card, RouteLink } from '../../design-system'

function AuctionCard({ lot }) {
  return <Card as="article" className="overflow-hidden p-0 transition hover:-translate-y-1">
    <div className="relative grid aspect-[16/10] place-items-center border-b-2 border-black bg-[#DDD6FE]">
      {lot.image_url ? <img src={lot.image_url} alt="" className="size-full object-cover" /> : <span className="text-7xl" aria-hidden="true">◇</span>}
      <Badge tone={lot.statusTone} className="absolute left-3 top-3"><span className={lot.isLive ? 'animate-pulse' : ''}>●</span>{lot.statusLabel}</Badge>
    </div>
    <div className="p-5"><p className="text-xs font-black uppercase tracking-widest">Lote #{lot.numberLabel}</p><h3 className="mt-2 line-clamp-2 min-h-14 text-lg font-black">{lot.title}</h3><div className="mt-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold">{lot.metricLabel}</p><p className="mt-1 text-xl font-black">{lot.metricValue}</p></div><Button as={RouteLink} to={`/lote/${lot.id}`} tone="purple">{lot.isLive ? 'Participar ↗' : 'Ver lote ↗'}</Button></div><p className="mt-5 border-t-2 border-black pt-3 text-xs font-bold">{lot.dateLabel} {lot.dateValue}</p></div>
  </Card>
}

export default function AuctionView({ vm }) {
  return <div className="space-y-12">
    <section className="grid gap-8 border-2 border-black bg-[#DDD6FE] p-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div><Badge tone="green">● O proximo grande achado esta aqui</Badge><h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Dispute.<br />Conquiste.<br /><span className="underline decoration-4 underline-offset-4">Leve para casa.</span></h1><p className="mt-5 max-w-xl text-lg font-semibold leading-7">Pecas especiais, boas oportunidades e lances transparentes. Seu proximo achado esta a um lance de distancia.</p><a href="#lotes" className="mt-7 inline-block"><Button tone="yellow">Explorar lotes ↓</Button></a></div>
      <Card tone="yellow" className="rotate-1"><div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-widest">Disputa em andamento</p><Badge tone="green" className="animate-pulse">AO VIVO</Badge></div><div className="my-6 grid aspect-[1.5] place-items-center border-2 border-black bg-[#FECDD3]"><span className="text-8xl" aria-hidden="true">◈</span></div><p className="text-xl font-black">Objetos com historia, novos donos.</p><p className="mt-2 font-semibold">Uma experiencia segura do primeiro lance ao arremate.</p><p className="mt-5 border-t-2 border-black pt-4 text-sm font-black">AUTENTICIDADE SHA-256 ✓</p></Card>
    </section>

    <section id="lotes" className="scroll-mt-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.22em]">Selecao da semana</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Encontre seu proximo tesouro.</h2></div><p className="max-w-sm font-semibold">Acompanhe as disputas em tempo real e participe de onde estiver.</p></div>
      <div className="mt-7 flex flex-wrap gap-2">{vm.tabs.map((tab) => <Button key={tab.id} tone={vm.activeTab === tab.id ? tab.tone : 'white'} className="px-4" onClick={() => vm.setActiveTab(tab.id)}>{tab.label}<span className="border-2 border-black px-1.5">{vm.counts[tab.id]}</span></Button>)}</div>
      {vm.loading ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((id) => <div key={id} className="h-96 animate-pulse border-2 border-black bg-[#DDD6FE]" />)}</div> : vm.error ? <Card tone="pink" role="alert" className="mt-7">{vm.error}</Card> : vm.visibleLots.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{vm.visibleLots.map((lot) => <AuctionCard key={lot.id} lot={lot} />)}</div> : <Card tone="white" className="mt-7 py-14 text-center"><span className="text-4xl">⌕</span><h3 className="mt-4 text-xl font-black">Nenhum lote por aqui ainda</h3><p className="mt-2 font-semibold">Volte em breve para ver novas oportunidades.</p></Card>}
    </section>
  </div>
}
