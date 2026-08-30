import { useEffect, useState } from 'react'
import { Archive, CalendarPlus, Edit3, ImageUp, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select, Textarea } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDate, fromDateTimeLocal, toDateTimeLocal } from '../utils/format'

const blank = {
  sport_name: '', event_type: 'SPORTS', category: 'PU Boys', description: '', fee_rupees: '', team_min_size: 1, team_max_size: 1,
  max_substitutes: 0, registration_opens_at: '', registration_closes_at: '', event_date: '', venue: '', reporting_instructions: '',
  is_registration_open: true, is_active: true, poster: null,
}

export default function EventsPage() {
  const [events, setEvents] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState(null); const [form, setForm] = useState(blank); const [saving, setSaving] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null); const [deleting, setDeleting] = useState(false)
  const { notify } = useToast()

  async function load() { setLoading(true); setError(''); try { setEvents(await apiGet('/admin/events')) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const update = (key, value) => setForm((v) => ({ ...v, [key]: value }))
  function startCreate() { setEditing(null); setForm(blank); setOpen(true) }
  function startEdit(event) {
    setEditing(event); setForm({ ...blank, ...event, fee_rupees: event.fee_paise / 100, description: event.description || '', venue: event.venue || '', reporting_instructions: event.reporting_instructions || '', registration_opens_at: toDateTimeLocal(event.registration_opens_at), registration_closes_at: toDateTimeLocal(event.registration_closes_at), event_date: toDateTimeLocal(event.event_date), poster: null }); setOpen(true)
  }
  async function save(e) {
    e?.preventDefault(); if (!form.sport_name.trim() || Number(form.team_max_size) < Number(form.team_min_size)) { notify('Enter an event name and a valid team-size range.', 'warning'); return }
    const payload = { sport_name: form.sport_name.trim(), event_type: form.event_type, category: form.category, description: form.description || null, fee_paise: Math.round(Number(form.fee_rupees || 0) * 100), team_min_size: Number(form.team_min_size), team_max_size: Number(form.team_max_size), max_substitutes: Number(form.max_substitutes), registration_opens_at: fromDateTimeLocal(form.registration_opens_at), registration_closes_at: fromDateTimeLocal(form.registration_closes_at), event_date: fromDateTimeLocal(form.event_date), venue: form.venue || null, reporting_instructions: form.reporting_instructions || null, is_registration_open: form.is_registration_open, is_active: form.is_active }
    setSaving(true)
    try {
      const saved = editing ? await apiPatch(`/admin/events/${editing.id}`, payload) : await apiPost('/admin/events', payload)
      if (form.poster) { const body = new FormData(); body.append('file', form.poster); await apiPost(`/admin/events/${saved.id}/poster`, body) }
      notify(editing ? 'Event updated.' : 'Event created.', 'success'); setOpen(false); setEditing(null); await load()
    } catch (err) { notify(err.message, 'error') } finally { setSaving(false) }
  }
  async function toggleArchiveEvent(event) { try { await apiPatch(`/admin/events/${event.id}`, { is_active: !event.is_active, is_registration_open: event.is_active ? false : event.is_registration_open }); notify(event.is_active ? 'Event archived.' : 'Event restored.', 'success'); await load() } catch (err) { notify(err.message, 'error') } }
  async function deleteEvent() { if (!eventToDelete) return; setDeleting(true); try { await apiDelete(`/admin/events/${eventToDelete.id}`); notify('Event deleted.', 'success'); setEventToDelete(null); await load() } catch (err) { setEventToDelete(null); notify(err.status === 409 ? 'This event has related records. Archive it instead.' : err.message, err.status === 409 ? 'warning' : 'error') } finally { setDeleting(false) } }

  return <div className="space-y-6">
    <PageHeader eyebrow="Dynamic event configuration" title="Sports & cultural events" description="Control events shown on the BNMIT ODYSSEY public site, registration rules, dates, fees and event posters." actions={<><Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button><Button icon={CalendarPlus} onClick={startCreate}>Add event</Button></>} />
    {loading ? <LoadingState label="Loading events" /> : error ? <ErrorState message={error} onRetry={load} /> : events.length === 0 ? <Card><EmptyState title="No events configured" description="Create the first sports or cultural event." action={<Button icon={CalendarPlus} onClick={startCreate}>Add event</Button>} /></Card> : <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{events.map((event) => <Card key={event.id} className="flex flex-col overflow-hidden">
      {event.poster_path ? <div className="h-36 bg-slate-100 p-5 text-xs font-semibold text-slate-500">Poster uploaded to event-media storage</div> : null}
      <div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-accent-600">{event.event_type} · {event.category}</p><h2 className="mt-1 text-xl font-black text-brand-950">{event.sport_name}</h2></div><StatusBadge status={event.is_active ? 'ACTIVE' : 'INACTIVE'} /></div>
      {event.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{event.description}</p> : null}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Fee</p><p className="mt-1 font-bold">{formatCurrency(event.fee_paise)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Team size</p><p className="mt-1 font-bold">{event.team_min_size}-{event.team_max_size}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Event date</p><p className="mt-1 font-bold">{formatDate(event.event_date)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Registration</p><div className="mt-1"><StatusBadge status={event.is_registration_open ? 'ACTIVE' : 'INACTIVE'} /></div></div></div>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-200 pt-4"><Button variant="secondary" size="sm" icon={Edit3} onClick={() => startEdit(event)}>Edit</Button><Button variant="secondary" size="sm" icon={event.is_active ? Archive : RotateCcw} onClick={() => toggleArchiveEvent(event)}>{event.is_active ? 'Archive' : 'Restore'}</Button><Button variant="danger" size="sm" icon={Trash2} onClick={() => setEventToDelete(event)}>Delete</Button></div></div>
    </Card>)}</div>}

    <Modal open={open} onClose={() => !saving && setOpen(false)} title={editing ? 'Edit event' : 'Create event'} description="One configuration represents one event and one category." size="xl" footer={<><Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button loading={saving} onClick={save}>{editing ? 'Save changes' : 'Create event'}</Button></>}>
      <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
        <Select label="Event type" value={form.event_type} onChange={(e) => update('event_type', e.target.value)}><option value="SPORTS">Sports</option><option value="CULTURAL">Cultural</option></Select>
        <Input label="Event name" value={form.sport_name} onChange={(e) => update('sport_name', e.target.value)} placeholder={form.event_type === 'CULTURAL' ? 'Battle of Bands' : 'Volleyball'} required />
        <Select label="Category" value={form.category} onChange={(e) => update('category', e.target.value)}>{['PU Boys','PU Girls','Engineering Boys','Engineering Girls'].map((v) => <option key={v}>{v}</option>)}</Select>
        <Input label="Fee in rupees" type="number" min="0" value={form.fee_rupees} onChange={(e) => update('fee_rupees', e.target.value)} required />
        <Input label="Minimum team size" type="number" min="1" max="100" value={form.team_min_size} onChange={(e) => update('team_min_size', e.target.value)} required />
        <Input label="Maximum team size" type="number" min="1" max="100" value={form.team_max_size} onChange={(e) => update('team_max_size', e.target.value)} required />
        <Input label="Maximum substitutes" type="number" min="0" max="50" value={form.max_substitutes} onChange={(e) => update('max_substitutes', e.target.value)} />
        <Input label="Venue" value={form.venue} onChange={(e) => update('venue', e.target.value)} placeholder="BNMIT campus / sports ground" />
        <Input label="Registration opens" type="datetime-local" value={form.registration_opens_at} onChange={(e) => update('registration_opens_at', e.target.value)} />
        <Input label="Registration closes" type="datetime-local" value={form.registration_closes_at} onChange={(e) => update('registration_closes_at', e.target.value)} />
        <Input label="Event date and time" type="datetime-local" value={form.event_date} onChange={(e) => update('event_date', e.target.value)} />
        <div><label className="field-label" htmlFor="event-poster">Event poster / cover image</label><div className="relative"><ImageUp className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" /><input id="event-poster" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => update('poster', e.target.files?.[0] || null)} className="field-control pl-10 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-brand-800" /></div></div>
        <Textarea className="md:col-span-2" label="Public description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Event overview, eligibility and highlights" />
        <Textarea className="md:col-span-2" label="Reporting instructions" value={form.reporting_instructions} onChange={(e) => update('reporting_instructions', e.target.value)} placeholder="Reporting time, gate, original bonafide requirement and help-desk instructions" />
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold"><input type="checkbox" checked={form.is_registration_open} onChange={(e) => update('is_registration_open', e.target.checked)} className="h-4 w-4 rounded text-brand-700" />Registration open</label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 rounded text-brand-700" />Active and public</label>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(eventToDelete)} onClose={() => setEventToDelete(null)} onConfirm={deleteEvent} loading={deleting} title="Delete event?" description={eventToDelete ? `${eventToDelete.sport_name} · ${eventToDelete.category}` : ''} confirmLabel="Delete event" />
  </div>
}
