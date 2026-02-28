const express = require('express')
const router = express.Router()

router.post('/analyze-symptoms', async (req, res) => {
  const { symptoms } = req.body

  if (!symptoms) {
    return res.status(400).json({ message: 'Symptoms required' })
  }

  try {
    // Try OpenAI first
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `You are a medical triage assistant. Analyze these symptoms and respond ONLY in valid JSON format:
{
  "priority": "HIGH" or "MEDIUM" or "LOW",
  "reason": "one sentence explanation",
  "recommendation": "what should happen next",
  "possibleConditions": ["condition1", "condition2"]
}

Symptoms: ${symptoms}`
        }],
        temperature: 0.3
      })
    })

    const data = await response.json()
    
    if (data.error) {
      console.log('OpenAI API error, using fallback')
      // FALLBACK TO LOCAL LOGIC INSTEAD OF RETURNING API ERROR
      return analyzeLocally(symptoms, res)
    }

    let text = data.choices[0].message.content
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const parsed = JSON.parse(text)
    res.json(parsed)

  } catch (err) {
    console.log('OpenAI failed, using fallback')
    // USE FALLBACK INSTEAD OF RETURNING ERROR
    analyzeLocally(symptoms, res)
  }
})

// Separate function for local analysis
function analyzeLocally(symptoms, res) {
  const s = symptoms.toLowerCase()
  
  // Check for CRITICAL/HIGH symptoms first
  if (s.includes('chest pain') || 
      s.includes('difficulty breathing') || 
      s.includes('shortness of breath') ||
      s.includes('unconscious') || 
      s.includes('severe bleeding')) {
    
    return res.json({
      priority: 'HIGH',
      reason: '⚠️ EMERGENCY: Symptoms indicate a potentially life-threatening condition',
      recommendation: 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Heart attack', 'Pulmonary embolism', 'Medical emergency']
    })
  }
  
  // Check for MEDIUM symptoms
  else if (s.includes('high fever') ||
           s.includes('vomiting') ||
           s.includes('severe pain') ||
           s.includes('broken bone') ||
           s.includes('head injury')) {
    
    return res.json({
      priority: 'MEDIUM',
      reason: '⚕️ URGENT: Symptoms require prompt medical attention',
      recommendation: 'Visit Urgent Care or see doctor within 24 hours',
      possibleConditions: ['Infection', 'Fracture', 'Acute condition']
    })
  }
  
  // LOW symptoms (including chest pain with proper context)
  else if (s.includes('chest pain')) {
    // Even though we already checked above, this is a safety catch
    return res.json({
      priority: 'HIGH',
      reason: '⚠️ Chest pain requires immediate evaluation',
      recommendation: 'Go to Emergency Room now',
      possibleConditions: ['Cardiac event', 'Angina', 'Medical emergency']
    })
  }
  
  // Default LOW
  else {
    return res.json({
      priority: 'LOW',
      reason: 'Mild symptoms that can be monitored at home',
      recommendation: 'Rest, hydrate, and consult doctor if symptoms worsen',
      possibleConditions: ['Common cold', 'Viral infection', 'Allergies']
    })
  }
}

module.exports = router
