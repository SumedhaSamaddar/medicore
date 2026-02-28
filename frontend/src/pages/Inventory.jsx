// src/pages/Inventory.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../api'

const getStockStatus = (qty, threshold) => {
  if (qty <= threshold * 0.3) return { label: 'Critical', cls: 'bg-red-900 text-red-400' }
  if (qty <= threshold)       return { label: 'Low',      cls: 'bg-yellow-900 text-yellow-400' }
  return                             { label: 'OK',       cls: 'bg-green-900 text-green-400' }
}

export default function Inventory() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [search, setSearch]       = useState('')
  const [filterLow, setFilterLow] = useState(false)
  const [form, setForm] = useState({
    name: '', category: '', quantity: '', threshold: '', expiry: '', supplier: '', price: ''
  })

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const res = await getMedicines()
      setMedicines(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMedicines() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.quantity) return toast.error('Name and quantity required')
    try {
      setSaving(true)
      await createMedicine({
        ...form,
        quantity:  parseInt(form.quantity)  || 0,
        threshold: parseInt(form.threshold) || 50,
        price:     parseFloat(form.price)   || 0
      })
      toast.success('Medicine added!')
      setForm({ name: '', category: '', quantity: '', threshold: '', expiry: '', supplier: '', price: '' })
      setShowForm(false)
      fetchMedicines()
    } catch (err) {
      toast.error('Failed to add medicine')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return
    try {
      await deleteMedicine(id)
      toast.success('Deleted')
      fetchMedicines()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const lowStockCount = medicines.filter(m => (m.quantity || 0) <= (m.threshold || 50)).length
  const filtered = medicines
    .filter(m => m.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(m => filterLow ? (m.quantity || 0) <= (m.threshold || 50) : true)

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Medicine Inventory</h2>
            <p className="text-gray-400 text-sm">
              {medicines.length} medicines ·{' '}
              <span className={lowStockCount > 0 ? 'text-red-400' : 'text-green-400'}>
                {lowStockCount} low stock
              </span>
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm md:text-base">
            + Add Medicine
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-5 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-400 font-semibold text-sm">{lowStockCount} medicines are running low</p>
              <p className="text-red-500 text-xs">Reorder soon to avoid stockouts</p>
            </div>
            <button onClick={() => setFilterLow(!filterLow)}
              className="bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap">
              {filterLow ? 'Show All' : 'View Low Stock'}
            </button>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-4">Add New Medicine</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { key: 'name',      placeholder: 'Medicine Name *',        type: 'text'   },
                { key: 'category',  placeholder: 'Category (Tablet/Syrup)',type: 'text'   },
                { key: 'quantity',  placeholder: 'Quantity *',             type: 'number' },
                { key: 'threshold', placeholder: 'Low Alert At',           type: 'number' },
                { key: 'expiry',    placeholder: 'Expiry Date',            type: 'date'   },
                { key: 'supplier',  placeholder: 'Supplier Name',          type: 'text'   },
                { key: 'price',     placeholder: 'Price per unit (₹)',     type: 'number' },
              ].map(f => (
                <input key={f.key} type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm" />
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAdd} disabled={saving}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${saving ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {saving ? 'Saving…' : 'Save Medicine'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-lg font-medium text-sm cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-5">
          <input placeholder="🔍  Search medicines..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-5 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm" />
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
                    {['Medicine', 'Category', 'Quantity', 'Expiry', 'Supplier', 'Price', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((m, i) => {
                    const stock = getStockStatus(m.quantity || 0, m.threshold || 50)
                    const isLow = (m.quantity || 0) <= (m.threshold || 50)
                    return (
                      <tr key={m._id || i}
                        className={`transition-colors hover:bg-gray-800/50 ${isLow ? 'border-l-2 border-red-500' : ''}`}>
                        <td className="px-5 py-3.5 text-white font-medium text-sm">{m.name}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{m.category || '—'}</td>
                        <td className={`px-5 py-3.5 font-semibold text-sm ${isLow ? 'text-red-400' : 'text-white'}`}>
                          {m.quantity}
                          <span className="text-gray-500 text-xs ml-1">/ {m.threshold || 50}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{m.expiry || '—'}</td>
                        <td className="px-5 py-3.5 text-gray-300 text-sm">{m.supplier || '—'}</td>
                        <td className="px-5 py-3.5 text-gray-300 text-sm">₹{m.price || 0}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stock.cls}`}>{stock.label}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => handleDelete(m._id)}
                            className="text-red-400 hover:text-red-300 text-xs cursor-pointer">
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                {medicines.length === 0 ? 'No medicines added yet' : 'No medicines match your search'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
