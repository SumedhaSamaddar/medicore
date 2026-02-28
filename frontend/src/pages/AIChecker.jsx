// src/pages/AIChecker.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import { getAIPrediction } from '../api'

const severityColors = {
  low:      { badge: 'bg-green-900 text-green-400',  border: 'border-green-700',  bg: 'bg-green-950' },
  medium:   { badge: 'bg-yellow-900 text-yellow-400',border: 'border-yellow-700', bg: 'bg-yellow-950' },
  high:     { badge: 'bg-orange-900 text-orange-400',border: 'border-orange-700', bg: 'bg-orange-950' },
  critical: { badge: 'bg-red-900 text-red-400',      border: 'border-red-700',    bg: 'bg-red-950' },
}

export default function AIChecker() {
  const [symptoms, setSymptoms]     = useState('')
  const [age, setAge]               = useState('')
  const [gender, setGender]         = useState('Male')
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [history, setHistory]       = useState([])

  const handleCheck = async () => {
    if (!symptoms.trim()) return toast.error('Please describe the symptoms')
    try {
      setLoading(true)
      setResult(null)
      const res = await getAIPrediction({ symptoms, age, gender })
      const data = res?.data || {}
      setResult(data)
      setHistory(prev => [{ symptoms, age, gender, result: data, time: new Date() }, ...prev.slice(0, 4)])
      toast.success('Analysis complete')
    } catch (err) {
      console.error(err)
      toast.error('Analysis failed — check your API connection')
    } finally {
      setLoading(false)
    }
  }

  const severity = result?.severity?.toLowerCase() || 'low'
  const colors   = severityColors[severity] || severityColors.low

  const clearForm = () => {
    setSymptoms('')
    setAge('')
    setGender('Male')
    setResult(null)
  }

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">AI Symptom Checker</h2>
          <p className="text-gray-400 text-sm">AI-powered preliminary diagnosis assistant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>🤖</span> Patient Information
              </h3>

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Age</label>
                  <input type="number" placeholder="e.g. 35" value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div className="mb-4">
                <label className="text-gray-400 text-xs mb-1 block">Symptoms *</label>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                  placeholder="Describe symptoms in detail: e.g. severe headache for 3 days, mild fever, nausea, sensitivity to light..."
                  rows={5}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm resize-none" />
              </div>

              {/* Quick symptom chips */}
              <div className="mb-4">
                <p className="text-gray-500 text-xs mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {['Fever', 'Headache', 'Cough', 'Chest Pain', 'Nausea', 'Fatigue', 'Shortness of breath'].map(s => (
                    <button key={s}
                      onClick={() => setSymptoms(prev => prev ? `${prev}, ${s.toLowerCase()}` : s.toLowerCase())}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1 rounded-full text-xs cursor-pointer transition-colors border border-gray-700">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCheck} disabled={loading}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                    loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Analyzing…
                    </span>
                  ) : '🔍 Analyze Symptoms'}
                </button>
                <button onClick={clearForm}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium text-sm cursor-pointer transition-colors">
                  Clear
                </button>
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className={`border rounded-xl p-5 ${colors.bg} ${colors.border}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">
                    {severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : severity === 'medium' ? '⚡' : '✅'}
                  </span>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                      {(result.severity || 'LOW').toUpperCase()} SEVERITY
                    </span>
                    <p className="text-white font-semibold mt-1">{result.condition || result.diagnosis || 'Analysis Complete'}</p>
                  </div>
                </div>

                {result.description && (
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{result.description}</p>
                )}

                {result.recommendations?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Recommendations</p>
                    <ul className="space-y-1">
                      {result.recommendations.map((r, i) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.possibleConditions?.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Possible Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {result.possibleConditions.map((c, i) => (
                        <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-500 text-xs">⚠️ This is AI-assisted preliminary analysis only. Always consult a qualified doctor for medical advice.</p>
                </div>
              </div>
            )}
          </div>

          {/* History Panel */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 text-sm">Recent Checks</h3>
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p className="text-3xl mb-2">🔍</p>
                  No checks yet
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => {
                    const s = h.result?.severity?.toLowerCase() || 'low'
                    const c = severityColors[s] || severityColors.low
                    return (
                      <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-gray-600 transition-colors"
                        onClick={() => { setSymptoms(h.symptoms); setResult(h.result); setAge(h.age); setGender(h.gender) }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.badge}`}>
                            {(h.result?.severity || 'LOW').toUpperCase()}
                          </span>
                          <span className="text-gray-500 text-xs">{h.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-gray-300 text-xs line-clamp-2">{h.symptoms}</p>
                        {h.result?.condition && <p className="text-blue-400 text-xs mt-1 font-medium">{h.result.condition}</p>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3 text-sm">Severity Guide</h3>
              <div className="space-y-2">
                {[
                  { level: 'Low',      desc: 'Monitor at home', color: 'bg-green-900 text-green-400' },
                  { level: 'Medium',   desc: 'Schedule appointment', color: 'bg-yellow-900 text-yellow-400' },
                  { level: 'High',     desc: 'Visit doctor today', color: 'bg-orange-900 text-orange-400' },
                  { level: 'Critical', desc: 'Emergency care needed', color: 'bg-red-900 text-red-400' },
                ].map(({ level, desc, color }) => (
                  <div key={level} className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-16 text-center ${color}`}>{level}</span>
                    <span className="text-gray-400 text-xs">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

