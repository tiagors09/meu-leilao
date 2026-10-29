import { Button, Input, Modal } from '../../design-system'
import { useAccessViewModel } from './useAccess.ViewModel'

export default function AccessView({ open, onClose }) {
  const vm = useAccessViewModel(onClose)
  return <Modal open={open} onClose={onClose} eyebrow="Acesso seguro" title={vm.isLogin ? 'Entre na sua conta' : 'Crie sua conta'}>
    <form className="space-y-4" onSubmit={vm.submit}>
      {!vm.isLogin && <Input label="Nome" name="name" required autoComplete="name" value={vm.form.name} onChange={(event) => vm.updateField('name', event.target.value)} />}
      <Input label="Email" name="email" type="email" required autoComplete="email" value={vm.form.email} onChange={(event) => vm.updateField('email', event.target.value)} />
      <Input label="Senha" name="password" type="password" required minLength={8} autoComplete={vm.isLogin ? 'current-password' : 'new-password'} value={vm.form.password} onChange={(event) => vm.updateField('password', event.target.value)} />
      {vm.error && <p role="alert" className="border-2 border-black bg-[#FECDD3] p-3 text-sm font-bold">{vm.error}</p>}
      <Button type="submit" disabled={vm.busy} tone="yellow" className="w-full">{vm.busy ? 'Aguarde...' : vm.isLogin ? 'Entrar' : 'Criar conta'}</Button>
    </form>
    <Button tone="white" className="mt-4 w-full" onClick={vm.toggleMode}>{vm.isLogin ? 'Ainda nao tem conta? Cadastre-se' : 'Ja tem uma conta? Entre'}</Button>
  </Modal>
}
