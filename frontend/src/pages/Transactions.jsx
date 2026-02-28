// src/pages/Transactions.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import { getTransactions, createTransaction, deleteTransaction } from '../api'

const typeColors = {
  income:  'bg-green-900 text-green-400',
  expense: 'bg-red-900 text-red-400',
  credit:  'bg-green-900 text-green-400',
  debit:   'bg-red-900 text-red-400',
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [showForm, setShowForm]         = useState(false)
  const [filter, setFilter]             = useState('All')
  const [form, setForm] = useState({ description: '', amount: '', type: 'income', category: '' })

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const res = await getTransactions()
      setTransactions(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTransactions() }, [])

  const handleAdd = async () => {
    if (!form.description.trim()) return toast.error('Description required')
    if (!form.amount || isNaN(form.amount)) return toast.error('Enter a valid amount')
    try {
      setSaving(true)
      await createTransaction({ ...form, amount: parseFloat(form.amount) })
      toast.success('Transaction added!')
      setForm({ description: '', amount: '', type: 'income', category: '' })
      setShowForm(false)
      fetchTransactions()
    } catch (err) {
      toast.error('Failed to add transaction')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await deleteTransaction(id)
      toast.success('Deleted')
      fetchTransactions()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const totalIncome  = transactions.filter(t => ['income','credit'].includes(t.type?.toLowerCase())).reduce((s,t) => s + (Number(t.amount)||0), 0)
  const totalExpense = transactions.filter(t => ['expense','debit'].includes(t.type?.toLowerCase())).reduce((s,t) => s + (Number(t.amount)||0), 0)
  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.type?.toLowerCase() === filter.toLowerCase())

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Transactions</h2>
            <p className="text-gray-400 text-sm">{transactions.length} total records</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm md:text-base">
            + Add Transaction
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-400">₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400">₹{totalExpense.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Net Balance</p>
            <p className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{(totalIncome - totalExpense).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-4">New Transaction</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input placeholder="Description *" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm" />
              <input type="number" placeholder="Amount (₹) *" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm" />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <input placeholder="Category (e.g. Pharmacy)" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAdd} disabled={saving}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${saving ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {saving ? 'Saving…' : 'Save'}
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
          {['All', 'Income', 'Expense'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}>
              {f}
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
              <table className="w-full min-w-[540px]">
                <thead className="bg-gray-800">
                  <tr className="text-gray-400 text-xs uppercase tracking-wide">
                    {['Description', 'Category', 'Type', 'Amount', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((t, i) => (
                    <tr key={t._id || i} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-3.5 text-white font-medium text-sm">{t.description || t.title || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-sm">{t.category || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[t.type?.toLowerCase()] || 'bg-gray-700 text-gray-300'}`}>
                          {t.type || '—'}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 font-semibold text-sm ${['income','credit'].includes(t.type?.toLowerCase()) ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-sm">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleDelete(t._id)}
                          className="text-red-400 hover:text-red-300 text-xs cursor-pointer">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                {transactions.length === 0 ? 'No transactions yet — add the first one!' : 'No transactions match this filter'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
