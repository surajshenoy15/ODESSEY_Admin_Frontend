import { LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui'
export default function ForbiddenPage() { return <Card className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"><div className="rounded-2xl bg-amber-50 p-4 text-amber-700"><LockKeyhole className="h-8 w-8" /></div><h1 className="mt-5 text-2xl font-black text-brand-950">Access not available</h1><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Your admin role does not include this module. Ask the super admin to review your assigned permissions.</p><Link to="/dashboard" className="mt-5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800">Return to dashboard</Link></Card> }
