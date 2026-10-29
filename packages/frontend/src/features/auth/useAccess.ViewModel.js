import { useState } from 'react'
import { accessInitialForm, accessModes } from './Auth.Specs'
import { useAuth } from '../../context/useAuth'

export function useAccessViewModel(onClose) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState(accessModes.LOGIN)
  const [form, setForm] = useState(accessInitialForm)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleMode() {
    setMode((current) => current === accessModes.LOGIN ? accessModes.SIGNUP : accessModes.LOGIN)
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === accessModes.LOGIN) await signIn({ email: form.email, password: form.password })
      else await signUp({ ...form, role: 'LICITANTE' })
      onClose()
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Nao foi possivel entrar agora.')
    } finally { setBusy(false) }
  }

  return {
    mode,
    form,
    error,
    busy,
    isLogin: mode === accessModes.LOGIN,
    updateField,
    toggleMode,
    submit,
  }
}
