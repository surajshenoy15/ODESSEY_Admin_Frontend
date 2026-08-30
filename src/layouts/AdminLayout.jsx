import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, CalendarDays, ChevronRight, ClipboardCheck, FileBadge, FileDown, LayoutDashboard, ListChecks, LogOut, Mail, Menu, Radio, ShieldCheck, UploadCloud, UserCog, X } from 'lucide-react'
import BrandMark from '../components/BrandMark'
import { ConnectionBanner } from '../components/ConnectionBanner'
import { useAuth } from '../context/AuthContext'
import { cn, initials } from '../utils/format'
import { hasRole, roleLabels } from '../utils/roles'

const navigation = [
  { to:'/dashboard',label:'Dashboard',icon:LayoutDashboard,allow:[] },
  { to:'/registrations',label:'Registrations',icon:ClipboardCheck,allow:['REGISTRATION_ADMIN'] },
  { to:'/events',label:'Events & fees',icon:CalendarDays,allow:['REGISTRATION_ADMIN'] },
  { to:'/attendance',label:'QR attendance',icon:ListChecks,allow:['ATTENDANCE_ADMIN'] },
  { to:'/fixtures',label:'Fixtures & draws',icon:UploadCloud,allow:['FIXTURE_ADMIN'] },
  { to:'/live-streams',label:'Live streams',icon:Radio,allow:['FIXTURE_ADMIN'] },
  { to:'/certificates',label:'Certificates',icon:FileBadge,allow:['CERTIFICATE_ADMIN'] },
  { to:'/reports',label:'Reports & exports',icon:FileDown,allow:['REGISTRATION_ADMIN'] },
  { to:'/admin-users',label:'Admin users',icon:UserCog,allow:['SUPER_ADMIN'],superOnly:true },
  { to:'/audit-logs',label:'Audit logs',icon:Activity,allow:[] },
  { to:'/email-logs',label:'Email logs',icon:Mail,allow:[] },
]

function SidebarContent({ close }) {
  const { role, session, logout } = useAuth()
  const items = useMemo(()=>navigation.filter((item)=>item.superOnly ? role==='SUPER_ADMIN' : item.allow.length===0 || hasRole(role,...item.allow)),[role])
  return <div className="flex h-full flex-col bg-brand-950 text-white">
    <div className="relative flex h-[88px] items-center justify-between border-b border-white/10 px-5"><span className="absolute inset-x-0 top-0 h-1 bg-accent-500"/><BrandMark inverse/>{close?<button type="button" className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden" onClick={close} aria-label="Close navigation"><X className="h-5 w-5"/></button>:null}</div>
    <div className="px-4 pt-5"><div className="rounded-2xl border border-white/10 bg-white/[.045] p-4"><p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-accent-300">Operations console</p><p className="mt-2 text-xs leading-5 text-white/55">Registration → approval → attendance → certificates</p></div></div>
    <nav className="admin-scrollbar flex-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation"><p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-white/35">Workspace</p><div className="space-y-1">{items.map((item)=>{const Icon=item.icon;return <NavLink key={item.to} to={item.to} onClick={close} className={({isActive})=>cn('group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-semibold transition',isActive?'bg-white text-brand-950 shadow-lg':'text-white/62 hover:bg-white/[.07] hover:text-white')}><Icon className="h-[17px] w-[17px] shrink-0"/><span className="flex-1">{item.label}</span><ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-60"/></NavLink>})}</div></nav>
    <div className="border-t border-white/10 p-3"><div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/[.055] p-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-500 text-xs font-black text-white">{initials(session?.email)}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{session?.email}</p><p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-white/40">{roleLabels[role]||role}</p></div></div><button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-red-500/15 hover:text-red-100"><LogOut className="h-[17px] w-[17px]"/>Sign out</button></div>
  </div>
}

export default function AdminLayout(){
  const [mobileOpen,setMobileOpen]=useState(false); const location=useLocation(); const current=navigation.find((item)=>location.pathname.startsWith(item.to))
  return <div className="admin-grid-bg min-h-screen">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] lg:block"><SidebarContent/></aside>
    {mobileOpen?<div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-brand-950/70 backdrop-blur-sm" onClick={()=>setMobileOpen(false)} aria-label="Close navigation backdrop"/><aside className="relative h-full w-[min(88vw,320px)] shadow-2xl"><SidebarContent close={()=>setMobileOpen(false)}/></aside></div>:null}
    <div className="lg:pl-[280px]">
      <header className="sticky top-0 z-30 border-b border-brand-900/10 bg-paper/90 backdrop-blur-xl"><div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" className="rounded-xl border border-brand-900/10 bg-white p-2 text-brand-800 shadow-sm hover:bg-cream lg:hidden" onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5"/></button><div className="min-w-0"><p className="truncate font-display text-[17px] font-black tracking-[-.025em] text-brand-950">{current?.label||'Admin portal'}</p><p className="hidden truncate text-xs text-slate-500 sm:block">BNMIT ODYSSEY · Secure event operations</p></div></div><div className="flex items-center gap-2 rounded-full border border-brand-900/10 bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.09em] text-brand-700 shadow-sm"><ShieldCheck className="h-4 w-4 text-logo-green"/><span className="hidden sm:inline">Authenticated session</span></div></div><ConnectionBanner/></header>
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"><div className="mx-auto max-w-[1580px]"><Outlet/></div></main>
    </div>
  </div>
}
