// routes/ai.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Emergency keywords for safety override
const EMERGENCY_KEYWORDS = [
  'chest pain', 'chest pressure', 'heart attack', 'cardiac',
  'difficulty breathing', 'shortness of breath', 'cannot breathe', 'gasping',
  'unconscious', 'passed out', 'blacked out', 'seizure',
  'severe bleeding', 'gushing blood', 'hemorrhage',
  'stroke', 'facial droop', 'slurred speech', 'weakness on one side',
  'head injury', 'hit head', 'concussion',
  'severe allergic', 'anaphylaxis', 'swelling of tongue',
  'suicidal', 'want to die', 'overdose', 'poisoning'
];

// Medical triage system prompt
const SYSTEM_PROMPT = `You are a medical triage AI assistant. Your role is to assess symptoms and provide clear, actionable guidance.

CRITICAL RULES:
1. Patient safety is the top priority
2. When in doubt, err on the side of caution
3. Be clear and concise in recommendations
4. Never diagnose specific conditions, only suggest possibilities

PRIORITY LEVELS:
- HIGH (EMERGENCY): Life-threatening conditions requiring immediate 911/ER
- MEDIUM (URGENT): Serious conditions needing medical attention within 24 hours
- LOW (NON-URGENT): Minor issues that can be managed at home

HIGH PRIORITY EXAMPLES:
- Chest pain or pressure
- Difficulty breathing
- Severe bleeding
- Stroke symptoms (facial droop, slurred speech, weakness)
- Loss of consciousness
- Severe allergic reaction
- Head injury with confusion
- Suicidal thoughts

MEDIUM PRIORITY EXAMPLES:
- High fever (>103°F / 39.4°C)
- Persistent vomiting or diarrhea
- Signs of dehydration
- Severe pain
- Possible broken bones
- Deep cuts needing stitches
- Eye injuries

LOW PRIORITY EXAMPLES:
- Mild cold/flu symptoms
- Minor aches and pains
- Small cuts and bruises
- Common allergies
- Mild headaches

Always provide responses in valid JSON format only.`;

// Main symptom analysis endpoint
router.post('/analyze-symptoms', async (req, res) => {
  const { symptoms } = req.body;

  // Validate input
  if (!symptoms || typeof symptoms !== 'string') {
    return res.status(400).json({
      priority: 'LOW',
      reason: 'Invalid or missing symptoms',
      recommendation: 'Please describe your symptoms in detail',
      possibleConditions: ['Input required']
    });
  }

  const trimmedSymptoms = symptoms.trim();
  if (trimmedSymptoms.length === 0) {
    return res.status(400).json({
      priority: 'LOW',
      reason: 'No symptoms provided',
      recommendation: 'Please describe your symptoms',
      possibleConditions: ['Please enter symptoms']
    });
  }

  console.log(`[${new Date().toISOString()}] Analyzing symptoms:`, trimmedSymptoms);

  try {
    // Check for emergency keywords first (safety first!)
    const symptomsLower = trimmedSymptoms.toLowerCase();
    const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(keyword => 
      symptomsLower.includes(keyword.toLowerCase())
    );

    if (hasEmergencyKeyword) {
      console.log('Emergency keyword detected, returning HIGH priority');
      return res.json({
        priority: 'HIGH',
        reason: 'EMERGENCY: Your symptoms suggest a potentially life-threatening condition',
        recommendation: 'CALL 911 OR GO TO THE EMERGENCY ROOM IMMEDIATELY',
        possibleConditions: ['Medical Emergency', 'Requires Immediate Evaluation']
      });
    }

    // Prepare the prompt for OpenAI
    const userPrompt = `Analyze these symptoms and provide a triage assessment:

Symptoms: "${trimmedSymptoms}"

Return ONLY a JSON object with this exact structure:
{
  "priority": "HIGH" or "MEDIUM" or "LOW",
  "reason": "Brief explanation of the priority level (1 sentence)",
  "recommendation": "Clear next steps for the patient (1-2 sentences)",
  "possibleConditions": ["condition1", "condition2", "condition3"]
}

Guidelines:
- priority: Use HIGH only for true emergencies, MEDIUM for urgent but not life-threatening, LOW for minor issues
- reason: Be specific about why this priority level was chosen
- recommendation: Provide actionable advice (home care, see doctor, go to ER)
- possibleConditions: List 2-4 likely conditions based on the symptoms (be general, not specific diagnoses)`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if you have access
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent responses
      max_tokens: 350
    });

    const responseText = completion.choices[0].message.content;
    console.log('OpenAI response:', responseText);

    // Parse the JSON response
    let analysis;
    try {
      // Try to parse the response as JSON
      analysis = JSON.parse(responseText);
      
      // Validate and clean the response
      analysis = {
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(analysis.priority) ? analysis.priority : 'LOW',
        reason: analysis.reason || 'Based on symptom analysis',
        recommendation: analysis.recommendation || 'Monitor symptoms and consult a doctor if they persist',
        possibleConditions: Array.isArray(analysis.possibleConditions) 
          ? analysis.possibleConditions.slice(0, 4) 
          : ['General symptoms']
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      
      // Fallback: Create a structured response
      analysis = {
        priority: 'LOW',
        reason: 'Unable to analyze symptoms with AI at this time',
        recommendation: 'Please monitor your symptoms and consult a healthcare provider if they persist or worsen',
        possibleConditions: ['Temporary service issue']
      };
    }

    // Safety check: Ensure HIGH priority for obvious emergencies even if AI missed it
    const finalSymptoms = trimmedSymptoms.toLowerCase();
    if ((finalSymptoms.includes('chest') && finalSymptoms.includes('pain')) ||
        finalSymptoms.includes('heart attack') ||
        (finalSymptoms.includes('breath') && (finalSymptoms.includes('short') || finalSymptoms.includes('difficult'))) ||
        finalSymptoms.includes('unconscious') ||
        finalSymptoms.includes('cannot breathe')) {
      
      if (analysis.priority !== 'HIGH') {
        console.log('Safety override: Setting priority to HIGH');
        analysis.priority = 'HIGH';
        analysis.reason = 'EMERGENCY: Symptoms require immediate medical attention';
        analysis.recommendation = 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY';
        analysis.possibleConditions = ['Medical Emergency', 'Requires Immediate Evaluation'];
      }
    }

    console.log('Final analysis:', analysis);
    res.json(analysis);

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle specific OpenAI errors
    let errorMessage = 'AI service temporarily unavailable';
    let statusCode = 500;

    if (error.status === 401) {
      errorMessage = 'Invalid OpenAI API key';
      statusCode = 401;
    } else if (error.status === 429) {
      errorMessage = 'OpenAI rate limit exceeded. Please try again later';
      statusCode = 429;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to OpenAI service';
    }

    // Return a helpful fallback response
    res.status(statusCode).json({
      priority: 'LOW',
      reason: errorMessage,
      recommendation: 'Please consult a healthcare provider for proper evaluation of your symptoms',
      possibleConditions: ['Service temporarily unavailable']
    });
  }
});

// Simple rule-based fallback endpoint (no AI required)
router.post('/analyze-symptoms-fallback', (req, res) => {
  const { symptoms } = req.body;
  
  if (!symptoms || !symptoms.trim()) {
    return res.json({
      priority: 'LOW',
      reason: 'No symptoms provided',
      recommendation: 'Please describe your symptoms',
      possibleConditions: ['Please enter symptoms']
    });
  }

  const s = symptoms.toLowerCase();

  // Emergency checks
  if (s.includes('chest pain') || s.includes('difficulty breathing') || 
      s.includes('unconscious') || s.includes('severe bleeding')) {
    return res.json({
      priority: 'HIGH',
      reason: 'EMERGENCY: Symptoms require immediate medical attention',
      recommendation: 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Medical Emergency']
    });
  }

  // Urgent checks
  if (s.includes('high fever') || s.includes('vomiting') || 
      s.includes('broken') || s.includes('severe pain')) {
    return res.json({
      priority: 'MEDIUM',
      reason: 'URGENT: These symptoms require medical attention within 24 hours',
      recommendation: 'Visit Urgent Care or see a doctor today',
      possibleConditions: ['Requires Medical Evaluation']
    });
  }

  // Default non-urgent
  return res.json({
    priority: 'LOW',
    reason: 'Mild symptoms that can be managed at home',
    recommendation: 'Rest, over-the-counter medication, and monitor symptoms',
    possibleConditions: ['Common Cold', 'Minor Ailment']
  });
});

// Status check endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'AI symptom checker running',
    version: '3.0',
    mode: 'OpenAI GPT-3.5 Turbo',
    features: ['AI-powered analysis', 'Emergency keyword detection', 'Fallback mode'],
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify API key is working
router.get('/test-openai', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'OpenAI is working!' in one word." }
      ],
      max_tokens: 10
    });
    
    res.json({
      success: true,
      message: completion.choices[0].message.content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;