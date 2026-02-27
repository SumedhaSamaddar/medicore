// src/components/StatCard.jsx
export default function StatCard({ icon, title, value, change, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full 
                         ${color === 'green' 
                           ? 'bg-green-900 text-green-400' 
                           : 'bg-blue-900 text-blue-400'}`}>
          {change}
        </span>
      </div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-white text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}