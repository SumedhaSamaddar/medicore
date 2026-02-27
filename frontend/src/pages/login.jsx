import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) navigate('/dashboard')
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const response = await login(email, password)
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userName', response.data.user.name)
      localStorage.setItem('userEmail', response.data.user.email)
      localStorage.setItem('userRole', response.data.user.role)

      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">MediCore</h1>
          <p className="text-gray-400">Healthcare ERP & CRM System</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">Login to Dashboard</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@medicore.com"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500 
                           placeholder-gray-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg 
                           px-4 py-3 focus:outline-none focus:border-blue-500 
                           placeholder-gray-500 transition-colors"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200
                         ${loading
                           ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                           : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-600/50'
                         }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-2">🔐 Demo Credentials:</p>
          <p className="text-gray-300 text-sm">
            <strong>Email:</strong> admin@medicore.com<br/>
            <strong>Password:</strong> admin123
          </p>
        </div>
      </div>
    </div>
  )
}

