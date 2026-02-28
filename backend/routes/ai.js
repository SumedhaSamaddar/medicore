const express = require('express')
const router = express.Router()

// COMPREHENSIVE HARDCODED SYMPTOM CHECKER
router.post('/analyze-symptoms', (req, res) => {
  const { symptoms } = req.body

  if (!symptoms) {
    return res.status(400).json({ 
      priority: 'LOW',
      reason: 'No symptoms provided',
      recommendation: 'Please describe your symptoms',
      possibleConditions: ['Please enter symptoms']
    })
  }

  const s = symptoms.toLowerCase()
  
  // ========== HIGH PRIORITY (EMERGENCY) ==========
  // Heart & Chest
  if (s.includes('chest pain') || 
      s.includes('chest tightness') ||
      s.includes('chest pressure') ||
      s.includes('heart attack') ||
      s.includes('heart pain') ||
      s.includes('cardiac') ||
      s.includes('palpitations') ||
      s.includes('racing heart') ||
      s.includes('irregular heartbeat')) {
    
    return res.json({
      priority: 'HIGH',
      reason: 'EMERGENCY: Chest/heart symptoms require immediate evaluation',
      recommendation: 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Heart Attack', 'Angina', 'Cardiac Arrhythmia', 'Medical Emergency']
    })
  }
  
  // Breathing
  if (s.includes('difficulty breathing') || 
      s.includes('shortness of breath') ||
      s.includes('cannot breathe') ||
      s.includes('can\'t breathe') ||
      s.includes('struggling to breathe') ||
      s.includes('gasping') ||
      s.includes('choking') ||
      s.includes('wheezing') ||
      s.includes('asthma attack') ||
      s.includes('breathless')) {
    
    return res.json({
      priority: 'HIGH',
      reason: 'EMERGENCY: Breathing difficulties require immediate attention',
      recommendation: 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Asthma Attack', 'Pulmonary Embolism', 'Respiratory Failure', 'Anaphylaxis']
    })
  }
  
  // Neurological
  if (s.includes('stroke') ||
      s.includes('facial droop') ||
      s.includes('face drooping') ||
      s.includes('slurred speech') ||
      s.includes('cant speak') ||
      s.includes('cannot speak') ||
      s.includes('weakness on one side') ||
      s.includes('numbness on one side') ||
      s.includes('sudden confusion') ||
      s.includes('sudden severe headache') ||
      s.includes('worst headache of my life') ||
      s.includes('seizure') ||
      s.includes('convulsion') ||
      s.includes('fitting') ||
      s.includes('unconscious') ||
      s.includes('passed out') ||
      s.includes('fainted') ||
      s.includes('loss of consciousness') ||
      s.includes('blacked out')) {
    
    return res.json({
      priority: 'HIGH',
      reason: 'EMERGENCY: Neurological symptoms indicate possible stroke or seizure',
      recommendation: 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Stroke', 'Seizure Disorder', 'Brain Injury', 'Neurological Emergency']
    })
  }
  
  // Bleeding & Trauma
  if (s.includes('severe bleeding') ||
      s.includes('heavy bleeding') ||
      s.includes('gushing blood') ||
      s.includes('uncontrollable bleeding') ||
      s.includes('hemorrhage') ||
      s.includes('bleeding profusely') ||
      s.includes('head injury') ||
      s.includes('hit head') ||
      s.includes('concussion') ||
      s.includes('traumatic injury') ||
      s.includes('car accident') ||
      s.includes('fall from height') ||
      s.includes('multiple injuries')) {
    
    return res.json({
      priority: 'HIGH',
      reason: 'EMERGENCY: Severe bleeding or head trauma requires immediate care',
      recommendation: 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Internal Bleeding', 'Traumatic Brain Injury', 'Hemorrhagic Shock', 'Major Trauma']
    })
  }
  
  // Allergic & Mental Health
  if (s.includes('severe allergic') ||
      s.includes('anaphylaxis') ||
      s.includes('swelling of tongue') ||
      s.includes('swelling of throat') ||
      s.includes('difficulty swallowing') ||
      s.includes('suicidal') ||
      s.includes('want to die') ||
      s.includes('kill myself') ||
      s.includes('overdose') ||
      s.includes('poisoning') ||
      s.includes('poison')) {
    
    return res.json({
      priority: 'HIGH',
      reason: 'EMERGENCY: Life-threatening allergic reaction or mental health crisis',
      recommendation: 'CALL 911 OR GO TO EMERGENCY ROOM IMMEDIATELY',
      possibleConditions: ['Anaphylaxis', 'Suicidal Ideation', 'Overdose', 'Psychiatric Emergency']
    })
  }
  
  // ========== MEDIUM PRIORITY (URGENT) ==========
  if (s.includes('high fever') ||
      s.includes('fever 103') ||
      s.includes('temperature 103') ||
      s.includes('fever over 102') ||
      s.includes('persistent fever') ||
      s.includes('vomiting') ||
      s.includes('throwing up') ||
      s.includes('cannot keep food down') ||
      s.includes('vomiting blood') ||
      s.includes('severe nausea') ||
      s.includes('diarrhea') ||
      s.includes('watery stool') ||
      s.includes('bloody stool') ||
      s.includes('blood in stool') ||
      s.includes('dehydrated') ||
      s.includes('dehydration') ||
      s.includes('not urinating') ||
      s.includes('dark urine') ||
      s.includes('broken bone') ||
      s.includes('fracture') ||
      s.includes('dislocated') ||
      s.includes('sprained badly') ||
      s.includes('deep cut') ||
      s.includes('large wound') ||
      s.includes('deep laceration') ||
      s.includes('stitches needed') ||
      s.includes('burn') ||
      s.includes('blistering') ||
      s.includes('second degree burn') ||
      s.includes('third degree burn') ||
      s.includes('severe pain') ||
      s.includes('excruciating pain') ||
      s.includes('worst pain') ||
      s.includes('unbearable pain') ||
      s.includes('head injury') ||
      s.includes('hit head') ||
      s.includes('mild concussion') ||
      s.includes('confusion') ||
      s.includes('disoriented') ||
      s.includes('vision changes') ||
      s.includes('blurry vision') ||
      s.includes('double vision') ||
      s.includes('vision loss') ||
      s.includes('eye pain') ||
      s.includes('eye injury') ||
      s.includes('abdominal pain') ||
      s.includes('stomach pain') ||
      s.includes('belly pain') ||
      s.includes('appendicitis') ||
      s.includes('severe abdominal') ||
      s.includes('pregnancy') ||
      s.includes('pregnant') ||
      s.includes('contractions') ||
      s.includes('labor') ||
      s.includes('vaginal bleeding') ||
      s.includes('pregnancy bleeding') ||
      s.includes('urinary infection') ||
      s.includes('uti') ||
      s.includes('burning urination') ||
      s.includes('kidney stone') ||
      s.includes('back pain severe') ||
      s.includes('infection') ||
      s.includes('cellulitis') ||
      s.includes('abscess') ||
      s.includes('pus') ||
      s.includes('red streaks') ||
      s.includes('animal bite') ||
      s.includes('dog bite') ||
      s.includes('snake bite') ||
      s.includes('tick bite') ||
      s.includes('chemical exposure') ||
      s.includes('foreign object') ||
      s.includes('something stuck')) {
    
    return res.json({
      priority: 'MEDIUM',
      reason: 'URGENT: These symptoms require medical attention within 24 hours',
      recommendation: 'Visit Urgent Care, see doctor today, or go to ER if severe',
      possibleConditions: ['Severe Infection', 'Dehydration', 'Acute Injury', 'Appendicitis', 'Kidney Stones', 'Complicated Condition']
    })
  }
  
  // ========== LOW PRIORITY (NON-URGENT) ==========
  else {
    // Cold & Flu
    if (s.includes('cough') ||
        s.includes('runny nose') ||
        s.includes('stuffy nose') ||
        s.includes('congestion') ||
        s.includes('sneezing') ||
        s.includes('sore throat') ||
        s.includes('scratchy throat') ||
        s.includes('mild fever') ||
        s.includes('low grade fever') ||
        s.includes('temperature 99') ||
        s.includes('temperature 100') ||
        s.includes('headache') ||
        s.includes('mild headache') ||
        s.includes('tension headache') ||
        s.includes('fatigue') ||
        s.includes('tired') ||
        s.includes('exhausted') ||
        s.includes('body aches') ||
        s.includes('muscle aches') ||
        s.includes('chills') ||
        s.includes('mild nausea') ||
        s.includes('indigestion') ||
        s.includes('heartburn') ||
        s.includes('acid reflux') ||
        s.includes('bloating') ||
        s.includes('gas') ||
        s.includes('constipation') ||
        s.includes('hard stool') ||
        s.includes('hemorrhoids') ||
        s.includes('rash') ||
        s.includes('hives') ||
        s.includes('itchy skin') ||
        s.includes('dry skin') ||
        s.includes('eczema') ||
        s.includes('acne') ||
        s.includes('pimple') ||
        s.includes('allergies') ||
        s.includes('hay fever') ||
        s.includes('seasonal') ||
        s.includes('pollen') ||
        s.includes('mild pain') ||
        s.includes('minor pain') ||
        s.includes('ache') ||
        s.includes('stiff neck') ||
        s.includes('minor cut') ||
        s.includes('small cut') ||
        s.includes('scrape') ||
        s.includes('bruise') ||
        s.includes('insect bite') ||
        s.includes('mosquito bite') ||
        s.includes('stress') ||
        s.includes('anxiety') ||
        s.includes('nervous') ||
        s.includes('insomnia') ||
        s.includes('cant sleep') ||
        s.includes('dizziness mild') ||
        s.includes('lightheaded') ||
        s.includes('earache') ||
        s.includes('ear pain') ||
        s.includes('ringing ears') ||
        s.includes('sinus') ||
        s.includes('sinus pressure') ||
        s.includes('post nasal drip') ||
        s.includes('mouth sore') ||
        s.includes('canker sore') ||
        s.includes('cold sore') ||
        s.includes('toothache') ||
        s.includes('tooth pain')) {
      
      return res.json({
        priority: 'LOW',
        reason: 'Mild symptoms that can be managed at home',
        recommendation: 'Rest, over-the-counter medication, and monitor symptoms. See doctor if not improving in 3-5 days.',
        possibleConditions: ['Common Cold', 'Seasonal Allergies', 'Mild Infection', 'Stress', 'Minor Ailment']
      })
    }
    
    // Default fallback
    return res.json({
      priority: 'LOW',
      reason: 'Symptoms appear mild based on description',
      recommendation: 'Monitor at home, rest, and consult doctor if symptoms persist or worsen',
      possibleConditions: ['Mild Viral Illness', 'General Malaise', 'Non-urgent Condition']
    })
  }
})

// Status check
router.get('/status', (req, res) => {
  res.json({ 
    status: 'AI symptom checker running',
    version: '2.0 - Expanded conditions',
    mode: 'Hardcoded responses',
    timestamp: new Date().toISOString()
  })
})

module.exports = router