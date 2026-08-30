import { useEffect, useMemo, useState } from 'react'
import { Filter, RefreshCw, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiGet, withQuery } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Pagination, Select } from '../components/ui'
import { formatCurrency, formatDateTime } from '../utils/format'

const pageSize = 12
export default function RegistrationsPage() {
  const [items, setItems] = useState([]); const [events, setEvents] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ search: '', status: '', payment_status: '', event_config_id: '', college: '' })

  async function load() {
    setLoading(true); setError('')
    try {
      const [rows, eventRows] = await Promise.all([apiGet(withQuery('/admin/registrations', filters)), apiGet('/admin/events')])
      setItems(rows); setEvents(eventRows); setPage(1)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const visible = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page])
  function update(key, value) { setFilters((current) => ({ ...current, [key]: value })) }
  function reset() { setFilters({ search: '', status: '', payment_status: '', event_config_id: '', college: '' }); setTimeout(load, 0) }

  return <div className="space-y-6">
    <PageHeader eyebrow="Registration operations" title="Team registrations" description="Search, filter and open every college team entry before taking approval action." actions={<Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>} />
    <Card className="p-4 sm:p-5">
      <form onSubmit={(e) => { e.preventDefault(); load() }} className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative xl:col-span-2"><Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" /><input className="field-control pl-10" value={filters.search} onChange={(e) => update('search', e.target.value)} placeholder="Registration code or PED email" aria-label="Search registrations" /></div>
        <Input value={filters.college} onChange={(e) => update('college', e.target.value)} placeholder="College name" aria-label="College filter" />
        <Select value={filters.status} onChange={(e) => update('status', e.target.value)} aria-label="Approval status"><option value="">All approval statuses</option>{['DRAFT','PAYMENT_PENDING','UNDER_REVIEW','CORRECTION_REQUIRED','APPROVED','REJECTED'].map((v) => <option key={v}>{v}</option>)}</Select>
        <Select value={filters.payment_status} onChange={(e) => update('payment_status', e.target.value)} aria-label="Payment status"><option value="">All payment statuses</option>{['UNPAID','PENDING','PAID','FAILED'].map((v) => <option key={v}>{v}</option>)}</Select>
        <Select value={filters.event_config_id} onChange={(e) => update('event_config_id', e.target.value)} aria-label="Event"><option value="">All events</option>{events.map((event) => <option key={event.id} value={event.id}>{event.sport_name} · {event.category}</option>)}</Select>
        <div className="flex gap-2 xl:col-span-6"><Button type="submit" icon={Filter}>Apply filters</Button><Button variant="ghost" onClick={reset}>Clear</Button></div>
      </form>
    </Card>

    {loading ? <LoadingState label="Loading registrations" /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? <Card><EmptyState title="No registrations found" description="Try removing one or more filters, or wait for PEDs to submit team registrations." /></Card> : <div className="table-shell">
      <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{['Registration','College','Team','Students','Fee','Payment','Approval','Created',''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
        {visible.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="table-cell"><p className="font-bold text-slate-950">{item.registration_code}</p><p className="mt-1 text-xs text-slate-400">{item.id.slice(0, 8)}</p></td><td className="table-cell"><p className="max-w-60 truncate font-semibold text-slate-900">{item.college_name}</p><p className="mt-1 max-w-60 truncate text-xs text-slate-500">{item.college_location || 'Location not provided'}</p></td><td className="table-cell">{item.team_name || '—'}</td><td className="table-cell">{item.students?.length || 0}</td><td className="table-cell whitespace-nowrap">{formatCurrency(item.fee_paise)}</td><td className="table-cell"><StatusBadge status={item.payment_status} /></td><td className="table-cell"><StatusBadge status={item.status} /></td><td className="table-cell whitespace-nowrap">{formatDateTime(item.created_at)}</td><td className="table-cell text-right"><Link to={`/registrations/${item.id}`} className="rounded-lg px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50">Review</Link></td></tr>)}
      </tbody></table></div><Pagination page={page} pageSize={pageSize} total={items.length} onPageChange={setPage} />
    </div>}
  </div>
}
