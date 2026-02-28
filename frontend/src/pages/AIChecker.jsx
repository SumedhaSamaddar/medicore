import { useState } from "react";

const PRIORITY = {
  HIGH:   { label: "EMERGENCY",  color: "#ef4444", bg: "#2a1215" },
  MEDIUM: { label: "URGENT",     color: "#f59e0b", bg: "#221a0d" },
  LOW:    { label: "NON-URGENT", color: "#10b981", bg: "#0d2018" },
};

const CHIPS = [
  "Chest pain", "Fever", "Headache", "Cough", 
  "Shortness of breath", "Nausea", "Fatigue", "Dizziness"
];

export default function AICheckerDashboard() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!symptoms.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      console.log("Sending symptoms:", symptoms); // Debug log
      
      const response = await fetch("/api/analyze-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log("Response status:", response.status); // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Response data:", data); // Debug log
      
      setResult(data);
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        setError("Request timed out. Please check if the backend server is running.");
      } else {
        setError(err.message || "Failed to analyze symptoms. Please try again.");
      }
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyze();
    }
  };

  const priorityConfig = result ? PRIORITY[result.priority] || PRIORITY.LOW : null;

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0b0f1a", 
      color: "#e2e8f0", 
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        textarea { resize: vertical; }
      `}</style>

      {/* Main Checker Card */}
      <div style={{
        background: "#131929",
        border: "1px solid #1e2d40",
        borderRadius: 16,
        padding: "32px",
        width: "100%",
        maxWidth: "700px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 700, 
          margin: "0 0 8px 0",
          background: "linear-gradient(135deg, #4f8ef7, #9f7aea)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          AI Symptom Checker
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
          Describe your symptoms for an instant triage assessment
        </p>

        {/* Quick Symptom Chips */}
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "8px", 
          marginBottom: 20 
        }}>
          {CHIPS.map(c => (
            <button
              key={c}
              onClick={() => setSymptoms(p => p ? p + ", " + c.toLowerCase() : c.toLowerCase())}
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid #1e2d40",
                background: "#0b0f1a",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#1e2d40";
                e.target.style.color = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#0b0f1a";
                e.target.style.color = "#94a3b8";
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Symptom Input */}
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Describe your symptoms in detail... (e.g., 'severe chest pain with shortness of breath')"
          style={{
            width: "100%",
            minHeight: 120,
            background: "#0b0f1a",
            border: `1px solid ${error ? "#ef4444" : "#1e2d40"}`,
            borderRadius: 12,
            color: "#e2e8f0",
            fontSize: 15,
            padding: "16px",
            outline: "none",
            fontFamily: "inherit",
            marginBottom: 16
          }}
        />

        {/* Analyze Button */}
        <button
          onClick={analyze}
          disabled={loading || !symptoms.trim()}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? "#64748b" : "#4f8ef7",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            cursor: loading || !symptoms.trim() ? "not-allowed" : "pointer",
            opacity: loading || !symptoms.trim() ? 0.6 : 1,
            transition: "background 0.2s",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {loading ? (
            <>
              <span style={{ 
                display: "inline-block", 
                width: 20, 
                height: 20, 
                border: "3px solid rgba(255,255,255,0.3)", 
                borderTopColor: "#fff", 
                borderRadius: "50%", 
                animation: "spin 1s linear infinite" 
              }} />
              Analyzing... (this may take a few seconds)
            </>
          ) : "Analyze Symptoms →"}
        </button>

        {/* Debug Info - Remove in production */}
        {loading && (
          <div style={{
            background: "#1e2d40",
            borderRadius: 8,
            padding: "12px",
            marginBottom: 16,
            fontSize: 13,
            color: "#94a3b8",
            textAlign: "center"
          }}>
            ⚡ Connecting to backend at /api/analyze-symptoms...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#2a1215",
            border: "1px solid #ef4444",
            borderRadius: 10,
            padding: "16px",
            marginBottom: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ color: "#ef4444", fontSize: 18 }}>⚠️</span>
              <span style={{ color: "#ef4444", fontWeight: 600 }}>Connection Error</span>
            </div>
            <p style={{ color: "#e2e8f0", fontSize: 14, margin: "0 0 8px 0" }}>{error}</p>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
              Make sure your backend server is running at the correct port.
            </p>
          </div>
        )}

        {/* Result Display */}
        {result && priorityConfig && (
          <div style={{
            background: priorityConfig.bg,
            border: `1px solid ${priorityConfig.color}`,
            borderRadius: 12,
            padding: "20px",
            animation: "fadeIn 0.3s ease-out"
          }}>
            {/* Priority Badge */}
            <div style={{
              display: "inline-block",
              background: priorityConfig.color,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: 20,
              marginBottom: 16,
              letterSpacing: "0.5px"
            }}>
              {priorityConfig.label}
            </div>

            {/* Recommendation */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                margin: "0 0 8px 0",
                color: "#fff"
              }}>
                Recommendation
              </h3>
              <p style={{ 
                fontSize: 15, 
                color: "#e2e8f0", 
                margin: 0,
                lineHeight: 1.5
              }}>
                {result.recommendation}
              </p>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                margin: "0 0 6px 0",
                color: "#94a3b8"
              }}>
                Why
              </h3>
              <p style={{ 
                fontSize: 14, 
                color: "#94a3b8", 
                margin: 0,
                lineHeight: 1.5
              }}>
                {result.reason}
              </p>
            </div>

            {/* Possible Conditions */}
            {result.possibleConditions && result.possibleConditions.length > 0 && (
              <div>
                <h3 style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  margin: "0 0 10px 0",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Possible Conditions
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.possibleConditions.map((condition, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#1e2d40",
                        color: "#94a3b8",
                        fontSize: 13,
                        padding: "4px 12px",
                        borderRadius: 20,
                        border: "1px solid #2d3a4f"
                      }}
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #1e2d40",
              fontSize: 12,
              color: "#4a5568",
              textAlign: "center"
            }}>
              This is an AI-powered triage tool. Not a substitute for professional medical advice.
              {result.priority === "HIGH" && " ⚠️ SEEK EMERGENCY CARE IMMEDIATELY"}
            </div>
          </div>
        )}

        {/* Keyboard Shortcut Hint */}
        <div style={{
          marginTop: 16,
          fontSize: 12,
          color: "#4a5568",
          textAlign: "center"
        }}>
          Press Ctrl + Enter to analyze
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}