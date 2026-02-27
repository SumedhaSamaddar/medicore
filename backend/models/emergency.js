const express = require('express')
const router = express.Router()
const auth = require('../middleware/protect')
const Hospital = require('../models/Hospital')
const Ambulance = require('../models/Ambulance')
const EmergencyRequest = require('../models/EmergencyRequest')

// ========== HOSPITALS ==========

// GET all hospitals
router.get('/hospitals', auth, async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true })
      .sort({ distance: 1 })
    res.json(hospitals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create hospital
router.post('/hospitals', auth, async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body)
    res.json(hospital)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update hospital beds
router.put('/hospitals/:id/beds', auth, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { beds: req.body.beds },
      { new: true }
    )
    res.json(hospital)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE hospital
router.delete('/hospitals/:id', auth, async (req, res) => {
  try {
    await Hospital.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Hospital deactivated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ========== AMBULANCES ==========

// GET all ambulances
router.get('/ambulances', auth, async (req, res) => {
  try {
    const ambulances = await Ambulance.find({ isActive: true })
    res.json(ambulances)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET available ambulances only
router.get('/ambulances/available', auth, async (req, res) => {
  try {
    const ambulances = await Ambulance.find({ 
      isActive: true,
      status: 'Available'
    })
    res.json(ambulances)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create ambulance
router.post('/ambulances', auth, async (req, res) => {
  try {
    const ambulance = await Ambulance.create(req.body)
    res.json(ambulance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update ambulance status
router.put('/ambulances/:id/status', auth, async (req, res) => {
  try {
    const { status, currentLocation } = req.body
    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      { status, currentLocation },
      { new: true }
    )
    res.json(ambulance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE ambulance
router.delete('/ambulances/:id', auth, async (req, res) => {
  try {
    await Ambulance.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Ambulance deactivated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ========== EMERGENCY REQUESTS ==========

// GET all emergency requests
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await EmergencyRequest.find()
      .populate('patient', 'name phone')
      .populate('ambulance', 'vehicleNumber driver type')
      .populate('hospital', 'name')
      .populate('requestedBy', 'name')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create emergency request
router.post('/requests', auth, async (req, res) => {
  try {
    const { patientName, patientPhone, location, symptoms, emergencyLevel, ambulanceId, hospitalId, patient } = req.body

    // Generate tracking ID
    const trackingId = `EMG${Date.now()}`

    // Create request
    const request = await EmergencyRequest.create({
      patient,
      patientName,
      patientPhone,
      location,
      symptoms,
      emergencyLevel,
      ambulance: ambulanceId,
      hospital: hospitalId,
      requestedBy: req.user.id,
      trackingId,
      status: 'Dispatched',
      dispatchedAt: new Date()
    })

    // Update ambulance status
    if (ambulanceId) {
      await Ambulance.findByIdAndUpdate(ambulanceId, { 
        status: 'Dispatched',
        currentLocation: location
      })
    }

    // Populate and return
    const populated = await EmergencyRequest.findById(request._id)
      .populate('ambulance')
      .populate('hospital')
      .populate('patient')

    res.json({
      success: true,
      request: populated,
      trackingId,
      message: 'Emergency request created successfully'
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update emergency request status
router.put('/requests/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body
    const updates = { status, notes }

    // Add timestamps based on status
    if (status === 'En Route') {
      const request = await EmergencyRequest.findById(req.params.id)
      if (request.ambulance) {
        await Ambulance.findByIdAndUpdate(request.ambulance, { 
          status: 'En Route'
        })
      }
    } else if (status === 'Arrived') {
      updates.arrivedAt = new Date()
      const request = await EmergencyRequest.findById(req.params.id)
      if (request.ambulance) {
        await Ambulance.findByIdAndUpdate(request.ambulance, { 
          status: 'Busy'
        })
      }
    } else if (status === 'Completed') {
      updates.completedAt = new Date()
      
      // Free up ambulance
      const request = await EmergencyRequest.findById(req.params.id)
      if (request.ambulance) {
        await Ambulance.findByIdAndUpdate(request.ambulance, { 
          status: 'Available',
          currentLocation: 'Base Station'
        })
      }
    }

    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('ambulance').populate('hospital').populate('patient')

    res.json(request)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST AI emergency assessment
router.post('/assess', auth, async (req, res) => {
  const { symptoms } = req.body

  try {
    const s = symptoms.toLowerCase()
    let level = 'LOW'
    let action = 'Schedule routine appointment'
    let ambulanceNeeded = false
    let recommendedHospital = null

    // Critical assessment
    if (s.includes('chest pain') || s.includes('heart attack') || 
        s.includes('stroke') || s.includes('unconscious') ||
        s.includes('severe bleeding') || s.includes('can\'t breathe') ||
        s.includes('breathing difficulty') || s.includes('seizure')) {
      level = 'CRITICAL'
      action = 'Request ambulance IMMEDIATELY'
      ambulanceNeeded = true
      
      // Find nearest hospital with ICU beds
      const hospitals = await Hospital.find({ 
        isActive: true,
        'beds.icu.available': { $gt: 0 }
      }).sort({ distance: 1 })
      
      recommendedHospital = hospitals[0] || null

    } else if (s.includes('severe pain') || s.includes('high fever') ||
               s.includes('vomiting blood') || s.includes('head injury') ||
               s.includes('broken bone') || s.includes('accident')) {
      level = 'HIGH'
      action = 'Visit emergency room immediately or request ambulance'
      ambulanceNeeded = false
      
      // Find nearest hospital with emergency beds
      const hospitals = await Hospital.find({ 
        isActive: true,
        'beds.emergency.available': { $gt: 0 }
      }).sort({ distance: 1 })
      
      recommendedHospital = hospitals[0] || null

    } else if (s.includes('fever') || s.includes('pain') || 
               s.includes('vomit') || s.includes('dizziness')) {
      level = 'MEDIUM'
      action = 'Visit doctor today or go to emergency if worsens'
      ambulanceNeeded = false
    }

    res.json({
      level,
      action,
      ambulanceNeeded,
      recommendedHospital,
      recommendation: ambulanceNeeded 
        ? 'Request ambulance immediately using the form below'
        : level === 'HIGH' 
          ? 'Visit emergency room or request ambulance if condition worsens'
          : 'Schedule an appointment with your doctor'
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalHospitals = await Hospital.countDocuments({ isActive: true })
    const totalAmbulances = await Ambulance.countDocuments({ isActive: true })
    const availableAmbulances = await Ambulance.countDocuments({ 
      isActive: true, 
      status: 'Available' 
    })
    const activeRequests = await EmergencyRequest.countDocuments({ 
      status: { $in: ['Requested', 'Dispatched', 'En Route'] }
    })
    
    res.json({
      totalHospitals,
      totalAmbulances,
      availableAmbulances,
      activeRequests
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router