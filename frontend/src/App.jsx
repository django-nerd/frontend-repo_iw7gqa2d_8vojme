import { useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function Hero() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/O-AdlP9lTPNz-i8a/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-end pb-10">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Visitor Pass Management</h1>
          <p className="mt-4 text-white/80 max-w-2xl">Digitize registrations, QR-based passes, and secure check-ins. Built with a modern stack and designed for speed.</p>
        </div>
      </div>
    </section>
  )
}

function AuthPanel({ onAuthed }) {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password123')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    setLoading(true); setError('')
    try {
      const form = new URLSearchParams()
      form.append('username', email)
      form.append('password', password)
      const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      setToken(data.access_token)
      onAuthed(data.access_token)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const register = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      if (!res.ok) throw new Error('Register failed')
      const data = await res.json()
      setToken(data.access_token)
      onAuthed(data.access_token)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
      <h3 className="text-xl font-semibold">Get Started</h3>
      <p className="text-sm text-gray-500 mb-4">Use demo credentials or register a new admin.</p>
      <div className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" />
        <div className="flex gap-3">
          <button onClick={login} disabled={loading} className="px-4 py-2 rounded bg-black text-white">Login</button>
          <button onClick={register} disabled={loading} className="px-4 py-2 rounded bg-gray-800 text-white">Register</button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  )
}

function Visitors({ token }) {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })

  const load = async () => {
    const url = new URL(`${API_BASE}/visitors`)
    if (q) url.searchParams.set('q', q)
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => { if (token) load() }, [token])

  const create = async () => {
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => fd.append(k, v))
    const res = await fetch(`${API_BASE}/visitors`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (res.ok) { setForm({ full_name: '', email: '', phone: '' }); load() }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Visitors</h2>
        <div className="flex gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="border rounded px-3 py-2" />
          <button onClick={load} className="px-3 py-2 bg-black text-white rounded">Search</button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl p-4 border">
          <h3 className="font-medium mb-3">New Visitor</h3>
          <div className="space-y-3">
            <input value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} placeholder="Full name" className="w-full border rounded px-3 py-2" />
            <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="w-full border rounded px-3 py-2" />
            <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Phone" className="w-full border rounded px-3 py-2" />
            <button onClick={create} className="px-4 py-2 bg-black text-white rounded">Create</button>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <h3 className="font-medium mb-3">All Visitors</h3>
          <ul className="divide-y">
            {items.map(v => (
              <li key={v._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{v.full_name}</p>
                  <p className="text-sm text-gray-500">{v.email || '—'} · {v.phone || '—'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [token, setToken] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <section className="-mt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          {!token ? (
            <div className="flex justify-center -mt-16">
              <AuthPanel onAuthed={setToken} />
            </div>
          ) : (
            <Visitors token={token} />
          )}
        </div>
      </section>
    </div>
  )
}
