// src/pages/Inventory.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const initialMedicines = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Tablet', quantity: 250, threshold: 50, expiry: '2026-12-31', supplier: 'MedSupply Co.', price: 2 },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Capsule', quantity: 30, threshold: 50, expiry: '2026-08-15', supplier: 'PharmaDist', price: 12 },
  { id: 3, name: 'Metformin 500mg', category: 'Tablet', quantity: 18, threshold: 50, expiry: '2027-01-20', supplier: 'MedSupply Co.', price: 5 },
  { id: 4, name: 'Atorvastatin 10mg', category: 'Tablet', quantity: 120, threshold: 30, expiry: '2026-10-05', supplier: 'HealthMart', price: 8 },
  { id: 5, name: 'Azithromycin 500mg', category: 'Tablet', quantity: 8, threshold: 20, expiry: '2026-06-30', supplier: 'PharmaDist', price: 35 },
  { id: 6, name: 'Pantoprazole 40mg', category: 'Tablet', quantity: 200, threshold: 40, expiry: '2027-03-15', supplier: 'HealthMart', price: 6 },
]

export default function Inventory() {
  const [medicines, setMedicines] = useState(initialMedicines)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterLow, setFilterLow] = useState(false)
  const [form, setForm] = useState({
    name: '', category: '', quantity: '', threshold: '',
    expiry: '', supplier: '', price: ''
  })

  const lowStockCount = medicines.filter(m => m.quantity <= m.threshold).length

  const filtered = medicines
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter(m => filterLow ? m.quantity <= m.threshold : true)

  const handleAdd = () => {
    if (!form.name || !form.quantity) return
    setMedicines([...medicines, {
      ...form,
      id: medicines.length + 1,
      quantity: parseInt(form.quantity),
      threshold: parseInt(form.threshold),
      price: parseFloat(form.price)
    }])
    setForm({ name: '', category: '', quantity: '', threshold: '', expiry: '', supplier: '', price: '' })
    setShowForm(false)
  }

  const getStockStatus = (qty, threshold) => {
    if (qty <= threshold * 0.3) return { label: 'Critical', class: 'bg-red-900 text-red-400' }
    if (qty <= threshold) return { label: 'Low', class: 'bg-yellow-900 text-yellow-400' }
    return { label: 'OK', class: 'bg-green-900 text-green-400' }
  }

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Medicine Inventory</h2>
            <p className="text-gray-400">{medicines.length} medicines ·
              <span className="text-red-400 ml-1">{lowStockCount} low stock</span>
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 
                       rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Add Medicine
          </button>
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockCount > 0 && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-6 
                          flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-400 font-semibold">
                {lowStockCount} medicines are running low
              </p>
              <p className="text-red-500 text-sm">
                Reorder soon to avoid stockouts
              </p>
            </div>
            <button
              onClick={() => setFilterLow(!filterLow)}
              className="ml-auto bg-red-900 hover:bg-red-800 text-red-300 
                         px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
            >
              {filterLow ? 'Show All' : 'View Low Stock'}
            </button>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Add New Medicine</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { key: 'name', placeholder: 'Medicine Name', type: 'text' },
                { key: 'category', placeholder: 'Category (Tablet/Syrup)', type: 'text' },
                { key: 'quantity', placeholder: 'Quantity', type: 'number' },
                { key: 'threshold', placeholder: 'Low Stock Alert At', type: 'number' },
                { key: 'expiry', placeholder: 'Expiry Date', type: 'date' },
                { key: 'supplier', placeholder: 'Supplier Name', type: 'text' },
                { key: 'price', placeholder: 'Price per unit (₹)', type: 'number' },
              ].map(f => (
                <input
                  key={f.key}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                             px-4 py-3 focus:outline-none focus:border-blue-500 
                             placeholder-gray-500"
                />
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 
                           rounded-lg font-medium transition-colors cursor-pointer"
              >
                Save Medicine
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

        {/* Search */}
        <div className="mb-6">
          <input
            placeholder="🔍  Search medicines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-800 
                       rounded-xl px-5 py-3 focus:outline-none 
                       focus:border-blue-500 placeholder-gray-500"
          />
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr className="text-gray-400 text-sm">
                <th className="text-left px-6 py-4">Medicine</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Quantity</th>
                <th className="text-left px-6 py-4">Expiry</th>
                <th className="text-left px-6 py-4">Supplier</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(m => {
                const stock = getStockStatus(m.quantity, m.threshold)
                const isLow = m.quantity <= m.threshold

                return (
                  <tr key={m.id}
                    className={`transition-colors hover:bg-gray-800 
                                ${isLow ? 'border-l-2 border-red-500' : ''}`}
                  >
                    <td className="px-6 py-4 text-white font-medium">{m.name}</td>
                    <td className="px-6 py-4 text-gray-400">{m.category}</td>
                    <td className={`px-6 py-4 font-semibold 
                                   ${isLow ? 'text-red-400' : 'text-white'}`}>
                      {m.quantity}
                      <span className="text-gray-500 text-xs ml-1">
                        / min {m.threshold}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{m.expiry}</td>
                    <td className="px-6 py-4 text-gray-300">{m.supplier}</td>
                    <td className="px-6 py-4 text-gray-300">₹{m.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs 
                                       font-medium ${stock.class}`}>
                        {stock.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No medicines found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}