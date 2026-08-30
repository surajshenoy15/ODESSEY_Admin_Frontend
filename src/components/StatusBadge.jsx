import { Badge, statusTone } from './ui'
import { humanize } from '../utils/format'

export function StatusBadge({ status }) {
  return <Badge tone={statusTone(status)}>{humanize(status || 'Unknown')}</Badge>
}
