// backend/routes/emergency.js
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// ─── SCHEMAS ────────────────────────────────────────────────────────────────

const HospitalSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  address:  String,
  contact:  String,
  distance: String,
  beds: {
    icu:       { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    general:   { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    emergency: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } }
  }
}, { timestamps: true })

const AmbulanceSchema = new mongoose.Schema({
  vehicleNumber:   { type: String, required: true, unique: true },
  driver:          { name: String, phone: String },
  type:            { type: String, default: 'Basic Life Support' },
  status:          { type: String, default: 'Available', enum: ['Available', 'Dispatched', 'Maintenance'] },
  currentLocation: { type: String, default: 'Base Station' }
}, { timestamps: true })

const EmergencyRequestSchema = new mongoose.Schema({
  trackingId:    { type: String, unique: true },
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName:   { type: String, required: true },
  patientPhone:  String,
  location:      { type: String, required: true },
  symptoms:      String,
  emergencyLevel:{ type: String, default: 'MEDIUM', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  status:        { type: String, default: 'Requested',
                   enum: ['Requested', 'Dispatched', 'En Route', 'Arrived', 'Completed', 'Cancelled'] },
  ambulance:     { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
  hospital:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }
}, { timestamps: true })

// Auto-generate trackingId before save
EmergencyRequestSchema.pre('save', function (next) {
  if (!this.trackingId) {
    this.trackingId = 'EMG-' + Date.now().toString(36).toUpperCase()
  }
  next()
})

// Use existing models if already registered (avoids OverwriteModelError)
const Hospital  = mongoose.models.Hospital  || mongoose.model('Hospital',  HospitalSchema)
const Ambulance = mongoose.models.Ambulance || mongoose.model('Ambulance', AmbulanceSchema)
const EmergencyRequest = mongoose.models.EmergencyRequest || mongoose.model('EmergencyRequest', EmergencyRequestSchema)

// ─── HOSPITAL ROUTES ────────────────────────────────────────────────────────

// GET all hospitals
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 })
    res.json(hospitals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create hospital
router.post('/hospitals', async (req, res) => {
  try {
    const hospital = new Hospital(req.body)
    const saved = await hospital.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT update hospital beds
router.put('/hospitals/:id/beds', async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { beds: req.body.beds },
      { new: true }
    )
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' })
    res.json(hospital)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE hospital
router.delete('/hospitals/:id', async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id)
    res.json({ message: 'Hospital deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── AMBULANCE ROUTES ───────────────────────────────────────────────────────

// GET all available ambulances
router.get('/ambulances/available', async (req, res) => {
  try {
    const ambulances = await Ambulance.find({ status: 'Available' }).sort({ createdAt: -1 })
    res.json(ambulances)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET all ambulances
router.get('/ambulances', async (req, res) => {
  try {
    const ambulances = await Ambulance.find().sort({ createdAt: -1 })
    res.json(ambulances)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create ambulance
router.post('/ambulances', async (req, res) => {
  try {
    const ambulance = new Ambulance(req.body)
    const saved = await ambulance.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT update ambulance status
router.put('/ambulances/:id/status', async (req, res) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    if (!ambulance) return res.status(404).json({ message: 'Ambulance not found' })
    res.json(ambulance)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// ─── EMERGENCY REQUEST ROUTES ────────────────────────────────────────────────

// GET all requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await EmergencyRequest.find()
      .populate('ambulance', 'vehicleNumber type driver')
      .populate('hospital', 'name contact distance')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create request
router.post('/requests', async (req, res) => {
  try {
    const { ambulanceId, hospitalId, ...rest } = req.body

    const requestData = { ...rest }
    if (ambulanceId) requestData.ambulance = ambulanceId
    if (hospitalId)  requestData.hospital  = hospitalId

    const request = new EmergencyRequest(requestData)
    const saved = await request.save()

    // Mark ambulance as dispatched
    if (ambulanceId) {
      await Ambulance.findByIdAndUpdate(ambulanceId, { status: 'Dispatched' })
    }

    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT update request status
router.put('/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('ambulance', 'vehicleNumber type')

    if (!request) return res.status(404).json({ message: 'Request not found' })

    // If completed/cancelled, free up the ambulance
    if ((status === 'Completed' || status === 'Cancelled') && request.ambulance) {
      await Ambulance.findByIdAndUpdate(request.ambulance._id, { status: 'Available' })
    }

    res.json(request)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// ─── AI ASSESSMENT ───────────────────────────────────────────────────────────

router.post('/assess', async (req, res) => {
  try {
    const { symptoms } = req.body
    if (!symptoms) return res.status(400).json({ message: 'Symptoms required' })

    const sym = symptoms.toLowerCase()

    // Rule-based assessment (no external AI needed)
    let level = 'LOW'
    let action = 'Monitor and observe'
    let recommendation = 'Schedule an appointment with a doctor.'
    let ambulanceNeeded = false

    const criticalKeywords = ['cardiac arrest', 'not breathing', 'unconscious', 'stroke', 'severe bleeding', 'heart attack', 'unresponsive']
    const highKeywords     = ['chest pain', 'difficulty breathing', 'breathing difficulty', 'shortness of breath', 'severe pain', 'heavy bleeding', 'seizure', 'overdose']
    const mediumKeywords   = ['fracture', 'broken bone', 'moderate pain', 'vomiting blood', 'head injury', 'high fever', 'allergic reaction']

    if (criticalKeywords.some(k => sym.includes(k))) {
      level = 'CRITICAL'
      action = 'CALL 112 IMMEDIATELY'
      recommendation = 'Life-threatening emergency. Dispatch ambulance and proceed to ICU immediately.'
      ambulanceNeeded = true
    } else if (highKeywords.some(k => sym.includes(k))) {
      level = 'HIGH'
      action = 'Immediate medical attention required'
      recommendation = 'Serious condition. Dispatch ambulance and go to emergency department now.'
      ambulanceNeeded = true
    } else if (mediumKeywords.some(k => sym.includes(k))) {
      level = 'MEDIUM'
      action = 'Medical attention needed soon'
      recommendation = 'Moderate condition. Visit emergency department within 1-2 hours.'
      ambulanceNeeded = false
    }

    // Find recommended hospital with most available beds
    const hospitals = await Hospital.find().sort({ createdAt: -1 })
    let recommendedHospital = null
    if (hospitals.length > 0) {
      recommendedHospital = hospitals.reduce((best, h) => {
        const hTotal = (h.beds?.icu?.available || 0) + (h.beds?.emergency?.available || 0)
        const bTotal = (best.beds?.icu?.available || 0) + (best.beds?.emergency?.available || 0)
        return hTotal > bTotal ? h : best
      }, hospitals[0])
    }

    res.json({ level, action, recommendation, ambulanceNeeded, recommendedHospital })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── STATS ───────────────────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const [totalHospitals, totalAmbulances, availableAmbulances, activeRequests] = await Promise.all([
      Hospital.countDocuments(),
      Ambulance.countDocuments(),
      Ambulance.countDocuments({ status: 'Available' }),
      EmergencyRequest.countDocuments({ status: { $in: ['Requested', 'Dispatched', 'En Route', 'Arrived'] } })
    ])

    res.json({ totalHospitals, totalAmbulances, availableAmbulances, activeRequests })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
