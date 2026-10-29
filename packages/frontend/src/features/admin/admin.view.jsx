import { Link } from 'react-router-dom'
import { Badge, Button, Card, Input, Modal } from '../../design-system'
import api, { dateTime, money } from '../../lib/api'
import { ADMIN_PAGE_SIZE, ADMIN_ROLES, ADMIN_TABS } from './admin.specs'

function MetricCard({ title, value, tone = 'white', caption }) {
  return <Card tone={tone} className="min-h-32">
    <p className="text-xs font-black uppercase tracking-widest">{title}</p>
    <p className="mt-3 text-4xl font-black tabular-nums">{value}</p>
    {caption && <p className="mt-1 text-xs font-bold">{caption}</p>}
  </Card>
}

function Pagination({ page, total, onChange, busy }) {
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black p-4">
    <span className="text-sm font-bold">{total} registro(s) · pagina {page} de {pages}</span>
    <div className="flex gap-2">
      <Button tone="white" className="px-3 py-1.5 text-sm" disabled={busy || page <= 1} onClick={() => onChange(page - 1)}>Anterior</Button>
      <Button tone="white" className="px-3 py-1.5 text-sm" disabled={busy || page >= pages} onClick={() => onChange(page + 1)}>Proxima</Button>
    </div>
  </div>
}

function UsersPanel({ vm }) {
  return <Card className="overflow-hidden p-0">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-black p-5 sm:p-6">
      <div><Badge tone="purple">Acessos</Badge><h2 className="mt-3 text-2xl font-black">Gestao de usuarios</h2></div>
      <Input label="Buscar usuarios" name="admin-user-search" value={vm.usersSearch} onChange={(event) => vm.setUsersSearch(event.target.value)} placeholder="Nome ou email" className="w-full sm:max-w-sm" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-[#DDD6FE] text-xs uppercase tracking-wider"><tr>{['Usuario', 'Papel', 'Saldo total', 'Comprometido', 'Criado em'].map((heading) => <th key={heading} className="border-b-2 border-black px-5 py-4">{heading}</th>)}</tr></thead>
        <tbody>{vm.visibleUsers.map((row) => <tr key={row.id} className="border-b-2 border-black last:border-0">
          <td className="px-5 py-4"><p className="font-black">{row.name}</p><p className="mt-1 text-xs font-semibold">{row.email} · #{row.id}</p></td>
          <td className="px-5 py-4"><select aria-label={`Papel de ${row.name}`} value={row.role} disabled={vm.pendingRoleId === row.id || Number(row.id) === Number(vm.user.id)} onChange={(event) => vm.changeUserRole(row.id, event.target.value)} className="border-2 border-black bg-white px-3 py-2 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50">{ADMIN_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>{Number(row.id) === Number(vm.user.id) && <p className="mt-1 text-xs font-bold">Sua conta</p>}</td>
          <td className="px-5 py-4 font-bold">{money(row.balance_total)}</td>
          <td className="px-5 py-4 font-bold">{money(row.balance_pledged)}</td>
          <td className="px-5 py-4 font-semibold">{dateTime(row.created_at)}</td>
        </tr>)}</tbody>
      </table>
      {!vm.usersLoading && vm.visibleUsers.length === 0 && <p className="p-8 text-center font-bold">Nenhum usuario encontrado.</p>}
      {vm.usersLoading && <p className="p-8 text-center font-bold" role="status">Carregando usuarios...</p>}
    </div>
    <Pagination page={vm.usersPage} total={vm.usersTotal} onChange={(page) => vm.changePage('users', page)} busy={vm.usersLoading} />
  </Card>
}

function LotsPanel({ vm }) {
  return <div className="space-y-6">
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-black p-5 sm:p-6">
        <div><Badge tone="yellow">Operacao</Badge><h2 className="mt-3 text-2xl font-black">Gestao de lotes</h2></div>
        <Input label="Buscar lotes" name="admin-lot-search" value={vm.lotsSearch} onChange={(event) => vm.setLotsSearch(event.target.value)} placeholder="Titulo, leiloeiro ou status" className="w-full sm:max-w-sm" />
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-[#FEF08A] text-xs uppercase tracking-wider"><tr>{['Lote', 'Status', 'Lances', 'Lider / maior lance', 'Encerramento', 'Acoes'].map((heading) => <th key={heading} className="border-b-2 border-black px-4 py-4">{heading}</th>)}</tr></thead>
        <tbody>{vm.visibleLots.map((lot) => <tr key={lot.id} className="border-b-2 border-black last:border-0">
          <td className="px-4 py-4"><p className="font-black">{lot.title}</p><p className="mt-1 text-xs font-bold">#{lot.id} · Leiloeiro: {lot.seller_name}</p></td>
          <td className="px-4 py-4"><Badge tone={lot.status === 'LIVE' ? 'green' : lot.status === 'CLOSED' ? 'purple' : lot.status === 'CANCELLED' ? 'pink' : 'yellow'}>{lot.status}</Badge></td>
          <td className="px-4 py-4 text-center font-black">{lot.bids_count}</td>
          <td className="px-4 py-4"><p className="font-black">{lot.current_bid ? money(lot.current_bid) : 'Sem lances'}</p><p className="mt-1 text-xs font-semibold">{lot.leading_bidder || 'Sem lider'}</p></td>
          <td className="px-4 py-4 font-semibold">{dateTime(lot.end_time)}</td>
          <td className="px-4 py-4"><div className="flex items-center gap-2"><Button as={Link} to={`/lote/${lot.id}`} tone="white" className="px-3 py-1.5 text-xs">Abrir</Button>{!['CLOSED', 'CANCELLED'].includes(lot.status) && <Button tone="pink" className="px-3 py-1.5 text-xs" disabled={vm.pendingLotId === lot.id} onClick={() => vm.openLotConfirmation(lot)}>Encerrar</Button>}</div></td>
        </tr>)}</tbody>
      </table>
      {!vm.lotsLoading && vm.visibleLots.length === 0 && <p className="p-8 text-center font-bold">Nenhum lote encontrado.</p>}
      {vm.lotsLoading && <p className="p-8 text-center font-bold" role="status">Carregando lotes...</p>}</div>
      <Pagination page={vm.lotsPage} total={vm.lotsTotal} onChange={(page) => vm.changePage('lots', page)} busy={vm.lotsLoading} />
    </Card>
    <TransactionsPanel vm={vm} />
  </div>
}

function TransactionsPanel({ vm }) {
  return <Card className="overflow-hidden p-0">
    <div className="border-b-2 border-black p-5 sm:p-6"><Badge tone="green">Liquidacao</Badge><h2 className="mt-3 text-2xl font-black">Transacoes e recibos</h2></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
      <thead className="bg-[#D1FAE5] text-xs uppercase tracking-wider"><tr>{['Lote', 'Arrematante', 'Valor liquidado', 'Data', 'Recibo'].map((heading) => <th key={heading} className="border-b-2 border-black px-4 py-4">{heading}</th>)}</tr></thead>
      <tbody>{vm.transactions.map((transaction) => <tr key={transaction.id} className="border-b-2 border-black last:border-0"><td className="px-4 py-4 font-black">{transaction.lot_title} · #{transaction.lot_id}</td><td className="px-4 py-4"><p className="font-bold">{transaction.winner_name}</p><p className="text-xs">{transaction.winner_email}</p></td><td className="px-4 py-4 font-black">{money(transaction.amount)}</td><td className="px-4 py-4">{dateTime(transaction.created_at)}</td><td className="px-4 py-4"><a className="font-black underline" href={`${apiBase()}/receipts/${transaction.share_code}`} target="_blank" rel="noreferrer">Consultar</a></td></tr>)}</tbody>
      </table>
      {!vm.transactionsLoading && vm.transactions.length === 0 && <p className="p-8 text-center font-bold">Nenhuma liquidacao registrada.</p>}
      {vm.transactionsLoading && <p className="p-8 text-center font-bold" role="status">Carregando transacoes...</p>}</div>
    <Pagination page={vm.transactionsPage} total={vm.transactionsTotal} onChange={(page) => vm.changePage('transactions', page)} busy={vm.transactionsLoading} />
  </Card>
}

function apiBase() {
  return api.defaults.baseURL.replace(/\/+$/, '')
}

export default function AdminView({ vm }) {
  const metrics = vm.metrics || {}
  const metricCards = [
    ['Usuarios', metrics.users_total, 'white'],
    ['Administradores', metrics.admins_total, 'purple'],
    ['Leiloeiros', metrics.auctioneers_total, 'yellow'],
    ['Licitantes', metrics.bidders_total, 'green'],
    ['Lotes ativos', metrics.lots_live, 'green'],
    ['Lotes agendados', metrics.lots_scheduled, 'yellow'],
    ['Lotes encerrados', metrics.lots_closed, 'purple'],
    ['Lances registrados', metrics.bids_total, 'white'],
    ['Recibos emitidos', metrics.receipts_total, 'pink'],
    ['Total liquidado', money(metrics.settled_total), 'yellow'],
  ]

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><Badge tone="pink">Acesso administrativo</Badge><h1 className="mt-3 text-4xl font-black sm:text-5xl">Painel de controle</h1><p className="mt-2 font-semibold">Visao geral da operacao, usuarios, lotes e liquidacoes.</p></div><Badge tone="green">ADMIN · {vm.user.name}</Badge></header>
    {vm.error && <Card tone="pink" role="alert"><p className="font-black">Nao foi possivel concluir a operacao</p><p className="mt-1 font-semibold">{vm.error}</p></Card>}
    {vm.notice && <Card tone="green" role="status" className="font-bold">{vm.notice}</Card>}
    <div role="tablist" aria-label="Secoes do painel" className="flex flex-wrap gap-3">{ADMIN_TABS.map((tab) => <Button key={tab.id} role="tab" aria-selected={vm.activeTab === tab.id} tone={vm.activeTab === tab.id ? 'purple' : 'white'} onClick={() => vm.setActiveTab(tab.id)}>{tab.label}</Button>)}</div>
    {vm.activeTab === 'overview' && <section aria-label="Metricas gerais"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">Metricas gerais</h2>{vm.loading && <span role="status" className="text-sm font-bold">Atualizando...</span>}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{metricCards.map(([title, value, tone]) => <MetricCard key={title} title={title} value={value == null ? '—' : value} tone={tone} />)}</div></section>}
    {vm.activeTab === 'users' && <UsersPanel vm={vm} />}
    {vm.activeTab === 'lots' && <LotsPanel vm={vm} />}
    <Modal open={Boolean(vm.confirmLot)} onClose={vm.closeLotConfirmation} eyebrow="Acao administrativa" title="Encerrar este lote?">
      <p className="font-semibold">{vm.confirmLot?.title}. O encerramento liquida o lance vencedor, emite o recibo e nao pode ser desfeito.</p>
      <div className="mt-6 flex justify-end gap-3"><Button tone="white" onClick={vm.closeLotConfirmation}>Voltar</Button><Button tone="pink" disabled={vm.pendingLotId != null} onClick={vm.closeLot}>{vm.pendingLotId != null ? 'Encerrando...' : 'Confirmar encerramento'}</Button></div>
    </Modal>
  </div>
}
