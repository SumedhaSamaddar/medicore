// routes/ai.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const SYSTEM_PROMPT = `You are a medical triage AI assistant. Your role is to assess symptoms and provide clear, actionable guidance.

CRITICAL RULES:
1. Patient safety is the top priority
2. When in doubt, err on the side of caution
3. Be clear and concise in recommendations
4. Never diagnose specific conditions, only suggest possibilities
5. Always recommend seeking professional medical help for serious symptoms

PRIORITY LEVELS:
- HIGH (EMERGENCY): Life-threatening conditions requiring immediate 911/ER
- MEDIUM (URGENT): Serious conditions needing medical attention within 24 hours
- LOW (NON-URGENT): Minor issues that can be managed at home

Always provide responses in valid JSON format only.`;

// ─── Shared rule-based fallback ────────────────────────────────────────────
function getRuleBasedAnalysis(symptoms) {
  const s = symptoms.toLowerCase();

  if (
    s.includes('chest pain') || s.includes('chest pressure') ||
    s.includes('difficulty breathing') || s.includes('cannot breathe') ||
    s.includes('heart attack') || s.includes('stroke') ||
    s.includes('unconscious') || s.includes('severe bleeding') ||
    s.includes('seizure') || s.includes('overdose')
  ) {
    return {
      priority: 'HIGH',
      reason: 'EMERGENCY: Symptoms require immediate medical attention',
      recommendation: 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Medical Emergency', 'Requires Immediate Evaluation'],
    };
  }

  if (
    s.includes('high fever') || s.includes('vomiting') ||
    s.includes('severe pain') || s.includes('broken') ||
    s.includes('dehydrated') || s.includes('cannot keep food down')
  ) {
    return {
      priority: 'MEDIUM',
      reason: 'URGENT: These symptoms require medical attention within 24 hours',
      recommendation: 'Visit Urgent Care or see a doctor today',
      possibleConditions: ['Requires Medical Evaluation'],
    };
  }

  return {
    priority: 'LOW',
    reason: 'Mild symptoms that can likely be managed at home',
    recommendation: 'Rest, stay hydrated, and use over-the-counter medication if needed. See a doctor if symptoms worsen or persist beyond 3–5 days.',
    possibleConditions: ['Common Cold', 'Viral Infection', 'Minor Ailment'],
  };
}

// ─── POST /api/ai/analyze-symptoms ────────────────────────────────────────
router.post('/analyze-symptoms', async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
    return res.status(400).json({
      priority: 'LOW',
      reason: 'Invalid or missing symptoms',
      recommendation: 'Please describe your symptoms in detail',
      possibleConditions: ['Input required'],
    });
  }

  const trimmedSymptoms = symptoms.trim();
  console.log(`[${new Date().toISOString()}] 🔍 Analyzing symptoms:`, trimmedSymptoms);

  // Emergency keyword fast-path
  const symptomsLower = trimmedSymptoms.toLowerCase();
  const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(kw =>
    symptomsLower.includes(kw.toLowerCase())
  );

  if (hasEmergencyKeyword) {
    console.log('🚨 Emergency keyword detected');
    return res.json({
      priority: 'HIGH',
      reason: 'EMERGENCY: Your symptoms suggest a potentially life-threatening condition',
      recommendation: 'CALL 911 OR GO TO THE EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Medical Emergency', 'Requires Immediate Evaluation'],
    });
  }

  // No API key → fallback
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ No OpenAI API key, using rule-based fallback');
    return res.json(getRuleBasedAnalysis(trimmedSymptoms));
  }

  try {
    const userPrompt = `Analyze these symptoms and provide a triage assessment:

Symptoms: "${trimmedSymptoms}"

Return ONLY a JSON object with this exact structure:
{
  "priority": "HIGH" or "MEDIUM" or "LOW",
  "reason": "Brief explanation of the priority level (1 sentence)",
  "recommendation": "Clear next steps for the patient (1-2 sentences)",
  "possibleConditions": ["condition1", "condition2", "condition3"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 350,
    });

    const responseText = completion.choices[0].message.content;
    console.log('📝 OpenAI response:', responseText);

    let analysis;
    try {
      analysis = JSON.parse(responseText);
      analysis = {
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(analysis.priority) ? analysis.priority : 'LOW',
        reason: analysis.reason || 'Based on symptom analysis',
        recommendation: analysis.recommendation || 'Monitor symptoms and consult a doctor if they persist',
        possibleConditions: Array.isArray(analysis.possibleConditions)
          ? analysis.possibleConditions.slice(0, 4)
          : ['General symptoms'],
      };
    } catch {
      analysis = getRuleBasedAnalysis(trimmedSymptoms);
    }

    // Safety override
    if (
      (symptomsLower.includes('chest') && symptomsLower.includes('pain')) ||
      symptomsLower.includes('heart attack') ||
      (symptomsLower.includes('breath') && (symptomsLower.includes('short') || symptomsLower.includes('difficult'))) ||
      symptomsLower.includes('unconscious') ||
      symptomsLower.includes('cannot breathe')
    ) {
      if (analysis.priority !== 'HIGH') {
        analysis.priority = 'HIGH';
        analysis.reason = 'EMERGENCY: Symptoms require immediate medical attention';
        analysis.recommendation = 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY';
        analysis.possibleConditions = ['Medical Emergency', 'Requires Immediate Evaluation'];
      }
    }

    console.log('✅ Final analysis:', analysis);
    res.json(analysis);

  } catch (error) {
    console.error('❌ OpenAI API error:', error);

    // ── Graceful fallbacks for all error types ──
    if (error.status === 429 || error.status === 503 || error.code === 'ECONNREFUSED' || error.message?.includes('timeout')) {
      console.log('⚠️ OpenAI unavailable, falling back to rule-based analysis');
      return res.json(getRuleBasedAnalysis(trimmedSymptoms));
    }

    if (error.status === 401) {
      return res.status(500).json({
        priority: 'LOW',
        reason: 'AI service configuration error',
        recommendation: 'Please consult a healthcare provider for proper evaluation',
        possibleConditions: ['Service configuration issue'],
      });
    }

    // Generic fallback
    return res.json(getRuleBasedAnalysis(trimmedSymptoms));
  }
});

// ─── POST /api/ai/analyze-symptoms-fallback ───────────────────────────────
router.post('/analyze-symptoms-fallback', (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || !symptoms.trim()) {
    return res.json({
      priority: 'LOW',
      reason: 'No symptoms provided',
      recommendation: 'Please describe your symptoms',
      possibleConditions: ['Please enter symptoms'],
    });
  }
  res.json(getRuleBasedAnalysis(symptoms.trim()));
});

// ─── GET /api/ai/status ───────────────────────────────────────────────────
router.get('/status', (req, res) => {
  res.json({
    status: 'AI symptom checker running',
    version: '3.1',
    mode: process.env.OPENAI_API_KEY ? 'OpenAI GPT-3.5 Turbo (with fallback)' : 'Rule-based Fallback',
    configuration: {
      openai_configured: !!process.env.OPENAI_API_KEY,
      emergency_keywords_count: EMERGENCY_KEYWORDS.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── GET /api/ai/test-openai ──────────────────────────────────────────────
router.get('/test-openai', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ success: false, error: 'OpenAI API key not configured' });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: "Say 'OpenAI is working!' in one word." },
      ],
      max_tokens: 10,
      temperature: 0,
    });
    res.json({ success: true, message: completion.choices[0].message.content, model: completion.model });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, status: error.status });
  }
});

// ─── GET /api/ai/emergency-keywords ──────────────────────────────────────
router.get('/emergency-keywords', (req, res) => {
  res.json({ count: EMERGENCY_KEYWORDS.length, keywords: EMERGENCY_KEYWORDS });
});

module.exports = router;