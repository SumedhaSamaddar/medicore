import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import {
  getBusinessAnalytics,
  createTransaction,
  getTransactions
} from '../api'

export default function Analytics() {
  const [analytics, setAnalytics]         = useState(null)
  const [transactions, setTransactions]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [saving, setSaving]               = useState(false)

  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'Income',       // ✅ was 'income'
    category: 'General'
  })

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [analyticsRes, txnRes] = await Promise.allSettled([
        getBusinessAnalytics(),
        getTransactions()
      ])

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data)
      }
      if (txnRes.status === 'fulfilled') {
        const data = txnRes.value.data
        setTransactions(Array.isArray(data) ? data.slice(0, 10) : [])
      }
    } catch (err) {
      console.error('Analytics fetch error:', err)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSave = async () => {
    if (!form.description.trim()) return toast.error('Description is required')
    if (!form.amount || isNaN(form.amount)) return toast.error('Enter a valid amount')

    try {
      setSaving(true)
      await createTransaction({
        description: form.description,
        amount: parseFloat(form.amount),
        type: form.type,         // ✅ now sends 'Income' or 'Expense'
        category: form.category
      })
      toast.success('Transaction saved!')
      setShowTransactionForm(false)
      setForm({ description: '', amount: '', type: 'Income', category: 'General' })
      fetchAll()
    } catch (err) {
      console.error('Save transaction error:', err)
      toast.error('Failed to save transaction')
    } finally {
      setSaving(false)
    }
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  const maxRevenue = analytics?.monthlyRevenue?.length
    ? Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1)
    : 1

  if (loading) {
    return (
      <div className="flex bg-gray-950 min-h-screen">
        <Sidebar />
        <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-white">Loading analytics…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />

      <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Analytics</h2>
            <p className="text-gray-400">Business insights and performance</p>
          </div>
          <button
            onClick={() => setShowTransactionForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Add Transaction
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {fmt(analytics?.totalRevenue)}
            </h3>
            {analytics?.newPatientsThisMonth > 0 && (
              <p className="text-green-400 text-xs mt-1">+{analytics.newPatientsThisMonth} new patients this month</p>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Transactions</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {analytics?.transactionCount ?? transactions.length}
            </h3>
            <p className="text-gray-500 text-xs mt-1">recorded entries</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Expenses</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {fmt(analytics?.totalExpenses)}
            </h3>
            <p className="text-gray-500 text-xs mt-1">total outflows</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Net Profit</p>
            <h3 className={`text-xl md:text-2xl font-bold mt-1 ${
              (analytics?.netProfit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {fmt(analytics?.netProfit)}
            </h3>
            <p className="text-gray-500 text-xs mt-1">revenue − expenses</p>
          </div>
        </div>

        {/* Patient & Appointment Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Patients</p>
            <p className="text-2xl font-bold text-white mt-1">{analytics?.totalPatients ?? '—'}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Appointments</p>
            <p className="text-2xl font-bold text-white mt-1">{analytics?.totalAppointments ?? '—'}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Completed / Pending</p>
            <p className="text-2xl font-bold text-white mt-1">
              {analytics?.completedAppointments ?? '—'}
              <span className="text-gray-500 text-base"> / {analytics?.pendingAppointments ?? '—'}</span>
            </p>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-6">Monthly Revenue (Last 6 Months)</h3>

          {analytics?.monthlyRevenue?.length > 0 ? (
            <div className="flex items-end gap-3 h-48">
              {analytics.monthlyRevenue.map((m, i) => {
                const heightPct = Math.max((m.revenue / maxRevenue) * 100, 2)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-gray-400 text-xs">{fmt(m.revenue)}</p>
                    <div
                      className="w-full bg-blue-600 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                    <p className="text-gray-500 text-xs">{m.month}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No monthly data yet — add transactions to see trends
            </div>
          )}
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left pb-3 pr-4">Description</th>
                    <th className="text-left pb-3 pr-4">Type</th>
                    <th className="text-left pb-3 pr-4">Amount</th>
                    <th className="text-left pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t._id || i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 pr-4 text-white">{t.description || t.title || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (t.type || '').toLowerCase() === 'income'
                            ? 'bg-green-900 text-green-400'
                            : 'bg-red-900 text-red-400'
                        }`}>
                          {t.type || 'N/A'}
                        </span>
                      </td>
                      <td className={`py-3 pr-4 font-medium ${
                        (t.type || '').toLowerCase() === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {fmt(t.amount)}
                      </td>
                      <td className="py-3 text-gray-400">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No transactions yet. Click "Add Transaction" to get started.
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        {showTransactionForm && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowTransactionForm(false)}
          >
            <div
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Add Transaction</h3>

              <input
                type="text"
                placeholder="Description *"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full mb-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />

              <input
                type="number"
                placeholder="Amount (₹) *"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full mb-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />

              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full mb-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Income">Income</option>   {/* ✅ was "income" */}
                <option value="Expense">Expense</option> {/* ✅ was "expense" */}
              </select>

              <input
                type="text"
                placeholder="Category (e.g. Pharmacy, Salary)"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full mb-5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    saving
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setShowTransactionForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

