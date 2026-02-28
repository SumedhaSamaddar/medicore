const express = require('express')
const router = express.Router()

router.post('/analyze-symptoms', async (req, res) => {
  const { symptoms } = req.body
  console.log('='.repeat(50))
  console.log('🔍 SYMPTOM CHECKER STARTED')
  console.log('Symptoms received:', symptoms)
  console.log('Time:', new Date().toISOString())

  if (!symptoms) {
    return res.status(400).json({ message: 'Symptoms required' })
  }

  // Check if API key exists (but don't log the full key)
  const apiKey = process.env.OPENAI_API_KEY
  console.log('API Key present:', !!apiKey)
  console.log('API Key first 5 chars:', apiKey ? apiKey.substring(0, 5) + '...' : 'missing')
  console.log('NODE_ENV:', process.env.NODE_ENV)

  if (!apiKey) {
    console.log('❌ No API key found!')
    return res.status(500).json({ 
      priority: 'MEDIUM',
      reason: 'OpenAI API key not configured',
      recommendation: 'Please contact administrator',
      possibleConditions: ['Configuration Error']
    })
  }

  try {
    console.log('🤖 Calling OpenAI API...')
    console.log('Request URL: https://api.openai.com/v1/chat/completions')
    
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `You are a medical triage assistant. Analyze these symptoms and respond ONLY in valid JSON format with no markdown, no code blocks, just raw JSON:
{
  "priority": "HIGH" or "MEDIUM" or "LOW",
  "reason": "one sentence explanation",
  "recommendation": "what should happen next",
  "possibleConditions": ["condition1", "condition2"]
}

RULES:
- HIGH: Life-threatening emergencies (chest pain, difficulty breathing, severe bleeding, unconscious)
- MEDIUM: Urgent but not life-threatening (high fever, severe pain, vomiting, broken bone)
- LOW: Mild symptoms (headache, cough, runny nose, fatigue)

Symptoms: ${symptoms}`
      }],
      max_tokens: 300,
      temperature: 0.3
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('OpenAI Response Status:', response.status)
    console.log('OpenAI Response Headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2))

    const data = await response.json()
    console.log('OpenAI Response Data:', JSON.stringify(data, null, 2))
    
    if (data.error) {
      console.error('❌ OpenAI API Error:', data.error)
      
      // Return a helpful error message
      return res.status(200).json({
        priority: 'MEDIUM',
        reason: `OpenAI API Error: ${data.error.message || 'Unknown error'}`,
        recommendation: 'Please try again later',
        possibleConditions: ['API Error'],
        error: data.error
      })
    }

    if (!data.choices || !data.choices[0]) {
      console.error('❌ Unexpected OpenAI response format:', data)
      throw new Error('Unexpected API response format')
    }

    let text = data.choices[0].message.content
    console.log('Raw OpenAI content:', text)
    
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    console.log('Cleaned text:', text)
    
    const parsed = JSON.parse(text)
    console.log('✅ Parsed priority:', parsed.priority)
    console.log('✅ Full parsed response:', parsed)
    
    res.json(parsed)

  } catch (err) {
    console.error('❌ Server Error:', err.message)
    console.error('Error stack:', err.stack)
    
    // Enhanced fallback logic
    const s = symptoms.toLowerCase()
    console.log('Using fallback for symptoms:', s)
    
    let priority = 'LOW'
    let reason = 'Mild symptoms that can be monitored at home.'
    let recommendation = 'Rest, hydrate, and consult doctor if symptoms worsen.'
    let possibleConditions = ['Common cold', 'Mild viral infection']

    // HIGH PRIORITY (Life-threatening)
    const highKeywords = ['chest pain', 'difficulty breathing', 'shortness of breath', 
                         'unconscious', 'seizure', 'severe bleeding', 'stroke', 
                         'heart attack', 'choking', 'can\'t breathe']
    
    // MEDIUM PRIORITY (Urgent)
    const mediumKeywords = ['high fever', 'fever 103', 'vomiting', 'severe pain',
                           'broken bone', 'fracture', 'deep cut', 'burn', 
                           'head injury', 'confusion', 'dehydrated']

    for (const keyword of highKeywords) {
      if (s.includes(keyword)) {
        priority = 'HIGH'
        reason = `⚠️ EMERGENCY: ${keyword} detected - Life-threatening condition`
        recommendation = 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY'
        possibleConditions = ['Medical emergency', 'Life-threatening condition']
        console.log('🚨 HIGH priority matched:', keyword)
        break
      }
    }

    if (priority === 'LOW') {
      for (const keyword of mediumKeywords) {
        if (s.includes(keyword)) {
          priority = 'MEDIUM'
          reason = `⚕️ URGENT: ${keyword} requires prompt medical attention`
          recommendation = 'Visit Urgent Care or see doctor within 24 hours'
          possibleConditions = ['Acute condition', 'Requires medical evaluation']
          console.log('⚠️ MEDIUM priority matched:', keyword)
          break
        }
      }
    }

    console.log('✅ Final priority:', priority)
    res.json({ priority, reason, recommendation, possibleConditions })
  }
})

// Add test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'AI route is working',
    keyExists: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY ? 
      process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'not set',
    nodeEnv: process.env.NODE_ENV
  })
})

module.exports = router
