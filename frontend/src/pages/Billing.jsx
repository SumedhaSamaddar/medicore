// src/pages/Billing.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const initialInvoices = [
  { id: 'INV-001', patient: 'Priya Sharma', doctor: 'Dr. Mehta', date: '2026-02-17', amount: 800, method: 'UPI', status: 'Paid' },
  { id: 'INV-002', patient: 'Rahul Gupta', doctor: 'Dr. Singh', date: '2026-02-17', amount: 1500, method: 'Cash', status: 'Paid' },
  { id: 'INV-003', patient: 'Sara Khan', doctor: 'Dr. Mehta', date: '2026-02-17', amount: 600, method: 'UPI', status: 'Pending' },
  { id: 'INV-004', patient: 'Amit Patel', doctor: 'Dr. Rao', date: '2026-02-16', amount: 2200, method: 'Insurance', status: 'Pending' },
  { id: 'INV-005', patient: 'Neha Joshi', doctor: 'Dr. Singh', date: '2026-02-16', amount: 950, method: 'Cash', status: 'Paid' },
]

const statusColors = {
  'Paid':    'bg-green-900 text-green-400',
  'Pending': 'bg-yellow-900 text-yellow-400',
  'Overdue': 'bg-red-900 text-red-400',
}

export default function Billing() {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({
    patient: '', doctor: '', amount: '', method: 'Cash'
  })

  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.amount, 0)

  const pendingAmount = invoices
    .filter(i => i.status === 'Pending')
    .reduce((sum, i) => sum + i.amount, 0)

  const filtered = filter === 'All'
    ? invoices
    : invoices.filter(i => i.status === filter)

  const handleAdd = () => {
    if (!form.patient || !form.amount) return
    const newInvoice = {
      ...form,
      id: `INV-00${invoices.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(form.amount),
      status: 'Pending'
    }
    setInvoices([newInvoice, ...invoices])
    setForm({ patient: '', doctor: '', amount: '', method: 'Cash' })
    setShowForm(false)
  }

  const markPaid = (id) => {
    setInvoices(invoices.map(i =>
      i.id === id ? { ...i, status: 'Paid' } : i
    ))
  }

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Billing</h2>
            <p className="text-gray-400">{invoices.length} total invoices</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 
                       rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Create Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Collected</p>
            <p className="text-3xl font-bold text-green-400">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Pending Amount</p>
            <p className="text-3xl font-bold text-yellow-400">
              ₹{pendingAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Invoices</p>
            <p className="text-3xl font-bold text-white">{invoices.length}</p>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">New Invoice</h3>
            <div className="grid grid-cols-4 gap-4">
              <input
                placeholder="Patient Name"
                value={form.patient}
                onChange={e => setForm({ ...form, patient: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500 
                           placeholder-gray-500"
              />
              <input
                placeholder="Doctor Name"
                value={form.doctor}
                onChange={e => setForm({ ...form, doctor: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500 
                           placeholder-gray-500"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500 
                           placeholder-gray-500"
              />
              <select
                value={form.method}
                onChange={e => setForm({ ...form, method: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Insurance</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 
                           rounded-lg font-medium transition-colors cursor-pointer"
              >
                Generate Invoice
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-800 text-gray-300 px-6 py-2.5 rounded-lg 
                           font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['All', 'Paid', 'Pending', 'Overdue'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium 
                          transition-colors cursor-pointer
                          ${filter === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                          }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr className="text-gray-400 text-sm">
                <th className="text-left px-6 py-4">Invoice ID</th>
                <th className="text-left px-6 py-4">Patient</th>
                <th className="text-left px-6 py-4">Doctor</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Amount</th>
                <th className="text-left px-6 py-4">Method</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-blue-400 font-mono text-sm">
                    {inv.id}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{inv.patient}</td>
                  <td className="px-6 py-4 text-gray-300">{inv.doctor}</td>
                  <td className="px-6 py-4 text-gray-400">{inv.date}</td>
                  <td className="px-6 py-4 text-white font-semibold">
                    ₹{inv.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{inv.method}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs 
                                     font-medium ${statusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {inv.status === 'Pending' && (
                      <button
                        onClick={() => markPaid(inv.id)}
                        className="text-green-400 hover:text-green-300 text-sm 
                                   cursor-pointer font-medium"
                      >
                        Mark Paid ✓
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No invoices found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}