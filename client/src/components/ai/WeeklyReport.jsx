import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function WeeklyReport() {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ai/weekly-report');
      setReport(data.report);
      toast.success('Weekly report ready!');
    } catch {
      // Fallback demo report
      setReport({
        performanceSummary: "Strong week overall! You maintained consistency in morning habits and showed improvement in your focus sessions.",
        bestHabit: "Morning Run — completed every day this week with a growing streak.",
        missedHabits: ["Evening Meditation", "Weekly Review"],
        suggestions: [
          "Set a 9 pm phone alarm to trigger your evening meditation.",
          "Block 30 min on Sunday afternoons for your weekly review.",
          "You're 3 days from your next streak milestone — push through!",
        ],
        motivation: "You're in the top 15% of HabitFlow users this week. Keep that momentum going into next week! 🚀",
        score: 82,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="section-title">✦ AI Weekly Report</div>
        <button className="btn btn-primary btn-sm" onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : '↻ Generate'}
        </button>
      </div>

      {!report ? (
        <div className="text-center py-8 text-white/30 text-sm">
          Click Generate to get your personalized weekly report
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Score */}
          <div className="flex items-center gap-3 p-3 bg-bg-3 rounded-lg border border-white/[0.07]">
            <div className="text-3xl font-bold font-heading gradient-text">{report.score}%</div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wide font-semibold">Weekly Score</div>
              <div className="w-32 progress-bar mt-1">
                <div className="progress-fill bg-gradient-to-r from-accent to-cyan-400" style={{ width: `${report.score}%` }} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="insight">{report.performanceSummary}</div>

          {/* Best habit */}
          {report.bestHabit && (
            <div>
              <div className="text-xs font-semibold text-white/30 uppercase tracking-wide mb-1">⭐ Best Habit</div>
              <div className="text-sm text-[#3dd68c]">{report.bestHabit}</div>
            </div>
          )}

          {/* Missed */}
          {report.missedHabits?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-white/30 uppercase tracking-wide mb-1">⚠️ Needs Attention</div>
              <div className="flex flex-wrap gap-2">
                {report.missedHabits.map((h, i) => (
                  <span key={i} className="badge badge-amber">{h}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {report.suggestions?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-white/30 uppercase tracking-wide mb-2">💡 Action Items</div>
              {report.suggestions.map((s, i) => (
                <div key={i} className="insight py-2">{s}</div>
              ))}
            </div>
          )}

          {/* Motivation */}
          {report.motivation && (
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent-2 italic">
              "{report.motivation}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
