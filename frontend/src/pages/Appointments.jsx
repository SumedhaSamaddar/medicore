// src/pages/Appointments.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import { getAppointments, createAppointment, updateAppointment, getDoctors, getPatients } from '../api'

const statusColors = {
  'Waiting':     'bg-yellow-900 text-yellow-400',
  'In Progress': 'bg-blue-900 text-blue-400',
  'Done':        'bg-green-900 text-green-400',
  'Cancelled':   'bg-red-900 text-red-400',
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors]           = useState([])
  const [patients, setPatients]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [showForm, setShowForm]         = useState(false)
  const [filter, setFilter]             = useState('All')
  const [form, setForm] = useState({ patient: '', doctor: '', date: '', time: '', issue: '' })

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [apptRes, docRes, patRes] = await Promise.allSettled([
        getAppointments(),
        getDoctors(),
        getPatients()
      ])
      if (apptRes.status === 'fulfilled') setAppointments(Array.isArray(apptRes.value.data) ? apptRes.value.data : [])
      if (docRes.status  === 'fulfilled') setDoctors(Array.isArray(docRes.value.data) ? docRes.value.data : [])
      if (patRes.status  === 'fulfilled') setPatients(Array.isArray(patRes.value.data) ? patRes.value.data : [])
    } catch (err) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleAdd = async () => {
    if (!form.patient || !form.doctor) return toast.error('Patient and doctor are required')
    if (!form.date) return toast.error('Date is required')
    try {
      setSaving(true)
      await createAppointment({
        patient: form.patient,   // ✅ ObjectId from dropdown
        doctor:  form.doctor,    // ✅ ObjectId from dropdown
        date:    form.date,
        time:    form.time,
        issue:   form.issue,
        status:  'Waiting'
      })
      toast.success('Appointment booked!')
      setForm({ patient: '', doctor: '', date: '', time: '', issue: '' })
      setShowForm(false)
      fetchAll()
    } catch (err) {
      toast.error('Failed to book appointment')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await updateAppointment(id, { status })
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a))
      toast.success('Status updated')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter)
  const counts = { Waiting: 0, 'In Progress': 0, Done: 0, Cancelled: 0 }
  appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++ })

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Appointments</h2>
            <p className="text-gray-400 text-sm">{appointments.length} total appointments</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm md:text-base">
            + Book Appointment
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {Object.entries(counts).map(([s, n]) => (
            <div key={s} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{s}</p>
              <p className={`text-2xl font-bold ${statusColors[s]?.split(' ')[1] || 'text-white'}`}>{n}</p>
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-4">New Appointment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

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
                <option value="">Select Doctor *</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>

              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm" />

              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm" />

              <input placeholder="Chief Complaint" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm sm:col-span-2 lg:col-span-1" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAdd} disabled={saving}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${saving ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {saving ? 'Saving…' : 'Confirm Booking'}
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
          {['All', 'Waiting', 'In Progress', 'Done', 'Cancelled'].map(s => (
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
                    {['Patient', 'Doctor', 'Date', 'Time', 'Issue', 'Status', 'Update'].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map(a => (
                    <tr key={a._id} className="hover:bg-gray-800/50 transition-colors">
                      {/* ✅ Handle both populated objects and plain strings */}
                      <td className="px-5 py-3.5 text-white font-medium text-sm">{a.patient?.name || a.patientName || a.patient}</td>
                      <td className="px-5 py-3.5 text-gray-300 text-sm">{a.doctor?.name || a.doctorName || a.doctor}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-sm">{a.date ? new Date(a.date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-sm">{a.time || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-300 text-sm">{a.issue || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || 'bg-gray-700 text-gray-300'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select value={a.status} onChange={e => updateStatus(a._id, e.target.value)}
                          className="bg-gray-800 text-gray-300 text-xs border border-gray-700 rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                          {['Waiting', 'In Progress', 'Done', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                {appointments.length === 0 ? 'No appointments yet — book the first one!' : 'No appointments match this filter'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}