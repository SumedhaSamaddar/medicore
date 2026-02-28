// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts'
import { getPatients, getAppointments, getInvoices, getMedicines } from '../api'

const statusColors = {
  'Waiting':     'bg-yellow-900 text-yellow-400',
  'In Progress': 'bg-blue-900 text-blue-400',
  'Done':        'bg-green-900 text-green-400',
  'Cancelled':   'bg-red-900 text-red-400',
}

const tooltipStyle = {
  contentStyle: { background: '#1f2937', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }
}

export default function Dashboard() {
  const [time, setTime]             = useState(new Date())
  const [stats, setStats]           = useState({ patients: 0, appointments: 0, revenue: 0, lowStock: 0 })
  const [todayQueue, setTodayQueue] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading]       = useState(true)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Fetch real data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const [patientsRes, apptRes, invoicesRes, medsRes] = await Promise.allSettled([
          getPatients(), getAppointments(), getInvoices(), getMedicines()
        ])

        const patients    = patientsRes.status    === 'fulfilled' ? (apptRes.value?.data || []) : []
        const appointments = apptRes.status       === 'fulfilled' ? (apptRes.value?.data || []) : []
        const invoices    = invoicesRes.status    === 'fulfilled' ? (invoicesRes.value?.data || []) : []
        const medicines   = medsRes.status        === 'fulfilled' ? (medsRes.value?.data || []) : []

        // Today's appointments for queue
        const today = new Date().toISOString().split('T')[0]
        const todayAppts = appointments.filter(a => {
          const d = a.date ? new Date(a.date).toISOString().split('T')[0] : ''
          return d === today || !a.date
        }).slice(0, 6)
        setTodayQueue(todayAppts)

        // Revenue from paid invoices
        const totalRevenue = invoices
          .filter(i => i.status === 'Paid')
          .reduce((s, i) => s + (Number(i.totalAmount || i.amount) || 0), 0)

        // Low stock count
        const lowStock = medicines.filter(m => (m.quantity || 0) <= (m.threshold || 50)).length

        setStats({
          patients: patientsRes.status === 'fulfilled' ? (patientsRes.value?.data?.length || 0) : 0,
          appointments: appointments.length,
          revenue: totalRevenue,
          lowStock
        })

        // Weekly data — appointments per day of week
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const dayCounts = [0, 0, 0, 0, 0, 0, 0]
        appointments.forEach(a => {
          if (a.date) {
            const d = new Date(a.date).getDay()
            const idx = d === 0 ? 6 : d - 1
            dayCounts[idx]++
          }
        })
        setWeeklyData(days.map((day, i) => ({ day, patients: dayCounts[i] })))

        // Monthly revenue — last 6 months
        const months = []
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const label = d.toLocaleString('default', { month: 'short' })
          const rev = invoices
            .filter(inv => {
              if (!inv.createdAt && !inv.date) return false
              const invDate = new Date(inv.createdAt || inv.date)
              return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear()
            })
            .reduce((s, inv) => s + (Number(inv.totalAmount || inv.amount) || 0), 0)
          months.push({ month: label, revenue: rev })
        }
        setRevenueData(months)

      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const statCards = [
    { icon: '🧑‍⚕️', title: "Total Patients",    value: stats.patients,                   color: 'text-blue-400' },
    { icon: '📅',   title: "Appointments",       value: stats.appointments,               color: 'text-purple-400' },
    { icon: '💰',   title: "Total Revenue",      value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'text-green-400' },
    { icon: '💊',   title: "Low Stock Items",    value: stats.lowStock,                   color: stats.lowStock > 0 ? 'text-red-400' : 'text-green-400' },
  ]

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-gray-400 text-sm">
              {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl md:text-2xl font-mono text-white">{time.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {statCards.map(card => (
            <div key={card.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{card.icon}</span>
                <p className="text-gray-400 text-xs">{card.title}</p>
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-gray-800 rounded animate-pulse" />
              ) : (
                <p className={`text-xl md:text-2xl font-bold ${card.color}`}>{card.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Appointments This Week</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Revenue Trend (₹)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Queue */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Today's Queue</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}
            </div>
          ) : todayQueue.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800 uppercase tracking-wide">
                    {['Patient', 'Doctor', 'Issue', 'Time', 'Status'].map(h => (
                      <th key={h} className="text-left pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {todayQueue.map((a, i) => (
                    <tr key={a._id || i} className="text-sm hover:bg-gray-800/30">
                      <td className="py-3 pr-4 text-white font-medium">{a.patient || a.patientName || '—'}</td>
                      <td className="py-3 pr-4 text-gray-400">{a.doctor || a.doctorName || '—'}</td>
                      <td className="py-3 pr-4 text-gray-300">{a.issue || '—'}</td>
                      <td className="py-3 pr-4 text-gray-400">{a.time || '—'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || 'bg-gray-700 text-gray-300'}`}>
                          {a.status || 'Waiting'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 text-sm">No appointments scheduled for today</div>
          )}
        </div>

      </div>
    </div>
  )
}
