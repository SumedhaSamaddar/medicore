// src/pages/AIChecker.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const priorityStyles = {
  'HIGH':   { box: 'border-red-500 bg-red-950',    badge: 'bg-red-900 text-red-400',    icon: '🚨' },
  'MEDIUM': { box: 'border-yellow-500 bg-yellow-950', badge: 'bg-yellow-900 text-yellow-400', icon: '⚠️' },
  'LOW':    { box: 'border-green-500 bg-green-950',  badge: 'bg-green-900 text-green-400',  icon: '✅' },
}

const exampleCases = [
  "Patient has chest pain radiating to left arm, sweating, and shortness of breath",
  "Mild headache and slight fever since morning, no other symptoms",
  "Severe abdominal pain, vomiting, unable to eat since yesterday",
  "Routine checkup, no symptoms, just annual visit",
]

export default function AIChecker() {
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229', // Updated to a valid model name
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `You are a medical triage assistant. Analyze these symptoms and respond ONLY in this exact JSON format with no extra text:
{
  "priority": "HIGH" or "MEDIUM" or "LOW",
  "reason": "one sentence explanation",
  "recommendation": "what should happen next",
  "possibleConditions": ["condition1", "condition2"]
}

Symptoms: ${symptoms}`
          }]
        })
      })

      const data = await response.json()
      const text = data.content[0].text
      const parsed = JSON.parse(text)
      setResult(parsed)
      setHistory(prev => [{
        symptoms: symptoms.slice(0, 60) + '...',
        priority: parsed.priority,
        time: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)])

    } catch (err) {
      // Fallback if API fails — smart local logic
      const s = symptoms.toLowerCase()
      let priority = 'LOW'
      let reason = 'Symptoms appear mild and non-urgent.'
      let recommendation = 'Schedule a routine appointment.'
      let possibleConditions = ['Minor illness', 'Fatigue']

      if (s.includes('chest') || s.includes('breath') || s.includes('unconscious') ||
          s.includes('stroke') || s.includes('seizure') || s.includes('severe')) {
        priority = 'HIGH'
        reason = 'Symptoms suggest a potentially serious or life-threatening condition.'
        recommendation = 'Immediate emergency attention required. Do not wait.'
        possibleConditions = ['Cardiac event', 'Respiratory distress', 'Neurological emergency']
      } else if (s.includes('fever') || s.includes('vomit') || s.includes('pain') ||
                 s.includes('headache') || s.includes('dizziness')) {
        priority = 'MEDIUM'
        reason = 'Symptoms are moderate and require prompt medical evaluation.'
        recommendation = 'See a doctor within the next few hours.'
        possibleConditions = ['Viral infection', 'Dehydration', 'Inflammation']
      }

      setResult({ priority, reason, recommendation, possibleConditions })
      setHistory(prev => [{
        symptoms: symptoms.slice(0, 60) + '...',
        priority,
        time: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)])
    }
    setLoading(false)
  }

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">AI Symptom Checker</h2>
          <p className="text-gray-400">
            AI-powered triage assistant · Helps prioritize patient queue
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Input */}
          <div className="col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <label className="text-gray-300 text-sm font-medium block mb-3">
                Describe Patient Symptoms
              </label>
              <textarea
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="E.g. Patient is a 45-year-old male reporting chest pain, shortness of breath, and dizziness for the past 2 hours..."
                rows={5}
                className="w-full bg-gray-800 text-white border border-gray-700 
                           rounded-lg px-4 py-3 focus:outline-none 
                           focus:border-blue-500 placeholder-gray-500 
                           resize-none text-sm"
              />

              {/* Example Buttons */}
              <div className="mt-3">
                <p className="text-gray-500 text-xs mb-2">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleCases.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setSymptoms(ex)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 
                                 hover:text-white px-3 py-1.5 rounded-lg 
                                 transition-colors cursor-pointer text-left"
                    >
                      Example {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={analyzeSymptoms}
                disabled={loading || !symptoms.trim()}
                className={`mt-4 w-full py-3 rounded-lg font-semibold 
                            transition-colors cursor-pointer
                            ${loading || !symptoms.trim()
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Analyzing symptoms...
                  </span>
                ) : '🤖 Analyze with AI'}
              </button>
            </div>

            {/* Result Display */}
            {result && (
              <div className={`border-2 rounded-xl p-6 ${priorityStyles[result.priority].box}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">
                    {priorityStyles[result.priority].icon}
                  </span>
                  <div>
                    <p className="text-gray-400 text-sm">Priority Level</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold 
                                     ${priorityStyles[result.priority].badge}`}>
                      {result.priority} PRIORITY
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Assessment</p>
                    <p className="text-white">{result.reason}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Recommendation</p>
                    <p className="text-white">{result.recommendation}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Possible Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {result.possibleConditions?.map((c, i) => (
                        <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: History */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit">
            <h3 className="text-white font-semibold mb-4">Recent Checks</h3>
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No checks yet. Analyze symptoms to see history.</p>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityStyles[h.priority].badge}`}>
                        {h.priority}
                      </span>
                      <span className="text-gray-500 text-xs">{h.time}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{h.symptoms}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}