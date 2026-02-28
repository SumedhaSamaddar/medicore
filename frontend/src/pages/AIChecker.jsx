import React, { useState } from 'react';
import axios from 'axios';
import './AIChecker.css'; // Make sure this import exists

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
          className: 'severity-critical',
          icon: '🔴',
          message: 'Emergency care needed immediately!'
        };
      case 'MEDIUM':
        return {
          label: 'HIGH',
          className: 'severity-high',
          icon: '🟠',
          message: 'Visit doctor today'
        };
      case 'LOW':
        return {
          label: 'LOW',
          className: 'severity-low',
          icon: '🟢',
          message: 'Monitor at home'
        };
      default:
        return {
          label: 'LOW',
          className: 'severity-low',
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
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    <div className="ai-checker-container">
      <div className="ai-checker-header">
        <h1>AI Symptom Checker</h1>
        <p className="subtitle">AI-powered preliminary diagnosis assistant</p>
      </div>

      <div className="ai-checker-content">
        {/* Left Column */}
        <div className="left-panel">
          <div className="patient-info-card">
            <h3>Patient Information</h3>
            
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Symptoms*</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms (e.g., chest pain, fever, headache)"
                rows="4"
                className="form-textarea"
              />
            </div>

            <div className="quick-add-section">
              <p className="quick-add-label">Quick add:</p>
              <div className="symptom-buttons">
                {quickSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => addQuickSymptom(symptom)}
                    className="symptom-btn"
                  >
                    +{symptom}
                  </button>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="analyze-btn"
              >
                {loading ? 'Analyzing...' : 'Analyze Symptoms'}
              </button>
              <button onClick={clearAll} className="clear-btn">
                Clear
              </button>
            </div>
          </div>

          {/* Recent Checks */}
          {recentChecks.length > 0 && (
            <div className="recent-checks-card">
              <h3>Recent Checks</h3>
              {recentChecks.map((check, index) => (
                <div key={index} className="recent-check-item">
                  <span className={`priority-badge priority-${check.priority.toLowerCase()}`}>
                    {check.priority}
                  </span>
                  <span className="recent-symptom">{check.symptoms}</span>
                  <span className="recent-time">{check.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="right-panel">
          {/* Severity Guide */}
          <div className="severity-guide-card">
            <h3>Severity Guide</h3>
            <div className="guide-item">
              <span className="dot dot-low"></span>
              <span>Low: Monitor at home</span>
            </div>
            <div className="guide-item">
              <span className="dot dot-medium"></span>
              <span>Medium: Schedule appointment</span>
            </div>
            <div className="guide-item">
              <span className="dot dot-high"></span>
              <span>High: Visit doctor today</span>
            </div>
            <div className="guide-item">
              <span className="dot dot-critical"></span>
              <span>Critical: Emergency care needed</span>
            </div>
          </div>

          {/* Analysis Result */}
          {result && (
            <div className="result-card">
              {/* Severity Banner */}
              <div className={`severity-banner ${getSeverityInfo(result.priority).className}`}>
                <h2>
                  {getSeverityInfo(result.priority).icon} 
                  {getSeverityInfo(result.priority).label} SEVERITY
                </h2>
                <p>{getSeverityInfo(result.priority).message}</p>
              </div>

              <h3 className="analysis-title">Analysis Complete</h3>
              
              {/* Assessment */}
              <div className="result-section">
                <strong>Assessment:</strong>
                <p>{result.reason}</p>
              </div>

              {/* Possible Conditions */}
              <div className="result-section">
                <strong>Possible Conditions:</strong>
                <ul className="conditions-list">
                  {result.possibleConditions?.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendation */}
              <div className="result-section">
                <strong>Recommendation:</strong>
                <p>{result.recommendation}</p>
              </div>

              {/* Disclaimer */}
              <small className="disclaimer">
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

export default AIChecker;