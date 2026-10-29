import { useMemo, useState } from 'react'
import { AuthContext } from './authContextValue'
import api, { apiEndpoints } from '../lib/api'


export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('leilao_user') || 'null') } catch { return null }
  })

  async function signIn(credentials) {
    const { data } = await api.post(apiEndpoints.users.login, credentials)
    localStorage.setItem('leilao_token', data.token)
    localStorage.setItem('leilao_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  async function signUp(account) {
    const { data } = await api.post(apiEndpoints.users.register, account)
    localStorage.setItem('leilao_token', data.token)
    localStorage.setItem('leilao_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  function signOut() {
    localStorage.removeItem('leilao_token')
    localStorage.removeItem('leilao_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, signIn, signUp, signOut }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
