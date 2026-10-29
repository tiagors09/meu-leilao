import { Badge, Button, Card } from '../../design-system'
import { useAuth } from '../../context/useAuth'

function RestrictedAdminView({ authenticated }) {
  return <Card tone="pink" className="mx-auto max-w-2xl py-10 text-center">
    <Badge tone="pink">Area protegida</Badge>
    <h1 className="mt-4 text-3xl font-black">Acesso restrito</h1>
    <p className="mx-auto mt-3 max-w-lg font-semibold">
      {authenticated
        ? 'Seu perfil nao possui permissao de administrador para acessar este painel.'
        : 'Entre com uma conta de administrador para acessar o painel de controle.'}
    </p>
    <div className="mt-6 flex justify-center gap-3">
      {!authenticated && <Button tone="purple" onClick={() => window.dispatchEvent(new Event('verzel:show-access'))}>Entrar</Button>}
      <Button as="a" href="/" tone="white">Voltar para a vitrine</Button>
    </div>
  </Card>
}

export function AdminGuard({ children }) {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <RestrictedAdminView authenticated={Boolean(user)} />
  return children
}
