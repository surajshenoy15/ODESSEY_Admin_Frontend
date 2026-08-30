import { useEffect, useState } from 'react'
import {
  Edit3,
  RefreshCw,
  UserPlus,
} from 'lucide-react'

import {
  apiGet,
  apiPatch,
  apiPost,
} from '../api/client'

import { StatusBadge } from '../components/StatusBadge'

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
} from '../components/ui'

import { useToast } from '../context/ToastContext'
import { formatDateTime } from '../utils/format'
import { roleLabels } from '../utils/roles'

const roles = [
  'SUPER_ADMIN',
  'REGISTRATION_ADMIN',
  'ATTENDANCE_ADMIN',
  'FIXTURE_ADMIN',
  'CERTIFICATE_ADMIN',
]

const blank = {
  name: '',
  email: '',
  password: '',
  role: 'REGISTRATION_ADMIN',
  is_active: true,
}

const emailPattern = /^\S+@\S+\.\S+$/

export default function AdminUsersPage() {
  const { notify } = useToast()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError('')

    try {
      const data = await apiGet('/admin/users')
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function create() {
    setEditing(null)
    setForm(blank)
    setOpen(true)
  }

  function edit(user) {
    setEditing(user)

    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active,
    })

    setOpen(true)
  }

  function closeModal() {
    if (saving) {
      return
    }

    setOpen(false)
    setEditing(null)
    setForm(blank)
  }

  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function save(event) {
    event.preventDefault()

    const normalizedName = form.name.trim()
    const normalizedEmail = form.email
      .trim()
      .toLowerCase()

    if (!normalizedName) {
      notify(
        'Enter the administrator’s full name.',
        'warning',
      )
      return
    }

    if (!emailPattern.test(normalizedEmail)) {
      notify(
        'Enter a valid administrator email address.',
        'warning',
      )
      return
    }

    if (!editing && !form.password) {
      notify(
        'Enter a temporary password for the new administrator.',
        'warning',
      )
      return
    }

    setSaving(true)

    try {
      if (editing) {
        const payload = {
          name: normalizedName,
          email: normalizedEmail,
          role: form.role,
          is_active: form.is_active,
        }

        if (form.password) {
          payload.password = form.password
        }

        await apiPatch(
          `/admin/users/${editing.id}`,
          payload,
        )
      } else {
        await apiPost('/admin/users', {
          name: normalizedName,
          email: normalizedEmail,
          password: form.password,
          role: form.role,
        })
      }

      notify(
        editing
          ? 'Admin account updated successfully.'
          : 'Admin account created successfully.',
        'success',
      )

      closeModal()
      await load()
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access control"
        title="Admin users"
        description="Create role-based accounts and disable access without deleting audit history."
        actions={(
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={load}
            >
              Refresh
            </Button>

            <Button
              icon={UserPlus}
              onClick={create}
            >
              Add admin
            </Button>
          </>
        )}
      />

      {loading ? (
        <LoadingState label="Loading admin users" />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={load}
        />
      ) : users.length === 0 ? (
        <Card>
          <EmptyState
            title="No admin users found"
            description="Create the first operational admin account."
          />
        </Card>
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'Admin',
                    'Role',
                    'Status',
                    'Last login',
                    'Created',
                    '',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="table-cell">
                      <p className="font-bold text-slate-950">
                        {user.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {user.email}
                      </p>
                    </td>

                    <td className="table-cell">
                      {roleLabels[user.role] || user.role}
                    </td>

                    <td className="table-cell">
                      <StatusBadge
                        status={
                          user.is_active
                            ? 'ACTIVE'
                            : 'INACTIVE'
                        }
                      />
                    </td>

                    <td className="table-cell whitespace-nowrap">
                      {formatDateTime(user.last_login_at)}
                    </td>

                    <td className="table-cell whitespace-nowrap">
                      {formatDateTime(user.created_at)}
                    </td>

                    <td className="table-cell text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => edit(user)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={
          editing
            ? 'Edit admin account'
            : 'Create admin account'
        }
        description="Assign only the access required for the administrator's responsibilities."
        size="md"
        footer={(
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              loading={saving}
              onClick={save}
            >
              {editing
                ? 'Save changes'
                : 'Create account'}
            </Button>
          </>
        )}
      >
        <form
          className="space-y-4"
          onSubmit={save}
        >
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => (
              update('name', event.target.value)
            )}
            required
          />

          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(event) => (
              update('email', event.target.value)
            )}
            required
          />

          <Select
            label="Role"
            value={form.role}
            onChange={(event) => (
              update('role', event.target.value)
            )}
          >
            {roles.map((role) => (
              <option
                key={role}
                value={role}
              >
                {roleLabels[role]}
              </option>
            ))}
          </Select>

          <Input
            label={
              editing
                ? 'New password (optional)'
                : 'Temporary password'
            }
            type="password"
            value={form.password}
            onChange={(event) => (
              update('password', event.target.value)
            )}
            hint={
              editing
                ? 'Leave blank to keep the existing password.'
                : 'The administrator can use this password to sign in.'
            }
            required={!editing}
          />

          {editing ? (
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => (
                  update(
                    'is_active',
                    event.target.checked,
                  )
                )}
                className="h-4 w-4 rounded text-brand-700"
              />

              Account active
            </label>
          ) : null}
        </form>
      </Modal>
    </div>
  )
}