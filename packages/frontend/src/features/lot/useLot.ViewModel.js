import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import api, { dateTime, getApiError, money } from '../../lib/api'
import { DEFAULT_BID_ERROR, DEFAULT_LOT_ERROR, LOT_POLL_INTERVAL_MS } from './Lot.Specs'

function getMinimumBid(lot) {
  const current = Number(lot.current_bid?.amount ?? lot.initial_price)
  return current + (lot.current_bid ? Number(lot.min_increment) : 0)
}

function getCountdown(endTime, now) {
  const remaining = new Date(endTime).getTime() - now
  if (remaining <= 0) return '00:00:00'
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

export function useLotViewModel(lotId) {
  const { user } = useAuth()
  const [lot, setLot] = useState(null)
  const [now, setNow] = useState(0)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async (initial = false) => {
    try {
      const { data } = await api.get(`/lots/${lotId}`)
      setLot(data)
      setError('')
      const next = getMinimumBid(data)
      setAmount((current) => initial || !current || Number(current) < next ? next.toFixed(2) : current)
    } catch (requestError) {
      setError(getApiError(requestError, DEFAULT_LOT_ERROR))
    } finally { if (initial) setLoading(false) }
  }, [lotId])

  useEffect(() => {
    const initial = window.setTimeout(() => { void refresh(true) }, 0)
    const poll = window.setInterval(() => { void refresh() }, LOT_POLL_INTERVAL_MS)
    const clock = window.setInterval(() => setNow(Date.now()), 1000)
    return () => { window.clearTimeout(initial); window.clearInterval(poll); window.clearInterval(clock) }
  }, [refresh])

  const isLeader = Boolean(user && lot?.current_bid && Number(lot.current_bid.bidder_id) === Number(user.id))
  const isLive = Boolean(lot?.status === 'LIVE' && new Date(lot.start_time) <= new Date() && new Date(lot.end_time) > new Date())

  async function placeBid(event) {
    event.preventDefault()
    setBidding(true)
    setError('')
    setNotice('')
    try {
      await api.post(`/lots/${lotId}/bids`, { amount })
      setNotice('Seu lance foi registrado com seguranca.')
      await refresh()
    } catch (requestError) {
      setError(getApiError(requestError, DEFAULT_BID_ERROR))
    } finally { setBidding(false) }
  }

  return {
    lot,
    user,
    now,
    amount,
    setAmount,
    loading,
    bidding,
    error,
    notice,
    isLeader,
    isLive,
    currentPrice: lot?.current_bid?.amount || lot?.initial_price,
    minimum: lot ? getMinimumBid(lot).toFixed(2) : '0.00',
    countdown: lot && now ? getCountdown(lot.end_time, now) : '--:--:--',
    currentPriceLabel: lot ? money(lot.current_bid?.amount || lot.initial_price) : '',
    minimumLabel: lot ? money(getMinimumBid(lot)) : '',
    incrementLabel: lot ? money(lot.min_increment) : '',
    createdLabel: lot ? dateTime(lot.created_at) : '',
    endLabel: lot ? dateTime(lot.end_time) : '',
    placeBid,
    openAccess: () => window.dispatchEvent(new Event('verzel:show-access')),
  }
}

export function useLotRouteViewModel() {
  const { id } = useParams()
  return useLotViewModel(id)
}
