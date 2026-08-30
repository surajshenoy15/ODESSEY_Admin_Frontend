import { useEffect, useMemo, useState } from 'react'
import { Filter, Mail, RefreshCw } from 'lucide-react'
import { apiGet, withQuery } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Pagination } from '../components/ui'
import { formatDateTime, humanize } from '../utils/format'

const pageSize = 15
export default function EmailLogsPage() {
  const [rows, setRows] = useState([]); const [messageType, setMessageType] = useState(''); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  async function load() { setLoading(true); setError(''); try { setRows(await apiGet(withQuery('/admin/email-logs', { message_type: messageType, limit: 500 }))); setPage(1) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const visible = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page])
  return <div className="space-y-6"><PageHeader eyebrow="Brevo communication" title="Email delivery logs" description="Review OTP, payment, approval, fixture and certificate email delivery status." actions={<Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>} /><Card className="p-4"><form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); load() }}><Input className="flex-1" value={messageType} onChange={(e) => setMessageType(e.target.value)} placeholder="Message type, e.g. REGISTRATION_APPROVED" aria-label="Message type" /><Button type="submit" icon={Filter}>Filter</Button></form></Card>
    {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : rows.length === 0 ? <Card><EmptyState icon={Mail} title="No email logs found" description="Brevo email attempts will appear here after OTP or workflow notifications are triggered." /></Card> : <div className="table-shell"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{['Time','Recipient','Message type','Subject','Status','Provider / error'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.map((row) => <tr key={row.id} className="align-top hover:bg-slate-50"><td className="table-cell whitespace-nowrap">{formatDateTime(row.created_at)}</td><td className="table-cell font-semibold">{row.recipient}</td><td className="table-cell">{humanize(row.message_type)}</td><td className="table-cell max-w-80">{row.subject}</td><td className="table-cell"><StatusBadge status={row.status} /></td><td className="table-cell max-w-80"><p className="break-all text-xs">{row.provider_message_id || 'No provider ID'}</p>{row.error_message ? <p className="mt-1 text-xs text-red-600">{row.error_message}</p> : null}</td></tr>)}</tbody></table></div><Pagination page={page} pageSize={pageSize} total={rows.length} onPageChange={setPage} /></div>}
  </div>
}
