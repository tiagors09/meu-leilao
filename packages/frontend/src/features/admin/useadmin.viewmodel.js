import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useAuth } from '../../context/useAuth'
import api, { apiEndpoints, getApiError } from '../../lib/api'
import { ADMIN_PAGE_SIZE, adminReducer, filterAdminRows, initialAdminState } from './admin.specs'

export function useAdminViewModel() {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(adminReducer, initialAdminState)
  const requestSequence = useRef({ overview: 0, users: 0, lots: 0, transactions: 0 })

  const loadOverview = useCallback(async () => {
    const requestId = ++requestSequence.current.overview
    dispatch({ type: 'request-started', key: 'loading' })
    try {
      const { data } = await api.get(apiEndpoints.admin.overview)
      if (requestId === requestSequence.current.overview) dispatch({ type: 'overview-loaded', metrics: data.metrics })
    } catch (error) {
      if (requestId === requestSequence.current.overview) dispatch({ type: 'request-failed', key: 'loading', message: getApiError(error, 'Nao foi possivel carregar as metricas.') })
    }
  }, [])

  const loadUsers = useCallback(async () => {
    const requestId = ++requestSequence.current.users
    dispatch({ type: 'request-started', key: 'usersLoading' })
    try {
      const { data } = await api.get(apiEndpoints.admin.users, {
        params: { search: state.usersSearch, page: state.usersPage, pageSize: ADMIN_PAGE_SIZE },
      })
      if (requestId === requestSequence.current.users) dispatch({ type: 'users-loaded', users: data.users, total: data.total })
    } catch (error) {
      if (requestId === requestSequence.current.users) dispatch({ type: 'request-failed', key: 'usersLoading', message: getApiError(error, 'Nao foi possivel carregar os usuarios.') })
    }
  }, [state.usersPage, state.usersSearch])

  const loadLots = useCallback(async () => {
    const requestId = ++requestSequence.current.lots
    dispatch({ type: 'request-started', key: 'lotsLoading' })
    try {
      const { data } = await api.get(apiEndpoints.admin.lots, {
        params: { search: state.lotsSearch, page: state.lotsPage, pageSize: ADMIN_PAGE_SIZE },
      })
      if (requestId === requestSequence.current.lots) dispatch({ type: 'lots-loaded', lots: data.lots, total: data.total })
    } catch (error) {
      if (requestId === requestSequence.current.lots) dispatch({ type: 'request-failed', key: 'lotsLoading', message: getApiError(error, 'Nao foi possivel carregar os lotes.') })
    }
  }, [state.lotsPage, state.lotsSearch])

  const loadTransactions = useCallback(async () => {
    const requestId = ++requestSequence.current.transactions
    dispatch({ type: 'request-started', key: 'transactionsLoading' })
    try {
      const { data } = await api.get(apiEndpoints.admin.transactions, {
        params: { page: state.transactionsPage, pageSize: ADMIN_PAGE_SIZE },
      })
      if (requestId === requestSequence.current.transactions) dispatch({ type: 'transactions-loaded', transactions: data.transactions, total: data.total })
    } catch (error) {
      if (requestId === requestSequence.current.transactions) dispatch({ type: 'request-failed', key: 'transactionsLoading', message: getApiError(error, 'Nao foi possivel carregar as liquidacoes.') })
    }
  }, [state.transactionsPage])

  useEffect(() => { void loadOverview() }, [loadOverview])
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers() }, 180)
    return () => window.clearTimeout(timer)
  }, [loadUsers])
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadLots() }, 180)
    return () => window.clearTimeout(timer)
  }, [loadLots])
  useEffect(() => { void loadTransactions() }, [loadTransactions])

  const changeUserRole = useCallback(async (id, role) => {
    dispatch({ type: 'role-change-started', id })
    try {
      await api.patch(apiEndpoints.admin.userRole(id), { role })
      dispatch({ type: 'notice', message: 'Papel do usuario atualizado.' })
      await Promise.all([loadUsers(), loadOverview()])
    } catch (error) {
      dispatch({ type: 'request-failed', key: 'pendingRoleId', message: getApiError(error, 'Nao foi possivel alterar o papel.') })
    } finally {
      dispatch({ type: 'role-change-finished' })
    }
  }, [loadOverview, loadUsers])

  const closeLot = useCallback(async () => {
    const lot = state.confirmLot
    if (!lot) return
    dispatch({ type: 'lot-close-started', id: lot.id })
    try {
      const { data } = await api.post(apiEndpoints.lots.close(lot.id))
      dispatch({ type: 'notice', message: data.receipt ? `Lote encerrado. Recibo ${data.receipt.share_code} criado.` : 'Lote encerrado sem lances.' })
      await Promise.all([loadLots(), loadOverview(), loadTransactions()])
    } catch (error) {
      dispatch({ type: 'request-failed', key: 'pendingLotId', message: getApiError(error, 'Nao foi possivel encerrar o lote.') })
    } finally {
      dispatch({ type: 'lot-close-finished' })
    }
  }, [loadLots, loadOverview, loadTransactions, state.confirmLot])

  const visibleUsers = useMemo(
    () => filterAdminRows(state.users, state.usersSearch, ['name', 'email', 'role']),
    [state.users, state.usersSearch],
  )
  const visibleLots = useMemo(
    () => filterAdminRows(state.lots, state.lotsSearch, ['title', 'status', 'seller_name', 'leading_bidder']),
    [state.lots, state.lotsSearch],
  )

  const changePage = useCallback((collection, page) => dispatch({ type: 'page-changed', collection, page }), [])
  const setActiveTab = useCallback((tab) => dispatch({ type: 'tab-changed', tab }), [])
  const setUsersSearch = useCallback((value) => dispatch({ type: 'users-search', value }), [])
  const setLotsSearch = useCallback((value) => dispatch({ type: 'lots-search', value }), [])
  const openLotConfirmation = useCallback((lot) => dispatch({ type: 'lot-confirmation-opened', lot }), [])
  const closeLotConfirmation = useCallback(() => dispatch({ type: 'lot-confirmation-closed' }), [])

  return {
    ...state,
    user,
    visibleUsers,
    visibleLots,
    changePage,
    changeUserRole,
    closeLot,
    setActiveTab,
    setUsersSearch,
    setLotsSearch,
    openLotConfirmation,
    closeLotConfirmation,
  }
}
