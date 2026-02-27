// src/pages/Appointments.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const initialAppointments = [
  { id: 1, patient: 'Priya Sharma', doctor: 'Dr. Mehta', date: '2026-02-17', time: '09:00 AM', issue: 'Fever', status: 'Done' },
  { id: 2, patient: 'Rahul Gupta', doctor: 'Dr. Singh', date: '2026-02-17', time: '09:30 AM', issue: 'Diabetes', status: 'In Progress' },
  { id: 3, patient: 'Sara Khan', doctor: 'Dr. Mehta', date: '2026-02-17', time: '10:00 AM', issue: 'Checkup', status: 'Waiting' },
  { id: 4, patient: 'Amit Patel', doctor: 'Dr. Rao', date: '2026-02-17', time: '10:30 AM', issue: 'BP Check', status: 'Waiting' },
  { id: 5, patient: 'Neha Joshi', doctor: 'Dr. Singh', date: '2026-02-17', time: '11:00 AM', issue: 'Back Pain', status: 'Waiting' },
]

const doctors = ['Dr. Mehta', 'Dr. Singh', 'Dr. Rao']

const statusColors = {
  'Waiting':     'bg-yellow-900 text-yellow-400',
  'In Progress': 'bg-blue-900 text-blue-400',
  'Done':        'bg-green-900 text-green-400',
  'Cancelled':   'bg-red-900 text-red-400',
}

export default function Appointments() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({
    patient: '', doctor: '', date: '', time: '', issue: ''
  })

  const filtered = filter === 'All'
    ? appointments
    : appointments.filter(a => a.status === filter)

  const handleAdd = () => {
    if (!form.patient || !form.doctor) return
    setAppointments([...appointments, {
      ...form,
      id: appointments.length + 1,
      status: 'Waiting'
    }])
    setForm({ patient: '', doctor: '', date: '', time: '', issue: '' })
    setShowForm(false)
  }

  const updateStatus = (id, newStatus) => {
    setAppointments(appointments.map(a =>
      a.id === id ? { ...a, status: newStatus } : a
    ))
  }

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Appointments</h2>
            <p className="text-gray-400">{appointments.length} total appointments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 
                       rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Book Appointment
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">New Appointment</h3>
            <div className="grid grid-cols-3 gap-4">
              <input
                placeholder="Patient Name"
                value={form.patient}
                onChange={e => setForm({ ...form, patient: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500 
                           placeholder-gray-500"
              />
              <select
                value={form.doctor}
                onChange={e => setForm({ ...form, doctor: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500"
              />
              <input
                type="time"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500"
              />
              <input
                placeholder="Chief Complaint"
                value={form.issue}
                onChange={e => setForm({ ...form, issue: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500 
                           placeholder-gray-500"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 
                           rounded-lg font-medium transition-colors cursor-pointer"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 
                           rounded-lg font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['All', 'Waiting', 'In Progress', 'Done', 'Cancelled'].map(s => (
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
                <th className="text-left px-6 py-4">Patient</th>
                <th className="text-left px-6 py-4">Doctor</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Time</th>
                <th className="text-left px-6 py-4">Issue</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{a.patient}</td>
                  <td className="px-6 py-4 text-gray-300">{a.doctor}</td>
                  <td className="px-6 py-4 text-gray-400">{a.date}</td>
                  <td className="px-6 py-4 text-gray-400">{a.time}</td>
                  <td className="px-6 py-4 text-gray-300">{a.issue}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                     ${statusColors[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={a.status}
                      onChange={e => updateStatus(a.id, e.target.value)}
                      className="bg-gray-800 text-gray-300 text-sm border border-gray-700 
                                 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option>Waiting</option>
                      <option>In Progress</option>
                      <option>Done</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No appointments found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}