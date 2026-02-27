const express = require('express')
const router = express.Router()
const auth = require('../middleware/protect')

router.post('/analyze-symptoms', auth, async (req, res) => {
  const { symptoms } = req.body

  if (!symptoms) {
    return res.status(400).json({ message: 'Symptoms required' })
  }

  try {
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
          content: `You are a medical triage assistant. Analyze these symptoms and respond ONLY in valid JSON format with no markdown, no code blocks, just raw JSON:
{
  "priority": "HIGH" or "MEDIUM" or "LOW",
  "reason": "one sentence explanation",
  "recommendation": "what should happen next",
  "possibleConditions": ["condition1", "condition2"]
}

Symptoms: ${symptoms}`
        }],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    let text = data.choices[0].message.content
    
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const parsed = JSON.parse(text)
    
    res.json(parsed)

  } catch (err) {
    console.error('OpenAI Error:', err.message)
    
    // Smart fallback logic when API fails
    const s = symptoms.toLowerCase()
    let priority = 'LOW'
    let reason = 'Symptoms appear mild and non-urgent.'
    let recommendation = 'Schedule a routine appointment within the next few days.'
    let possibleConditions = ['Minor illness', 'General fatigue']

    if (s.includes('chest pain') || s.includes('chest') || 
        s.includes('shortness of breath') || s.includes('breath') || 
        s.includes('unconscious') || s.includes('stroke') || 
        s.includes('seizure') || s.includes('severe bleeding')) {
      priority = 'HIGH'
      reason = 'Symptoms suggest a potentially life-threatening condition.'
      recommendation = 'IMMEDIATE EMERGENCY attention required. Call ambulance or visit ER now.'
      possibleConditions = ['Cardiac emergency', 'Respiratory distress', 'Neurological emergency']
    } else if (s.includes('fever') || s.includes('high temperature') ||
               s.includes('vomit') || s.includes('vomiting') ||
               s.includes('severe pain') || s.includes('pain') ||
               s.includes('headache') || s.includes('dizziness') ||
               s.includes('abdominal')) {
      priority = 'MEDIUM'
      reason = 'Symptoms are moderate and require prompt medical evaluation.'
      recommendation = 'See a doctor within the next few hours to today.'
      possibleConditions = ['Viral infection', 'Bacterial infection', 'Dehydration', 'Inflammation']
    }

    res.json({ priority, reason, recommendation, possibleConditions })
  }
})

module.exports = router