import { useState } from 'react'
import { ArrowRight, BadgeCheck, Eye, EyeOff, LockKeyhole, Mail, ScanLine, ShieldCheck, Trophy } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { Button, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage(){
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [showPassword,setShowPassword]=useState(false);const [errors,setErrors]=useState({})
  const {login,authBusy}=useAuth();const {notify}=useToast();const navigate=useNavigate();const location=useLocation()
  function validate(){const next={};if(!/^\S+@\S+\.\S+$/.test(email))next.email='Enter a valid admin email address.';if(!password)next.password='Enter your password.';setErrors(next);return Object.keys(next).length===0}
  async function submit(event){event.preventDefault();if(!validate())return;try{await login(email.trim().toLowerCase(),password);notify('Signed in successfully.','success');navigate(location.state?.from||'/dashboard',{replace:true})}catch(error){notify(error.message,'error')}}
  return <main className="min-h-screen bg-cream lg:grid lg:grid-cols-[1.08fr_.92fr]">
    <section className="relative hidden min-h-screen overflow-hidden bg-brand-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-accent-500"/><div className="absolute -right-36 top-24 h-96 w-96 rounded-full border border-white/[.06] shadow-[0_0_0_70px_rgba(255,255,255,.018),0_0_0_140px_rgba(255,255,255,.012)]"/>
      <BrandMark inverse/>
      <div className="relative max-w-2xl py-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-accent-300">BNMIT ODYSSEY · Administration</p>
        <h1 className="mt-5 font-display text-6xl font-black uppercase leading-[.88] tracking-[-.065em] xl:text-7xl">One command centre.<br/><span className="text-accent-500">Every event.</span></h1>
        <p className="mt-7 max-w-xl text-sm leading-7 text-white/58">Review college registrations, validate bonafide documents against student profiles, approve teams, manage fixtures and live links, verify QR attendance and release certificates.</p>
        <div className="mt-9 grid grid-cols-3 gap-3">
          {[['Review',BadgeCheck,'Payments & documents'],['Attend',ScanLine,'Student-wise QR'],['Certify',Trophy,'Present participants']].map(([title,Icon,copy])=><article key={title} className="rounded-2xl border border-white/10 bg-white/[.045] p-4 backdrop-blur"><Icon className="h-5 w-5 text-accent-400"/><h2 className="mt-4 font-display text-sm font-black uppercase">{title}</h2><p className="mt-1 text-[10px] leading-4 text-white/42">{copy}</p></article>)}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-white/35"><ShieldCheck className="h-4 w-4 text-logo-green"/>Authorised administrators only · actions are audited</div>
    </section>
    <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8"><div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-accent-500/[.06] blur-3xl"/><div className="relative w-full max-w-md">
      <div className="mb-8 lg:hidden"><BrandMark/></div>
      <div className="rounded-[28px] border border-brand-900/10 bg-paper p-6 shadow-lift sm:p-8">
        <div className="mb-7"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-accent-600">Secure sign in</p><h2 className="mt-2 font-display text-4xl font-black tracking-[-.055em] text-brand-950">Welcome back.</h2><p className="mt-2 text-sm leading-6 text-slate-500">Use the credentials created for your BNMIT ODYSSEY admin role.</p></div>
        <form className="space-y-5" onSubmit={submit} noValidate>
          <div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-[39px] h-4 w-4 text-slate-400"/><Input label="Admin email" name="email" type="email" autoComplete="username" value={email} onChange={(e)=>setEmail(e.target.value)} error={errors.email} placeholder="admin@bnmit.in" className="[&_input]:pl-10"/></div>
          <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-[39px] h-4 w-4 text-slate-400"/><Input label="Password" name="password" type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} error={errors.password} placeholder="Enter your password" className="[&_input]:pl-10 [&_input]:pr-11"/><button type="button" onClick={()=>setShowPassword((value)=>!value)} className="absolute right-2.5 top-[33px] rounded-lg p-2 text-slate-500 hover:bg-cream" aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div>
          <Button type="submit" size="lg" className="w-full" loading={authBusy}>Sign in to operations <ArrowRight className="h-4 w-4"/></Button>
        </form>
        <div className="mt-6 rounded-2xl border border-brand-900/10 bg-brand-50/70 p-4 text-xs leading-5 text-brand-900"><strong>Access is role-based.</strong> Registration, attendance, fixture and certificate tools appear according to the permissions assigned to your account.</div>
      </div>
      <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">BNMIT ODYSSEY · Event Operations Centre</p>
    </div></section>
  </main>
}
