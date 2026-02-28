const express = require('express')
const router = express.Router()

// SIMPLE TEST ENDPOINT - Add this
router.get('/test-openai', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Check if key exists
    if (!apiKey) {
      return res.json({ 
        success: false, 
        error: 'No API key found in environment variables' 
      });
    }

    // Test OpenAI with a simple request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      })
    });

    const data = await response.json();
    
    res.json({
      success: response.ok,
      status: response.status,
      data: data,
      keyExists: true,
      keyPrefix: apiKey.substring(0, 7) + '...'
    });

  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Your original analyze endpoint (fixed)
router.post('/analyze-symptoms', async (req, res) => {
  const { symptoms } = req.body

  if (!symptoms) {
    return res.status(400).json({ message: 'Symptoms required' })
  }

  try {
    console.log('Calling OpenAI with symptoms:', symptoms);
    
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
          content: `You are a medical triage assistant. Analyze these symptoms and respond ONLY in valid JSON format with no markdown:
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
    console.log('OpenAI response:', data);
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'OpenAI API failed');
    }

    let text = data.choices[0].message.content
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const parsed = JSON.parse(text)
    res.json(parsed)

  } catch (error) {
    console.error('Error details:', error.message);
    
    // Return error info so you know what's wrong
    res.status(500).json({ 
      error: 'OpenAI API failed',
      details: error.message,
      suggestion: 'Check if OPENAI_API_KEY is valid and has credits'
    });
  }
})

module.exports = router
