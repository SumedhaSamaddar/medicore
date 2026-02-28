import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const weekData = [
  { day: "Mon", v: 0 }, { day: "Tue", v: 0 }, { day: "Wed", v: 0 },
  { day: "Thu", v: 0 }, { day: "Fri", v: 0 }, { day: "Sat", v: 0 }, { day: "Sun", v: 0 },
];
const trendData = [
  { m: "Sep", v: 0 }, { m: "Oct", v: 0 }, { m: "Nov", v: 0 },
  { m: "Dec", v: 0 }, { m: "Jan", v: 0 }, { m: "Feb", v: 0 },
];

const CHIPS = ["Chest pain","Fever","Headache","Cough","Shortness of breath","Nausea","Fatigue","Dizziness"];

const PRIORITY = {
  HIGH:   { label: "EMERGENCY",  color: "#ef4444", bg: "#2a1215" },
  MEDIUM: { label: "URGENT",     color: "#f59e0b", bg: "#221a0d" },
  LOW:    { label: "NON-URGENT", color: "#10b981", bg: "#0d2018" },
};

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span style={{ fontSize: 22, fontWeight: 600, color: "#e2e8f0", letterSpacing: 1 }}>
      {t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

const Card = ({ children, style }) => (
  <div style={{ background: "#131929", border: "1px solid #1e2d40", borderRadius: 12, padding: "20px 22px", ...style }}>
    {children}
  </div>
);

export default function AICheckerDashboard() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [history, setHistory]   = useState([]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const analyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res  = await fetch("/api/analyze-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      setResult(data);
      setHistory(h =>
        [{ symptoms, ...data, time: new Date().toLocaleTimeString() }, ...h].slice(0, 10)
      );
    } catch {
      setResult({ priority: "LOW", reason: "Connection error", recommendation: "Please try again.", possibleConditions: [] });
    } finally {
      setLoading(false);
    }
  };

  const cfg    = result ? PRIORITY[result.priority] || PRIORITY.LOW : null;
  const counts = {
    HIGH:   history.filter(h => h.priority === "HIGH").length,
    MEDIUM: history.filter(h => h.priority === "MEDIUM").length,
    LOW:    history.filter(h => h.priority === "LOW").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0f1a", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", padding: "28px 32px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box}textarea{resize:vertical}`}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{today}</p>
        </div>
        <Clock />
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { icon: "🩺", label: "Total Checks", value: history.length, color: "#4f8ef7" },
          { icon: "🚨", label: "Emergency",    value: counts.HIGH,    color: "#ef4444" },
          { icon: "⚠️", label: "Urgent",       value: counts.MEDIUM,  color: "#f59e0b" },
          { icon: "✅", label: "Non-Urgent",   value: counts.LOW,     color: "#10b981" },
        ].map(s => (
          <Card key={s.label}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* ── Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <p style={{ fontWeight: 600, marginBottom: 16 }}>Checks This Week</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekData}>
              <CartesianGrid stroke="#1e2d40" strokeDasharray="4 4" />
              <XAxis dataKey="day" stroke="#4a5568" tick={{ fontSize: 12, fill: "#4a5568" }} />
              <YAxis stroke="#4a5568" tick={{ fontSize: 12, fill: "#4a5568" }} allowDecimals={false} />
              <Line type="monotone" dataKey="v" stroke="#4f8ef7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p style={{ fontWeight: 600, marginBottom: 16 }}>Severity Trend (₹)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid stroke="#1e2d40" strokeDasharray="4 4" />
              <XAxis dataKey="m" stroke="#4a5568" tick={{ fontSize: 12, fill: "#4a5568" }} />
              <YAxis stroke="#4a5568" tick={{ fontSize: 12, fill: "#4a5568" }} allowDecimals={false} />
              <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Symptom Input ── */}
      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontWeight: 600, marginBottom: 14 }}>Check Symptoms</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {CHIPS.map(c => (
            <button key={c} onClick={() => setSymptoms(p => p ? p + ", " + c : c)}
              style={{ padding: "5px 14px", borderRadius: 99, border: "1px solid #1e2d40", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
              {c}
            </button>
          ))}
        </div>

        <textarea
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms…"
          style={{ width: "100%", minHeight: 90, background: "#0b0f1a", border: "1px solid #1e2d40", borderRadius: 10, color: "#e2e8f0", fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "inherit" }}
        />

        <button
          onClick={analyze}
          disabled={loading || !symptoms.trim()}
          style={{ marginTop: 12, padding: "12px 28px", background: "#4f8ef7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: loading || !symptoms.trim() ? 0.5 : 1 }}>
          {loading ? "Analyzing…" : "Analyze →"}
        </button>

        {result && cfg && (
          <div style={{ marginTop: 16, background: cfg.bg, border: `1px solid ${cfg.color}40`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ background: cfg.color, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>{cfg.label}</span>
              <span style={{ fontSize: 14, color: "#e2e8f0" }}>{result.recommendation}</span>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{result.reason}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {result.possibleConditions?.map(c => (
                <span key={c} style={{ background: "#1e2d40", color: "#94a3b8", fontSize: 12, padding: "3px 10px", borderRadius: 6 }}>{c}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── Today's Queue ── */}
      <Card>
        <p style={{ fontWeight: 600, marginBottom: 14 }}>Today's Queue</p>
        {history.length === 0 ? (
          <p style={{ textAlign: "center", color: "#4a5568", padding: "24px 0", fontSize: 14 }}>
            No checks performed today
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ color: "#64748b", borderBottom: "1px solid #1e2d40" }}>
                {["Time", "Symptoms", "Priority", "Recommendation"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => {
                const c = PRIORITY[h.priority] || PRIORITY.LOW;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #1e2d4050" }}>
                    <td style={{ padding: "10px", color: "#64748b", whiteSpace: "nowrap" }}>{h.time}</td>
                    <td style={{ padding: "10px", color: "#94a3b8", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.symptoms}</td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ background: c.color + "20", color: c.color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6 }}>{c.label}</span>
                    </td>
                    <td style={{ padding: "10px", color: "#94a3b8", fontSize: 13 }}>{h.recommendation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}