// frontend/src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { icon: '📊', label: 'Dashboard',    path: '/dashboard',    color: 'blue' },
  { icon: '🧑‍⚕️', label: 'Patients',     path: '/patients',     color: 'green' },
  { icon: '📅', label: 'Appointments', path: '/appointments', color: 'purple' },
  { icon: '💊', label: 'Inventory',    path: '/inventory',    color: 'orange' },
  { icon: '🧾', label: 'Billing',      path: '/billing',      color: 'yellow' },
  { icon: '🤖', label: 'AI Checker',   path: '/ai-checker',   color: 'cyan' },
  
  { icon: '🚨', label: 'Emergency',    path: '/emergency',    color: 'red' },
  { icon: '💰', label: 'Analytics',    path: '/analytics',    color: 'emerald' }  // Changed from 'Business' to 'Analytics'
]

const colorClasses = {
  blue:    { bg: 'bg-blue-600',    hover: 'hover:bg-blue-700',    active: 'bg-blue-600' },
  green:   { bg: 'bg-green-600',   hover: 'hover:bg-green-700',   active: 'bg-green-600' },
  purple:  { bg: 'bg-purple-600',  hover: 'hover:bg-purple-700',  active: 'bg-purple-600' },
  orange:  { bg: 'bg-orange-600',  hover: 'hover:bg-orange-700',  active: 'bg-orange-600' },
  yellow:  { bg: 'bg-yellow-600',  hover: 'hover:bg-yellow-700',  active: 'bg-yellow-600' },
  cyan:    { bg: 'bg-cyan-600',    hover: 'hover:bg-cyan-700',    active: 'bg-cyan-600' },
  pink:    { bg: 'bg-pink-600',    hover: 'hover:bg-pink-700',    active: 'bg-pink-600' },
  red:     { bg: 'bg-red-600',     hover: 'hover:bg-red-700',     active: 'bg-red-600' },
  emerald: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', active: 'bg-emerald-600' }
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const userName = localStorage.getItem('userName') || 'Admin'
  const userEmail = localStorage.getItem('userEmail') || 'admin@medicore.com'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-2xl">
              🏥
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MediCore</h1>
              <p className="text-xs text-gray-400">Healthcare ERP</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path)
              const colors = colorClasses[item.color]
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group relative
                    ${active 
                      ? `${colors.active} text-white shadow-lg` 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  {/* Icon */}
                  <span className={`
                    text-2xl transition-transform duration-200
                    ${active ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                    {item.icon}
                  </span>
                  
                  {/* Label */}
                  <span className={`
                    font-medium text-sm
                    ${active ? 'text-white' : 'text-gray-300'}
                  `}>
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r"></span>
                  )}

                  {/* Hover Effect */}
                  {!active && (
                    <div className={`
                      absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-10 
                      rounded-lg transition-opacity duration-200
                    `}></div>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{userName}</p>
                <p className="text-gray-400 text-xs truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-red-600 hover:bg-red-700 text-white rounded-lg 
                       font-medium text-sm transition-colors duration-200
                       shadow-lg hover:shadow-red-600/50"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
             onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full m-4 shadow-2xl"
               onClick={e => e.stopPropagation()}>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚪</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
              <p className="text-gray-400 text-sm">
                Are you sure you want to logout? You'll need to login again to access the system.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 
                           text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 
                           text-white rounded-lg font-medium transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}