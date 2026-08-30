import { useEffect, useState } from 'react'
import { BadgeCheck, ClipboardCheck, FileBadge, IndianRupee, RefreshCw, ScanLine, UsersRound, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiGet } from '../api/client'
import { MetricCard } from '../components/MetricCard'
import { StatusBadge } from '../components/StatusBadge'
import { Button, Card, ErrorState, LoadingState, PageHeader } from '../components/ui'
import { formatCurrency, formatDateTime } from '../utils/format'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const [summary, recent] = await Promise.all([apiGet('/admin/dashboard'), apiGet('/admin/registrations')])
      setStats(summary); setRegistrations(recent.slice(0, 6))
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <LoadingState label="Loading operations overview" />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Operations overview" title="Admin dashboard" description="Monitor registrations, approvals, attendance and certificates from one place." actions={<Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total registrations" value={stats.total_registrations} icon={ClipboardCheck} helper="All submitted and draft team entries" to="/registrations" />
        <MetricCard label="Paid registrations" value={stats.paid_registrations} icon={IndianRupee} tone="green" helper="Payment confirmed by Razorpay" to="/registrations" />
        <MetricCard label="Under review" value={stats.under_review} icon={UsersRound} tone="amber" helper="Require document and roster review" to="/registrations" />
        <MetricCard label="Approved" value={stats.approved} icon={BadgeCheck} tone="green" helper="QR released to PED" to="/registrations" />
        <MetricCard label="Rejected" value={stats.rejected} icon={XCircle} tone="red" helper="Entries rejected with recorded reason" to="/registrations" />
        <MetricCard label="Attendance verified" value={stats.attendance_verified} icon={ScanLine} tone="blue" helper="Teams with completed student attendance" to="/attendance" />
        <MetricCard label="Present students" value={stats.present_students} icon={UsersRound} tone="violet" helper="Certificate-eligible participants" to="/attendance" />
        <MetricCard label="Certificates published" value={stats.certificates_published} icon={FileBadge} tone="green" helper="Available in PED dashboards" to="/certificates" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_.7fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="section-title">Recent registrations</h2><p className="section-copy">Latest team entries across all events and categories.</p></div><Link to="/registrations" className="text-sm font-bold text-brand-700 hover:text-brand-900">View all</Link></div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50"><tr>{['Registration','College','Students','Amount','Status','Created'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="table-cell"><Link className="font-bold text-brand-700 hover:underline" to={`/registrations/${item.id}`}>{item.registration_code}</Link></td><td className="table-cell"><p className="max-w-56 truncate font-semibold text-slate-900">{item.college_name}</p></td><td className="table-cell">{item.students?.length || 0}</td><td className="table-cell">{formatCurrency(item.fee_paise)}</td><td className="table-cell"><StatusBadge status={item.status} /></td><td className="table-cell whitespace-nowrap">{formatDateTime(item.created_at)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="section-title">Recommended next actions</h2><p className="section-copy">Work is prioritised by operational risk.</p>
          <div className="mt-5 space-y-3">
            {[
              { title: 'Review paid teams', copy: `${stats.under_review} registration(s) are waiting for validation.`, to: '/registrations', icon: ClipboardCheck },
              { title: 'Prepare attendance', copy: 'Confirm scanner access and gate assignments before event day.', to: '/attendance', icon: ScanLine },
              { title: 'Check certificate eligibility', copy: `${stats.present_students} present student(s) can receive certificates.`, to: '/certificates', icon: FileBadge },
            ].map(({ title, copy, to, icon: Icon }) => <Link key={title} to={to} className="group flex gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:bg-brand-50"><div className="h-fit rounded-xl bg-brand-100 p-2 text-brand-700"><Icon className="h-4 w-4" /></div><div><p className="text-sm font-bold text-slate-900 group-hover:text-brand-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p></div></Link>)}
          </div>
        </Card>
      </div>
    </div>
  )
}
