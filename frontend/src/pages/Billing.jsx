
// src/pages/Billing.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import { getInvoices, createInvoice, updateInvoice, getPatients, getDoctors } from '../api'

const statusColors = {
  'Paid':    'bg-green-900 text-green-400',
  'Pending': 'bg-yellow-900 text-yellow-400',
  'Overdue': 'bg-red-900 text-red-400',
}

export default function Billing() {
  const [invoices, setInvoices] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]     = useState('All')
  const [form, setForm] = useState({ patient: '', doctor: '', amount: '', method: 'Cash' })

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [invRes, patRes, docRes] = await Promise.allSettled([
        getInvoices(),
        getPatients(),
        getDoctors()
      ])
      if (invRes.status === 'fulfilled') setInvoices(Array.isArray(invRes.value.data) ? invRes.value.data : [])
      if (patRes.status === 'fulfilled') setPatients(Array.isArray(patRes.value.data) ? patRes.value.data : [])
      if (docRes.status === 'fulfilled') setDoctors(Array.isArray(docRes.value.data) ? docRes.value.data : [])
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const totalRevenue  = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (Number(i.totalAmount || i.amount) || 0), 0)
  const pendingAmount = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + (Number(i.totalAmount || i.amount) || 0), 0)

  const handleAdd = async () => {
    if (!form.patient || !form.amount) return toast.error('Patient and amount required')
    try {
      setSaving(true)
      await createInvoice({
        patient: form.patient,           // ✅ now an ObjectId from dropdown
        doctor:  form.doctor || undefined,
        amount:  parseFloat(form.amount),
        method:  form.method,
        status:  'Pending'
      })
      toast.success('Invoice created!')
      setForm({ patient: '', doctor: '', amount: '', method: 'Cash' })
      setShowForm(false)
      fetchAll()
    } catch (err) {
      toast.error('Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  const markPaid = async (id) => {
    try {
      await updateInvoice(id, { status: 'Paid' })
      setInvoices(prev => prev.map(i => i._id === id ? { ...i, status: 'Paid' } : i))
      toast.success('Marked as paid')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  const filtered = filter === 'All' ? invoices : invoices.filter(i => i.status === filter)

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Billing</h2>
            <p className="text-gray-400 text-sm">{invoices.length} total invoices</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm md:text-base">
            + Create Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Total Collected</p>
            <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-400">₹{pendingAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-white">{invoices.length}</p>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-4">New Invoice</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* ✅ Patient dropdown — sends ObjectId */}
              <select value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm">
                <option value="">Select Patient *</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>

              {/* ✅ Doctor dropdown — sends ObjectId */}
              <select value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm">
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>

              <input type="number" placeholder="Amount (₹) *" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm" />

              <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm">
                {['Cash', 'UPI', 'Card', 'Insurance'].map(m => <option key={m}>{m}</option>)}
              </select>

            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAdd} disabled={saving}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${saving ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {saving ? 'Saving…' : 'Generate Invoice'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-lg font-medium text-sm cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {['All', 'Paid', 'Pending', 'Overdue'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-800">
                  <tr className="text-gray-400 text-xs uppercase tracking-wide">
                    {['Invoice ID', 'Patient', 'Doctor', 'Date', 'Amount', 'Method', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((inv, i) => (
                    <tr key={inv._id || i} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-3.5 text-blue-400 font-mono text-xs">{inv.invoiceId || inv._id?.slice(-6).toUpperCase() || `INV-${i + 1}`}</td>
                      <td className="px-5 py-3.5 text-white font-medium text-sm">{inv.patient?.name || inv.patientName || inv.patient}</td>
                      <td className="px-5 py-3.5 text-gray-300 text-sm">{inv.doctor?.name || inv.doctorName || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-sm">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-5 py-3.5 text-white font-semibold text-sm">₹{Number(inv.totalAmount || inv.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5 text-gray-300 text-sm">{inv.method || inv.paymentMethod || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.status] || 'bg-gray-700 text-gray-300'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {inv.status === 'Pending' && (
                          <button onClick={() => markPaid(inv._id)}
                            className="text-green-400 hover:text-green-300 text-xs font-medium cursor-pointer whitespace-nowrap">
                            Mark Paid ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                {invoices.length === 0 ? 'No invoices yet — create the first one!' : 'No invoices match this filter'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}