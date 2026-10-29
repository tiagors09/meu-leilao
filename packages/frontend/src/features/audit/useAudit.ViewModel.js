import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api, { dateTime, getApiError, money } from '../../lib/api'
import { auditLoadError } from './Audit.Specs'

export function useAuditViewModel(lotId) {
  const [audit, setAudit] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    api.get(`/lots/${lotId}/audit`).then(({ data }) => { if (active) setAudit(data) })
      .catch((requestError) => { if (active) setError(getApiError(requestError, auditLoadError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [lotId])

  const entries = (audit?.chain || []).map((entry, index) => ({ ...entry, order: index + 1, amountLabel: money(entry.amount), dateLabel: dateTime(entry.created_at), integrityLabel: entry.is_valid ? 'Elo valido' : 'Elo invalido' }))
  return { lotId, audit, entries, error, loading, isValid: Boolean(audit?.is_valid) }
}

export function useAuditRouteViewModel() {
  const { id } = useParams()
  return useAuditViewModel(id)
}
