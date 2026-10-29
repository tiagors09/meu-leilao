import { useEffect, useMemo, useState } from 'react'
import api, { getApiError } from '../../lib/api'
import { auctionTabs } from './auction.specs'
import { dateTime, money } from '../../lib/api'

export function useAuctionViewModel() {
  const [lots, setLots] = useState([])
  const [activeTab, setActiveTab] = useState('LIVE')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.get('/lots').then(({ data }) => { if (mounted) setLots(data.lots || []) })
      .catch((requestError) => { if (mounted) setError(getApiError(requestError, 'Nao foi possivel carregar os lotes.')) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const counts = useMemo(() => Object.fromEntries(auctionTabs.map(({ id }) => [id, lots.filter((lot) => lot.status === id).length])), [lots])
  const visibleLots = useMemo(() => lots.filter((lot) => lot.status === activeTab).map((lot) => {
    const isLive = lot.status === 'LIVE'
    const isScheduled = lot.status === 'SCHEDULED'
    const tab = auctionTabs.find((item) => item.id === lot.status)
    return {
      ...lot,
      isLive,
      numberLabel: String(lot.id).padStart(4, '0'),
      statusLabel: tab?.stateLabel || lot.status,
      statusTone: tab?.tone || 'purple',
      metricLabel: isLive ? 'Lance inicial' : isScheduled ? 'Inicio previsto' : 'Preco inicial',
      metricValue: isScheduled ? dateTime(lot.start_time) : money(lot.initial_price),
      dateLabel: isLive ? 'Encerra' : isScheduled ? 'Abertura' : 'Encerrado',
      dateValue: dateTime(isLive || !isScheduled ? lot.end_time : lot.start_time),
    }
  }), [lots, activeTab])
  return { tabs: auctionTabs, lotsCount: lots.length, counts, activeTab, setActiveTab, visibleLots, loading, error }
}
