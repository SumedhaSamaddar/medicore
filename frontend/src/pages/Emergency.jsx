import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import {
  getHospitals,
  createHospital,
  updateHospitalBeds,
  getAvailableAmbulances,
  createAmbulance,
  createEmergencyRequest,
  getEmergencyRequests,
  updateRequestStatus,
  assessEmergency,
  getEmergencyStats,
  getPatients
} from '../api'

const levelColors = {
  'CRITICAL': { bg: 'bg-red-950 border-red-500', badge: 'bg-red-600', text: 'text-red-400' },
  'HIGH': { bg: 'bg-orange-950 border-orange-500', badge: 'bg-orange-600', text: 'text-orange-400' },
  'MEDIUM': { bg: 'bg-yellow-950 border-yellow-500', badge: 'bg-yellow-600', text: 'text-yellow-400' },
  'LOW': { bg: 'bg-green-950 border-green-500', badge: 'bg-green-600', text: 'text-green-400' }
}

const statusColors = {
  'Requested': 'bg-yellow-900 text-yellow-400',
  'Dispatched': 'bg-blue-900 text-blue-400',
  'En Route': 'bg-purple-900 text-purple-400',
  'Arrived': 'bg-green-900 text-green-400',
  'Completed': 'bg-gray-700 text-gray-300',
  'Cancelled': 'bg-red-900 text-red-400'
}

export default function Emergency() {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])
  const [ambulances, setAmbulances] = useState([])
  const [requests, setRequests] = useState([])
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Assessment
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessment, setAssessment] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [assessing, setAssessing] = useState(false)

  // Request Form
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState({
    patient: '',
    patientName: '',
    patientPhone: '',
    location: '',
    symptoms: '',
    emergencyLevel: 'MEDIUM',
    ambulanceId: '',
    hospitalId: ''
  })

  // Add Hospital Form
  const [showHospitalForm, setShowHospitalForm] = useState(false)
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    address: '',
    contact: '',
    distance: '',
    beds: {
      icu: { total: 0, available: 0 },
      general: { total: 0, available: 0 },
      emergency: { total: 0, available: 0 }
    }
  })

  // Add Ambulance Form
  const [showAmbulanceForm, setShowAmbulanceForm] = useState(false)
  const [ambulanceForm, setAmbulanceForm] = useState({
    vehicleNumber: '',
    driver: { name: '', phone: '' },
    type: 'Basic Life Support',
    currentLocation: 'Base Station'
  })

  // Safe data fetching function
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Default empty data structure
      const defaultData = {
        hospitals: [],
        ambulances: [],
        requests: [],
        stats: {
          totalHospitals: 0,
          totalAmbulances: 0,
          availableAmbulances: 0,
          activeRequests: 0
        },
        patients: []
      }

      // Check if API functions exist
      const apiFunctions = {
        hospitals: typeof getHospitals === 'function',
        ambulances: typeof getAvailableAmbulances === 'function',
        requests: typeof getEmergencyRequests === 'function',
        stats: typeof getEmergencyStats === 'function',
        patients: typeof getPatients === 'function'
      }

      console.log('API Functions available:', apiFunctions)

      const results = await Promise.allSettled([
        apiFunctions.hospitals ? getHospitals() : Promise.resolve({ data: [] }),
        apiFunctions.ambulances ? getAvailableAmbulances() : Promise.resolve({ data: [] }),
        apiFunctions.requests ? getEmergencyRequests() : Promise.resolve({ data: [] }),
        apiFunctions.stats ? getEmergencyStats() : Promise.resolve({ data: defaultData.stats }),
        apiFunctions.patients ? getPatients() : Promise.resolve({ data: [] })
      ])

      // Process results with safe defaults
      const [
        hospitalsResult,
        ambulancesResult,
        requestsResult,
        statsResult,
        patientsResult
      ] = results

      // Safely set state with fallbacks
      setHospitals(Array.isArray(hospitalsResult?.value?.data) ? hospitalsResult.value.data : [])
      setAmbulances(Array.isArray(ambulancesResult?.value?.data) ? ambulancesResult.value.data : [])
      setRequests(Array.isArray(requestsResult?.value?.data) ? requestsResult.value.data : [])
      setStats(statsResult?.value?.data || defaultData.stats)
      setPatients(Array.isArray(patientsResult?.value?.data) ? patientsResult.value.data : [])
      
      setDataLoaded(true)

    } catch (err) {
      console.error('Fatal error in fetchData:', err)
      setError(err.message)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // UseEffect with proper cleanup
  useEffect(() => {
    let isMounted = true
    let timeoutId = null

    const loadData = async () => {
      if (!isMounted) return
      
      try {
        await fetchData()
      } catch (err) {
        if (isMounted) {
          console.error('Load data error:', err)
          setError('Failed to load data')
        }
      }
    }

    loadData()

    // Safety timeout - if loading takes too long, show error
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false)
        setError('Loading timeout - please refresh')
      }
    }, 10000)

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, []) // Empty dependency array - run once on mount

  const handleAssess = async () => {
    if (!symptoms.trim()) {
      toast.error('Please enter symptoms')
      return
    }

    setAssessing(true)
    try {
      if (typeof assessEmergency !== 'function') {
        throw new Error('Assessment API not available')
      }
      
      const res = await assessEmergency(symptoms)
      setAssessment(res?.data || null)
      setShowAssessment(true)
      
      if (res?.data?.ambulanceNeeded) {
        setRequestForm(prev => ({
          ...prev,
          symptoms,
          emergencyLevel: res.data.level || 'MEDIUM',
          hospitalId: res.data.recommendedHospital?._id || ''
        }))
      }
    } catch (err) {
      console.error('Assessment error:', err)
      toast.error('Assessment failed')
    } finally {
      setAssessing(false)
    }
  }

  const handleCreateRequest = async () => {
    if (!requestForm.patientName || !requestForm.location || !requestForm.ambulanceId) {
      toast.error('Please fill required fields')
      return
    }

    try {
      if (typeof createEmergencyRequest !== 'function') {
        throw new Error('Create request API not available')
      }

      const res = await createEmergencyRequest(requestForm)
      toast.success(`Emergency request created! Tracking: ${res?.data?.trackingId || 'N/A'}`)
      setShowRequestForm(false)
      setRequestForm({
        patient: '', patientName: '', patientPhone: '', location: '',
        symptoms: '', emergencyLevel: 'MEDIUM', ambulanceId: '', hospitalId: ''
      })
      fetchData()
    } catch (err) {
      console.error('Create request error:', err)
      toast.error('Failed to create request')
    }
  }

  const handleAddHospital = async () => {
    if (!hospitalForm.name) {
      toast.error('Hospital name required')
      return
    }

    try {
      if (typeof createHospital !== 'function') {
        throw new Error('Create hospital API not available')
      }

      await createHospital(hospitalForm)
      toast.success('Hospital added successfully')
      setShowHospitalForm(false)
      setHospitalForm({
        name: '', address: '', contact: '', distance: '',
        beds: {
          icu: { total: 0, available: 0 },
          general: { total: 0, available: 0 },
          emergency: { total: 0, available: 0 }
        }
      })
      fetchData()
    } catch (err) {
      console.error('Add hospital error:', err)
      toast.error('Failed to add hospital')
    }
  }

  const handleAddAmbulance = async () => {
    if (!ambulanceForm.vehicleNumber || !ambulanceForm.driver.name) {
      toast.error('Please fill required fields')
      return
    }

    try {
      if (typeof createAmbulance !== 'function') {
        throw new Error('Create ambulance API not available')
      }

      await createAmbulance(ambulanceForm)
      toast.success('Ambulance added successfully')
      setShowAmbulanceForm(false)
      setAmbulanceForm({
        vehicleNumber: '',
        driver: { name: '', phone: '' },
        type: 'Basic Life Support',
        currentLocation: 'Base Station'
      })
      fetchData()
    } catch (err) {
      console.error('Add ambulance error:', err)
      toast.error('Failed to add ambulance')
    }
  }

  const handleUpdateRequestStatus = async (id, newStatus) => {
    try {
      if (typeof updateRequestStatus !== 'function') {
        throw new Error('Update status API not available')
      }

      await updateRequestStatus(id, newStatus)
      toast.success('Status updated')
      fetchData()
    } catch (err) {
      console.error('Update status error:', err)
      toast.error('Failed to update')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading emergency services...</p>
          <p className="text-gray-500 text-sm">If this takes too long, please refresh</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-4 md:p-8 max-w-md text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Main render - make sure this returns the JSX
  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />

      <div className="ml-0 md:ml-0 md:ml-64 flex-1 p-4 md:p-4 md:p-8 pt-16 md:pt-16 md:pt-8">
        {/* Emergency Header */}
        <div className="bg-red-900 border-2 border-red-500 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-6xl">🚨</span>
              <div>
                <h2 className="text-xl md:text-2xl md:text-3xl font-bold text-white">Emergency Management</h2>
                <p className="text-red-300 text-lg">
                  Hospital Network • Ambulance Fleet • Emergency Requests
                </p>
              </div>
            </div>
            {stats && (
              <div className="flex gap-4">
                <div className="bg-red-950 rounded-lg p-3 text-center">
                  <p className="text-red-400 text-xs">Hospitals</p>
                  <p className="text-white font-bold text-xl md:text-2xl">{stats.totalHospitals || 0}</p>
                </div>
                <div className="bg-red-950 rounded-lg p-3 text-center">
                  <p className="text-red-400 text-xs">Available Ambulances</p>
                  <p className="text-white font-bold text-xl md:text-2xl">
                    {stats.availableAmbulances || 0}/{stats.totalAmbulances || 0}
                  </p>
                </div>
                <div className="bg-red-950 rounded-lg p-3 text-center">
                  <p className="text-red-400 text-xs">Active Requests</p>
                  <p className="text-white font-bold text-xl md:text-2xl">{stats.activeRequests || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Assessment */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">🤖 AI Emergency Assessment</h3>
          
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="Describe emergency symptoms: chest pain, difficulty breathing, severe bleeding..."
            rows={3}
            className="w-full bg-gray-800 text-white border border-gray-700 
                       rounded-lg px-4 py-3 focus:outline-none 
                       focus:border-blue-500 placeholder-gray-500 resize-none mb-3"
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleAssess}
              disabled={assessing}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors
                         ${assessing 
                           ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                           : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                         }`}
            >
              {assessing ? 'Analyzing...' : 'Assess Emergency Level'}
            </button>
            
            {assessment?.ambulanceNeeded && (
              <button
                onClick={() => {
                  setShowRequestForm(true)
                  setShowAssessment(false)
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 
                           rounded-lg font-medium transition-colors cursor-pointer"
              >
                🚨 Request Ambulance Now
              </button>
            )}
          </div>

          {showAssessment && assessment && (
            <div className={`mt-4 border-2 rounded-lg p-4 ${levelColors[assessment.level]?.bg || 'bg-gray-900'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-4 py-2 rounded-full text-white font-bold text-lg ${levelColors[assessment.level]?.badge || 'bg-gray-700'}`}>
                  {assessment.level || 'UNKNOWN'} PRIORITY
                </span>
                <p className="text-white font-semibold text-lg">{assessment.action || 'Assessment complete'}</p>
              </div>
              
              <p className={`mb-3 ${levelColors[assessment.level]?.text || 'text-gray-400'}`}>
                {assessment.recommendation || 'Please provide more details for better assessment.'}
              </p>
              
              {assessment.recommendedHospital && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">
                    <strong>Recommended Hospital:</strong> {assessment.recommendedHospital.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {assessment.recommendedHospital.distance || 'Distance unknown'} • {assessment.recommendedHospital.contact || 'Contact unavailable'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Hospitals Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🏥 Hospital Network</h3>
              <button
                onClick={() => setShowHospitalForm(!showHospitalForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 
                           rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                + Add Hospital
              </button>
            </div>

            {showHospitalForm && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
                {/* Hospital form fields */}
                <input
                  placeholder="Hospital Name *"
                  value={hospitalForm.name}
                  onChange={e => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  placeholder="Address"
                  value={hospitalForm.address}
                  onChange={e => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  placeholder="Contact Number"
                  value={hospitalForm.contact}
                  onChange={e => setHospitalForm({ ...hospitalForm, contact: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  placeholder="Distance (e.g., 2.5 km)"
                  value={hospitalForm.distance}
                  onChange={e => setHospitalForm({ ...hospitalForm, distance: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-blue-500"
                />

                <p className="text-gray-400 text-sm mb-2">Bed Capacity:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="ICU Total"
                    value={hospitalForm.beds.icu.total}
                    onChange={e => setHospitalForm({
                      ...hospitalForm,
                      beds: { ...hospitalForm.beds, icu: { ...hospitalForm.beds.icu, total: parseInt(e.target.value) || 0 }}
                    })}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="ICU Available"
                    value={hospitalForm.beds.icu.available}
                    onChange={e => setHospitalForm({
                      ...hospitalForm,
                      beds: { ...hospitalForm.beds, icu: { ...hospitalForm.beds.icu, available: parseInt(e.target.value) || 0 }}
                    })}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="General Total"
                    value={hospitalForm.beds.general.total}
                    onChange={e => setHospitalForm({
                      ...hospitalForm,
                      beds: { ...hospitalForm.beds, general: { ...hospitalForm.beds.general, total: parseInt(e.target.value) || 0 }}
                    })}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="General Available"
                    value={hospitalForm.beds.general.available}
                    onChange={e => setHospitalForm({
                      ...hospitalForm,
                      beds: { ...hospitalForm.beds, general: { ...hospitalForm.beds.general, available: parseInt(e.target.value) || 0 }}
                    })}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Emergency Total"
                    value={hospitalForm.beds.emergency.total}
                    onChange={e => setHospitalForm({
                      ...hospitalForm,
                      beds: { ...hospitalForm.beds, emergency: { ...hospitalForm.beds.emergency, total: parseInt(e.target.value) || 0 }}
                    })}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Emergency Available"
                    value={hospitalForm.beds.emergency.available}
                    onChange={e => setHospitalForm({
                      ...hospitalForm,
                      beds: { ...hospitalForm.beds, emergency: { ...hospitalForm.beds.emergency, available: parseInt(e.target.value) || 0 }}
                    })}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddHospital}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 
                               rounded-lg text-sm font-medium cursor-pointer"
                  >
                    Save Hospital
                  </button>
                  <button
                    onClick={() => setShowHospitalForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 
                               rounded-lg text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {Array.isArray(hospitals) && hospitals.map((hospital, index) => {
                if (!hospital) return null
                
                // Safely access nested properties
                const icuAvailable = hospital.beds?.icu?.available || 0
                const icuTotal = hospital.beds?.icu?.total || 0
                const generalAvailable = hospital.beds?.general?.available || 0
                const generalTotal = hospital.beds?.general?.total || 0
                const emergencyAvailable = hospital.beds?.emergency?.available || 0
                const emergencyTotal = hospital.beds?.emergency?.total || 0
                
                const totalAvailable = icuAvailable + generalAvailable + emergencyAvailable
                
                return (
                  <div key={hospital._id || index} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-bold">{hospital.name || 'Unknown Hospital'}</h4>
                        <p className="text-gray-400 text-xs">📍 {hospital.distance || 'Distance unknown'}</p>
                        <p className="text-gray-400 text-xs">📞 {hospital.contact || 'Contact unavailable'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        totalAvailable > 15 ? 'bg-green-900 text-green-400' :
                        totalAvailable > 5 ? 'bg-yellow-900 text-yellow-400' :
                        'bg-red-900 text-red-400'
                      }`}>
                        {totalAvailable} beds
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="bg-gray-800 rounded p-2 text-center">
                        <p className="text-gray-400 text-xs">ICU</p>
                        <p className="text-white font-bold">{icuAvailable}</p>
                        <p className="text-gray-500 text-xs">of {icuTotal}</p>
                      </div>
                      <div className="bg-gray-800 rounded p-2 text-center">
                        <p className="text-gray-400 text-xs">General</p>
                        <p className="text-white font-bold">{generalAvailable}</p>
                        <p className="text-gray-500 text-xs">of {generalTotal}</p>
                      </div>
                      <div className="bg-gray-800 rounded p-2 text-center">
                        <p className="text-gray-400 text-xs">Emergency</p>
                        <p className="text-white font-bold">{emergencyAvailable}</p>
                        <p className="text-gray-500 text-xs">of {emergencyTotal}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {(!hospitals || hospitals.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  No hospitals added yet
                </div>
              )}
            </div>
          </div>

          {/* Ambulances Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🚑 Ambulance Fleet</h3>
              <button
                onClick={() => setShowAmbulanceForm(!showAmbulanceForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 
                           rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                + Add Ambulance
              </button>
            </div>

            {showAmbulanceForm && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
                <input
                  placeholder="Vehicle Number *"
                  value={ambulanceForm.vehicleNumber}
                  onChange={e => setAmbulanceForm({ ...ambulanceForm, vehicleNumber: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  placeholder="Driver Name *"
                  value={ambulanceForm.driver.name}
                  onChange={e => setAmbulanceForm({ 
                    ...ambulanceForm, 
                    driver: { ...ambulanceForm.driver, name: e.target.value }
                  })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  placeholder="Driver Phone *"
                  value={ambulanceForm.driver.phone}
                  onChange={e => setAmbulanceForm({ 
                    ...ambulanceForm, 
                    driver: { ...ambulanceForm.driver, phone: e.target.value }
                  })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
                />
                <select
                  value={ambulanceForm.type}
                  onChange={e => setAmbulanceForm({ ...ambulanceForm, type: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-blue-500"
                >
                  <option>Basic Life Support</option>
                  <option>Advanced Life Support</option>
                  <option>Cardiac Ambulance</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddAmbulance}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 
                               rounded-lg text-sm font-medium cursor-pointer"
                  >
                    Save Ambulance
                  </button>
                  <button
                    onClick={() => setShowAmbulanceForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 
                               rounded-lg text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {Array.isArray(ambulances) && ambulances.map((ambulance, index) => (
                <div key={ambulance._id || index} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-bold">{ambulance.vehicleNumber || 'Unknown Vehicle'}</p>
                      <p className="text-gray-400 text-xs">{ambulance.type || 'Type unknown'}</p>
                      <p className="text-gray-400 text-xs">Driver: {ambulance.driver?.name || 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">📞 {ambulance.driver?.phone || 'No phone'}</p>
                    </div>
                    <span className="bg-green-900 text-green-400 px-2 py-1 
                                     rounded-full text-xs font-bold">
                      {ambulance.status || 'Available'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setRequestForm(prev => ({ ...prev, ambulanceId: ambulance._id }))
                      setShowRequestForm(true)
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 
                               rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Dispatch Ambulance
                  </button>
                </div>
              ))}

              {(!ambulances || ambulances.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  No ambulances available
                </div>
              )}
            </div>
          </div>

          {/* Emergency Requests Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">📋 Emergency Requests</h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {Array.isArray(requests) && requests.slice(0, 10).map((req, index) => (
                <div key={req._id || index} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-bold">{req.patientName || 'Unknown Patient'}</p>
                      <p className="text-gray-400 text-xs">📞 {req.patientPhone || 'No phone'}</p>
                      <p className="text-gray-400 text-xs">📍 {req.location || 'Location unknown'}</p>
                      <p className="text-gray-300 text-xs mt-1">{req.symptoms || 'No symptoms provided'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      levelColors[req.emergencyLevel]?.badge || 'bg-gray-700'
                    } text-white`}>
                      {req.emergencyLevel || 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || 'bg-gray-700 text-gray-300'}`}>
                      {req.status || 'Unknown'}
                    </span>
                    <select
                      value={req.status || 'Requested'}
                      onChange={e => handleUpdateRequestStatus(req._id, e.target.value)}
                      className="bg-gray-800 text-gray-300 text-xs border border-gray-700 
                                 rounded px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option>Requested</option>
                      <option>Dispatched</option>
                      <option>En Route</option>
                      <option>Arrived</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <p className="text-gray-500 text-xs">
                      Tracking: <span className="text-blue-400 font-mono">{req.trackingId || 'N/A'}</span>
                    </p>
                    {req.ambulance && (
                      <p className="text-gray-500 text-xs">
                        Ambulance: {req.ambulance.vehicleNumber || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {(!requests || requests.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  No emergency requests yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
               onClick={() => setShowRequestForm(false)}>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg w-full m-4"
                 onClick={e => e.stopPropagation()}>
              
              <h3 className="text-xl font-bold text-white mb-4">🚨 Create Emergency Request</h3>

              <div className="space-y-3">
                <select
                  value={requestForm.patient}
                  onChange={e => {
                    const selected = Array.isArray(patients) ? patients.find(p => p._id === e.target.value) : null
                    setRequestForm({
                      ...requestForm,
                      patient: e.target.value,
                      patientName: selected?.name || '',
                      patientPhone: selected?.phone || ''
                    })
                  }}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Patient (or enter manually below)</option>
                  {Array.isArray(patients) && patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} - {p.phone}</option>
                  ))}
                </select>

                <input
                  placeholder="Patient Name *"
                  value={requestForm.patientName}
                  onChange={e => setRequestForm({ ...requestForm, patientName: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />

                <input
                  placeholder="Patient Phone *"
                  value={requestForm.patientPhone}
                  onChange={e => setRequestForm({ ...requestForm, patientPhone: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />

                <input
                  placeholder="Location / Address *"
                  value={requestForm.location}
                  onChange={e => setRequestForm({ ...requestForm, location: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />

                <textarea
                  placeholder="Symptoms / Emergency Details"
                  value={requestForm.symptoms}
                  onChange={e => setRequestForm({ ...requestForm, symptoms: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
                />

                <select
                  value={requestForm.emergencyLevel}
                  onChange={e => setRequestForm({ ...requestForm, emergencyLevel: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                  <option>CRITICAL</option>
                </select>

                <select
                  value={requestForm.ambulanceId}
                  onChange={e => setRequestForm({ ...requestForm, ambulanceId: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Ambulance *</option>
                  {Array.isArray(ambulances) && ambulances.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.vehicleNumber} - {a.type}
                    </option>
                  ))}
                </select>

                <select
                  value={requestForm.hospitalId}
                  onChange={e => setRequestForm({ ...requestForm, hospitalId: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Destination Hospital (Optional)</option>
                  {Array.isArray(hospitals) && hospitals.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateRequest}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 
                             rounded-lg font-bold transition-colors cursor-pointer"
                >
                  🚨 CREATE EMERGENCY REQUEST
                </button>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 
                             rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}