// src/pages/Patients.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import { getPatients, createPatient, deletePatient } from '../api'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ name: '', age: '', phone: '', blood_group: '', issue: '' })

  // ── Fetch from MongoDB ──────────────────────────────────────────────────
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await getPatients()
      setPatients(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPatients() }, [])

  // ── Add Patient ─────────────────────────────────────────────────────────
  const handleAddPatient = async () => {
    if (!form.name || !form.phone) return toast.error('Name and phone are required')
    try {
      setSaving(true)
      await createPatient({ ...form, age: parseInt(form.age) || 0 })
      toast.success('Patient added!')
      setForm({ name: '', age: '', phone: '', blood_group: '', issue: '' })
      setShowForm(false)
      fetchPatients()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add patient')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete Patient ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return
    try {
      await deletePatient(id)
      toast.success('Patient deleted')
      fetchPatients()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />

      <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Patients</h2>
            <p className="text-gray-400">{patients.length} total patients</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Add Patient
          </button>
        </div>

        {/* Add Patient Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">New Patient</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'name',        placeholder: 'Full Name',     type: 'text'   },
                { key: 'age',         placeholder: 'Age',           type: 'number' },
                { key: 'phone',       placeholder: 'Phone Number',  type: 'text'   },
                { key: 'blood_group', placeholder: 'Blood Group',   type: 'text'   },
                { key: 'issue',       placeholder: 'Chief Complaint', type: 'text' },
              ].map(field => (
                <input
                  key={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddPatient}
                disabled={saving}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  saving ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {saving ? 'Saving…' : 'Save Patient'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍  Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-5 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-800">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left px-6 py-4">Name</th>
                  <th className="text-left px-6 py-4">Age</th>
                  <th className="text-left px-6 py-4">Phone</th>
                  <th className="text-left px-6 py-4">Blood Group</th>
                  <th className="text-left px-6 py-4">Chief Complaint</th>
                  <th className="text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-gray-300">{p.age}</td>
                    <td className="px-6 py-4 text-gray-300">{p.phone}</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-900 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                        {p.blood_group || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{p.issue || '—'}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer">
                        View →
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-400 hover:text-red-300 text-sm cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {patients.length === 0 ? 'No patients yet — add your first one!' : 'No patients match your search'}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}


