import React, { useState } from 'react';
import axios from 'axios';

const AIChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentChecks, setRecentChecks] = useState([]);

  // Severity mapping function
  const getSeverityInfo = (priority) => {
    switch(priority) {
      case 'HIGH':
        return {
          label: 'CRITICAL',
          color: '#ff4444',
          bgColor: '#ffebee',
          icon: '🔴',
          message: 'Emergency care needed immediately!'
        };
      case 'MEDIUM':
        return {
          label: 'HIGH',
          color: '#ff8800',
          bgColor: '#fff3e0',
          icon: '🟠',
          message: 'Visit doctor today'
        };
      case 'LOW':
        return {
          label: 'LOW',
          color: '#00C851',
          bgColor: '#e8f5e9',
          icon: '🟢',
          message: 'Monitor at home'
        };
      default:
        return {
          label: 'LOW',
          color: '#00C851',
          bgColor: '#e8f5e9',
          icon: '🟢',
          message: 'Monitor at home'
        };
    }
  };

  const quickSymptoms = [
    'Fever', 'Headache', 'Cough', 'Chest Pain', 
    'Nausea', 'Fatigue', 'Shortness of breath'
  ];

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      alert('Please enter symptoms');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://medicore-lbqj.onrender.com/api/ai/analyze-symptoms', {
        symptoms: symptoms,
        age: age,
        gender: gender
      });

      const data = response.data;
      setResult(data);

      // Add to recent checks
      setRecentChecks(prev => [
        {
          symptoms: symptoms,
          priority: data.priority,
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 4)
      ]);

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addQuickSymptom = (symptom) => {
    setSymptoms(prev => prev ? `${prev}, ${symptom.toLowerCase()}` : symptom.toLowerCase());
  };

  const clearAll = () => {
    setSymptoms('');
    setAge('');
    setGender('male');
    setResult(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI Symptom Checker</h1>
      <p style={styles.subtitle}>AI-powered preliminary diagnosis assistant</p>

      <div style={styles.mainContent}>
        {/* Left Column - Input Form */}
        <div style={styles.leftColumn}>
          <div style={styles.patientInfo}>
            <h3>Patient Information</h3>
            
            <div style={styles.inputGroup}>
              <label>Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={styles.select}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label>Symptoms*</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms (e.g., chest pain, fever, headache)"
                rows="4"
                style={styles.textarea}
              />
            </div>

            <div style={styles.quickAdd}>
              <p style={styles.quickAddLabel}>Quick add:</p>
              <div style={styles.symptomButtons}>
                {quickSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => addQuickSymptom(symptom)}
                    style={styles.symptomButton}
                  >
                    +{symptom}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.actionButtons}>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                style={{
                  ...styles.analyzeButton,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze Symptoms'}
              </button>
              <button onClick={clearAll} style={styles.clearButton}>
                Clear
              </button>
            </div>
          </div>

          {/* Recent Checks */}
          {recentChecks.length > 0 && (
            <div style={styles.recentChecks}>
              <h3>Recent Checks</h3>
              {recentChecks.map((check, index) => (
                <div key={index} style={styles.recentCheckItem}>
                  <span style={{
                    ...styles.priorityBadge,
                    backgroundColor: getSeverityInfo(check.priority).color,
                    color: 'white'
                  }}>
                    {check.priority}
                  </span>
                  <span style={styles.recentSymptom}>{check.symptoms}</span>
                  <span style={styles.recentTime}>{check.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Results & Guide */}
        <div style={styles.rightColumn}>
          {/* Severity Guide */}
          <div style={styles.severityGuide}>
            <h3>Severity Guide</h3>
            <div style={styles.guideItem}>
              <span style={{...styles.guideDot, backgroundColor: '#00C851'}}></span>
              <span>Low: Monitor at home</span>
            </div>
            <div style={styles.guideItem}>
              <span style={{...styles.guideDot, backgroundColor: '#ffbb33'}}></span>
              <span>Medium: Schedule appointment</span>
            </div>
            <div style={styles.guideItem}>
              <span style={{...styles.guideDot, backgroundColor: '#ff8800'}}></span>
              <span>High: Visit doctor today</span>
            </div>
            <div style={styles.guideItem}>
              <span style={{...styles.guideDot, backgroundColor: '#ff4444'}}></span>
              <span>Critical: Emergency care needed</span>
            </div>
          </div>

          {/* Analysis Result */}
          {result && (
            <div style={styles.resultContainer}>
              {/* Severity Banner - FIXED DISPLAY */}
              <div style={{
                backgroundColor: getSeverityInfo(result.priority).color,
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                  {getSeverityInfo(result.priority).icon} 
                  {getSeverityInfo(result.priority).label} SEVERITY
                </h2>
                <p style={{ color: 'white', margin: '10px 0 0 0', fontSize: '16px' }}>
                  {getSeverityInfo(result.priority).message}
                </p>
              </div>

              <h3 style={styles.analysisTitle}>Analysis Complete</h3>
              
              {/* Reason */}
              <div style={styles.resultSection}>
                <strong>Assessment:</strong>
                <p style={styles.resultText}>{result.reason}</p>
              </div>

              {/* Possible Conditions */}
              <div style={styles.resultSection}>
                <strong>Possible Conditions:</strong>
                <ul style={styles.conditionList}>
                  {result.possibleConditions?.map((condition, index) => (
                    <li key={index} style={styles.conditionItem}>
                      • {condition}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendation */}
              <div style={styles.resultSection}>
                <strong>Recommendation:</strong>
                <p style={styles.resultText}>{result.recommendation}</p>
              </div>

              {/* Disclaimer */}
              <small style={styles.disclaimer}>
                This AI-based tool is not a substitute for professional medical advice. 
                Always consult a healthcare provider for personalized guidance and treatment.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px'
  },
  leftColumn: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px'
  },
  rightColumn: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px'
  },
  patientInfo: {
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical'
  },
  quickAdd: {
    marginBottom: '20px'
  },
  quickAddLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  symptomButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  symptomButton: {
    padding: '8px 15px',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    ':hover': {
      backgroundColor: '#d0d0d0'
    }
  },
  actionButtons: {
    display: 'flex',
    gap: '10px'
  },
  analyzeButton: {
    flex: 2,
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  clearButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  recentChecks: {
    marginTop: '30px'
  },
  recentCheckItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '5px',
    marginBottom: '5px'
  },
  priorityBadge: {
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  recentSymptom: {
    flex: 1,
    fontSize: '14px'
  },
  recentTime: {
    fontSize: '12px',
    color: '#666'
  },
  severityGuide: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  guideItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  guideDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px'
  },
  analysisTitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#333'
  },
  resultSection: {
    marginBottom: '15px'
  },
  resultText: {
    margin: '5px 0 0 0',
    color: '#555',
    lineHeight: '1.5'
  },
  conditionList: {
    margin: '5px 0 0 0',
    paddingLeft: '20px'
  },
  conditionItem: {
    marginBottom: '3px',
    color: '#555'
  },
  disclaimer: {
    display: 'block',
    marginTop: '20px',
    color: '#999',
    fontSize: '11px',
    textAlign: 'center'
  }
};

export default AIChecker;