import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import api, { apiEndpoints, dateTime, getApiError, money } from '../../lib/api'
import { emptyLotForm } from './seller.specs'

export function useSellerViewModel() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [form, setForm] = useState(emptyLotForm)
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const canManage = ['LEILOEIRO', 'ADMIN'].includes(user?.role)

  const loadLots = useCallback(async () => {
    try {
      const { data } = await api.get(apiEndpoints.lots.collection)
      const details = await Promise.all((data.lots || []).map(async (lot) => {
        try { return (await api.get(apiEndpoints.lots.item(lot.id))).data } catch { return lot }
      }))
      setLots(details.map((lot) => ({ ...lot, closeable: canManage && !['CLOSED', 'CANCELLED'].includes(lot.status), closingDate: dateTime(lot.end_time), currentAmount: lot.current_bid?.amount ? money(lot.current_bid.amount) : 'Sem lances' })))
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel carregar os lotes.')) }
  }, [canManage])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadLots() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadLots])

  function updateQuery(value) { setQuery(value) }
  function selectItem(item) {
    setSelectedItem(item)
    setForm((current) => ({ ...current, title: item.title }))
  }
  function updateField(field, value) { setForm((current) => ({ ...current, [field]: value })) }

  async function searchItems(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const { data } = await api.get(apiEndpoints.items.search, { params: { q: query } })
      setItems(data.items || [])
      setNotice(data.items?.length ? `${data.items.length} item(ns) encontrado(s) no ${data.source === 'cache' ? 'cache' : 'catalogo externo'}.` : 'Nenhum item encontrado para esta busca.')
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel buscar itens.')) }
    finally { setLoading(false) }
  }

  async function createLot(event) {
    event.preventDefault()
    if (!selectedItem) { setError('Selecione um item do catalogo antes de cadastrar o lote.'); return }
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.post(apiEndpoints.lots.collection, {
        item_id: selectedItem.id,
        title: form.title || selectedItem.title,
        initial_price: form.initial_price,
        min_increment: form.min_increment,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      })
      setNotice('Lote cadastrado com sucesso.')
      setForm(emptyLotForm)
      setSelectedItem(null)
      await loadLots()
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel cadastrar o lote.')) }
    finally { setLoading(false) }
  }

  async function closeLot(lotId) {
    setError('')
    setNotice('')
    try {
      const { data } = await api.post(apiEndpoints.lots.close(lotId))
      setNotice(data.receipt ? `Lote encerrado. Comprovante: ${data.receipt.share_code}` : 'Lote encerrado sem lances vencedores.')
      await loadLots()
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel encerrar o lote.')) }
  }

  return { user, canManage, query, items, selectedItem, form, lots, loading, error, notice, selectItem, updateQuery, updateField, searchItems, createLot, closeLot, openAccess: () => window.dispatchEvent(new Event('verzel:show-access')) }
}
