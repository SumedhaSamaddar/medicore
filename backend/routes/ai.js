const express = require('express')
const router = express.Router()

// PURE AI VERSION - No hardcoded medical responses
router.post('/analyze-symptoms', async (req, res) => {
  const { symptoms } = req.body

  if (!symptoms) {
    return res.status(400).json({ 
      error: 'Symptoms required',
      message: 'Please provide symptoms to analyze'
    })
  }

  try {
    console.log('🤖 Calling OpenAI API for:', symptoms)
    
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
        max_tokens: 300,
        temperature: 0.3
      })
    })

    const data = await response.json()
    
    // If OpenAI returns an error, send that error to frontend
    if (!response.ok || data.error) {
      console.error('OpenAI API error:', data)
      return res.status(500).json({ 
        error: 'OpenAI API Error',
        details: data.error?.message || 'Unknown OpenAI error',
        code: response.status
      })
    }

    let text = data.choices[0].message.content
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const parsed = JSON.parse(text)
    console.log('✅ AI Analysis complete:', parsed)
    res.json(parsed)

  } catch (error) {
    console.error('Server error:', error.message)
    res.status(500).json({ 
      error: 'Server Error',
      details: error.message
    })
  }
})

// Test endpoint to verify API key
router.get('/check-key', (req, res) => {
  const hasKey = !!process.env.OPENAI_API_KEY
  res.json({
    apiKeyConfigured: hasKey,
    message: hasKey ? 'API key is set' : 'API key is missing'
  })
})

module.exports = router