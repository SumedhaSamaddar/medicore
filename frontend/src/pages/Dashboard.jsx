// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts'

const weeklyData = [
  { day: 'Mon', patients: 12 },
  { day: 'Tue', patients: 19 },
  { day: 'Wed', patients: 8 },
  { day: 'Thu', patients: 24 },
  { day: 'Fri', patients: 17 },
  { day: 'Sat', patients: 6 },
  { day: 'Sun', patients: 3 },
]

const revenueData = [
  { month: 'Sep', revenue: 42000 },
  { month: 'Oct', revenue: 58000 },
  { month: 'Nov', revenue: 51000 },
  { month: 'Dec', revenue: 67000 },
  { month: 'Jan', revenue: 72000 },
  { month: 'Feb', revenue: 89000 },
]

const recentPatients = [
  { name: 'Priya Sharma', age: 28, issue: 'Fever', status: 'Waiting', time: '09:00 AM' },
  { name: 'Rahul Mehta', age: 45, issue: 'Diabetes', status: 'In Progress', time: '09:30 AM' },
  { name: 'Sara Khan', age: 32, issue: 'Checkup', status: 'Done', time: '10:00 AM' },
  { name: 'Amit Patel', age: 61, issue: 'BP', status: 'Waiting', time: '10:30 AM' },
]

const statusColors = {
  'Waiting': 'bg-yellow-900 text-yellow-400',
  'In Progress': 'bg-blue-900 text-blue-400',
  'Done': 'bg-green-900 text-green-400',
}

export default function Dashboard() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />

      {/* Main Content — shifted right to account for sidebar */}
      <div className="ml-0 md:ml-0 md:ml-64 flex-1 p-4 md:p-4 md:p-8 pt-16 md:pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-gray-400">
              {time.toLocaleDateString('en-IN', { 
                weekday: 'long', year: 'numeric', 
                month: 'long', day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl md:text-2xl md:text-3xl font-mono text-white">
              {time.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard icon="🧑‍⚕️" title="Today's Patients" 
                    value="24" change="+12%" color="green" />
          <StatCard icon="📅" title="Appointments"   
                    value="18" change="6 left" color="blue" />
          <StatCard icon="💰" title="Today's Revenue" 
                    value="₹8,400" change="+8%" color="green" />
          <StatCard icon="💊" title="Low Stock Items" 
                    value="3" change="⚠️ Alert" color="red" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">

          {/* Bar Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">
              Patients This Week
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1f2937', border: 'none', 
                    borderRadius: '8px', color: 'white' 
                  }} 
                />
                <Bar dataKey="patients" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">
              Revenue Trend (₹)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1f2937', border: 'none', 
                    borderRadius: '8px', color: 'white' 
                  }} 
                />
                <Line type="monotone" dataKey="revenue" 
                      stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Patients Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Today's Queue</h3>
          <table className="w-full">
            <thead>
              <tr className="text-gray-500 text-sm border-b border-gray-800">
                <th className="text-left pb-3">Patient</th>
                <th className="text-left pb-3">Age</th>
                <th className="text-left pb-3">Issue</th>
                <th className="text-left pb-3">Time</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentPatients.map((p, i) => (
                <tr key={i} className="text-sm">
                  <td className="py-3 text-white font-medium">{p.name}</td>
                  <td className="py-3 text-gray-400">{p.age}</td>
                  <td className="py-3 text-gray-300">{p.issue}</td>
                  <td className="py-3 text-gray-400">{p.time}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                     ${statusColors[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}