import { useEffect, useMemo, useState } from 'react'
import { Filter, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiDelete, apiGet, withQuery } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Pagination,
  Select,
} from '../components/ui'
import { formatCurrency, formatDateTime } from '../utils/format'


const pageSize = 12


export default function RegistrationsPage() {
  const [items, setItems] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    payment_status: '',
    event_config_id: '',
    college: '',
  })

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)


  async function load() {
    setLoading(true)
    setError('')

    try {
      const [rows, eventRows] = await Promise.all([
        apiGet(
          withQuery(
            '/admin/registrations',
            filters
          )
        ),
        apiGet('/admin/events'),
      ])

      setItems(rows)
      setEvents(eventRows)
      setPage(1)

    } catch (err) {
      setError(err.message)

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    load()
  }, [])


  const visible = useMemo(
    () =>
      items.slice(
        (page - 1) * pageSize,
        page * pageSize
      ),
    [items, page]
  )


  function update(key, value) {
    setFilters(
      (current) => ({
        ...current,
        [key]: value,
      })
    )
  }


  function reset() {
    setFilters({
      search: '',
      status: '',
      payment_status: '',
      event_config_id: '',
      college: '',
    })

    setTimeout(
      load,
      0
    )
  }


  function openDelete(item) {
    setDeleteTarget(item)
    setDeleteConfirmation('')
    setDeleteError('')
  }


  function closeDelete() {
    if (deleting) {
      return
    }

    setDeleteTarget(null)
    setDeleteConfirmation('')
    setDeleteError('')
  }


  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }

    if (
      deleteConfirmation.trim() !==
      deleteTarget.registration_code
    ) {
      setDeleteError(
        'Type the exact registration code to confirm deletion.'
      )

      return
    }


    setDeleting(true)
    setDeleteError('')

    try {
      await apiDelete(
        `/admin/registrations/${deleteTarget.id}`
      )

      setDeleteTarget(null)
      setDeleteConfirmation('')

      await load()

    } catch (err) {
      const detail =
        err?.detail?.message ||
        err?.message ||
        'Unable to delete registration.'

      setDeleteError(
        detail
      )

    } finally {
      setDeleting(false)
    }
  }


  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registration operations"
        title="Team registrations"
        description="Search, filter and open every college team entry before taking approval action."
        actions={
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={load}
          >
            Refresh
          </Button>
        }
      />


      <Card className="p-4 sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"
        >
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />

            <input
              className="field-control pl-10"
              value={filters.search}
              onChange={(e) =>
                update(
                  'search',
                  e.target.value
                )
              }
              placeholder="Registration code or PED email"
              aria-label="Search registrations"
            />
          </div>


          <Input
            value={filters.college}
            onChange={(e) =>
              update(
                'college',
                e.target.value
              )
            }
            placeholder="College name"
            aria-label="College filter"
          />


          <Select
            value={filters.status}
            onChange={(e) =>
              update(
                'status',
                e.target.value
              )
            }
            aria-label="Approval status"
          >
            <option value="">
              All approval statuses
            </option>

            {[
              'DRAFT',
              'PAYMENT_PENDING',
              'UNDER_REVIEW',
              'CORRECTION_REQUIRED',
              'APPROVED',
              'REJECTED',
              'CANCELLED',
            ].map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              )
            )}
          </Select>


          <Select
            value={filters.payment_status}
            onChange={(e) =>
              update(
                'payment_status',
                e.target.value
              )
            }
            aria-label="Payment status"
          >
            <option value="">
              All payment statuses
            </option>

            {[
              'UNPAID',
              'PENDING',
              'PAID',
              'FAILED',
            ].map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              )
            )}
          </Select>


          <Select
            value={filters.event_config_id}
            onChange={(e) =>
              update(
                'event_config_id',
                e.target.value
              )
            }
            aria-label="Event"
          >
            <option value="">
              All events
            </option>

            {events.map(
              (event) => (
                <option
                  key={event.id}
                  value={event.id}
                >
                  {event.sport_name} · {event.category}
                </option>
              )
            )}
          </Select>


          <div className="flex gap-2 xl:col-span-6">
            <Button
              type="submit"
              icon={Filter}
            >
              Apply filters
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={reset}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>


      {loading ? (
        <LoadingState label="Loading registrations" />

      ) : error ? (
        <ErrorState
          message={error}
          onRetry={load}
        />

      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            title="No registrations found"
            description="Try removing one or more filters, or wait for coordinators to submit team registrations."
          />
        </Card>

      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'Registration',
                    'College',
                    'Team',
                    'Students',
                    'Fee',
                    'Payment',
                    'Approval',
                    'Created',
                    'Actions',
                  ].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>


              <tbody className="divide-y divide-slate-100">
                {visible.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="table-cell">
                        <p className="font-bold text-slate-950">
                          {item.registration_code}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.id.slice(0, 8)}
                        </p>
                      </td>


                      <td className="table-cell">
                        <p className="max-w-60 truncate font-semibold text-slate-900">
                          {item.college_name}
                        </p>

                        <p className="mt-1 max-w-60 truncate text-xs text-slate-500">
                          {item.college_location || 'Location not provided'}
                        </p>
                      </td>


                      <td className="table-cell">
                        {item.team_name || '—'}
                      </td>

                      <td className="table-cell">
                        {item.students?.length || 0}
                      </td>

                      <td className="table-cell whitespace-nowrap">
                        {formatCurrency(item.fee_paise)}
                      </td>

                      <td className="table-cell">
                        <StatusBadge status={item.payment_status} />
                      </td>

                      <td className="table-cell">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="table-cell whitespace-nowrap">
                        {formatDateTime(item.created_at)}
                      </td>


                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/registrations/${item.id}`}
                            className="rounded-lg px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"
                          >
                            Review
                          </Link>


                          {item.status !== 'CANCELLED' ? (
                            <button
                              type="button"
                              onClick={() =>
                                openDelete(item)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>


          <Pagination
            page={page}
            pageSize={pageSize}
            total={items.length}
            onPageChange={setPage}
          />
        </div>
      )}


      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-registration-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">
                  Delete registration
                </p>

                <h2
                  id="delete-registration-title"
                  className="mt-2 text-2xl font-black text-slate-950"
                >
                  Remove this registration?
                </h2>
              </div>


              <button
                type="button"
                onClick={closeDelete}
                disabled={deleting}
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close delete dialog"
              >
                <X size={18} />
              </button>
            </div>


            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="font-bold text-slate-950">
                {deleteTarget.registration_code}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {deleteTarget.college_name}
                {deleteTarget.team_name
                  ? ` · ${deleteTarget.team_name}`
                  : ''}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={deleteTarget.payment_status} />
                <StatusBadge status={deleteTarget.status} />
              </div>
            </div>


            <p className="mt-5 text-sm leading-6 text-slate-600">
              This removes the registration from active operations and revokes its QR codes.
              Payment and audit history are preserved. Registrations with attendance or certificate history cannot be deleted.
            </p>


            <label className="mt-5 block text-sm font-bold text-slate-800">
              Type the registration code to confirm

              <input
                className="field-control mt-2"
                value={deleteConfirmation}
                onChange={(e) => {
                  setDeleteConfirmation(e.target.value)
                  setDeleteError('')
                }}
                placeholder={deleteTarget.registration_code}
                autoComplete="off"
              />
            </label>


            {deleteError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {deleteError}
              </div>
            ) : null}


            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDelete}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={confirmDelete}
                disabled={
                  deleting ||
                  deleteConfirmation.trim() !==
                    deleteTarget.registration_code
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleting
                  ? 'Deleting…'
                  : 'Delete registration'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
