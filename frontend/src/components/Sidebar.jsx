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
  { icon: '📈', label: 'Analytics',    path: '/analytics',     color: 'emerald' }
]

const colorClasses = {
  blue:    { bg: 'bg-blue-600',    active: 'bg-blue-600' },
  green:   { bg: 'bg-green-600',   active: 'bg-green-600' },
  purple:  { bg: 'bg-purple-600',  active: 'bg-purple-600' },
  orange:  { bg: 'bg-orange-600',  active: 'bg-orange-600' },
  yellow:  { bg: 'bg-yellow-600',  active: 'bg-yellow-600' },
  cyan:    { bg: 'bg-cyan-600',    active: 'bg-cyan-600' },
  red:     { bg: 'bg-red-600',     active: 'bg-red-600' },
  emerald: { bg: 'bg-emerald-600', active: 'bg-emerald-600' }
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const userName = localStorage.getItem('userName') || 'Admin'
  const userEmail = localStorage.getItem('userEmail') || 'admin@medicore.com'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-900 border border-gray-800 p-3 rounded-lg text-white"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-xl md:text-2xl">
              🏥
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MediCore</h1>
              <p className="text-xs text-gray-400">Healthcare ERP</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path)
              const colors = colorClasses[item.color]
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setMobileOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${active ? `${colors.active} text-white` : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                  `}
                >
                  <span className="text-xl md:text-2xl">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                  {active && <span className="absolute left-0 w-1 h-8 bg-white rounded-r"></span>}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-3">
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
                       bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full"
               onClick={e => e.stopPropagation()}>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚪</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
              <p className="text-gray-400 text-sm">Are you sure you want to logout?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}