import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GOALS = ['Improve fitness & health','Boost productivity & focus','Mental wellness & mindfulness','Learning & skill development','Better sleep & recovery'];

const QUICK_PROMPTS = [
  { icon:'📊', text:'Analyze my habit performance and suggest improvements' },
  { icon:'💡', text:'What new habits should I add based on my current goals?' },
  { icon:'🔥', text:'Give me a motivational message to keep my streak going' },
  { icon:'📋', text:'Generate my weekly productivity report' },
  { icon:'🌅', text:'Design a morning routine for better focus and energy' },
  { icon:'😴', text:'Help me build a better sleep habit routine' },
];

export default function AICoach() {
  const [messages, setMessages]  = useState([
    { role: 'assistant', content: "👋 Hi! I'm your AI Productivity Coach. I can analyze your habits, suggest improvements, create custom plans, and keep you motivated. What would you like to work on today?" }
  ]);
  const [input, setInput]        = useState('');
  const [loading, setLoading]    = useState(false);
  const [goal, setGoal]          = useState(GOALS[0]);
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan]          = useState(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', { messages: history });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const fallback = "I'm having trouble connecting right now. Make sure your AI API key is configured in the backend .env file.";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    setPlan(null);
    try {
      const { data } = await api.post('/ai/habit-plan', { goal });
      setPlan(data.plan);
      toast.success('Habit plan generated!');
    } catch {
      toast.error('Failed to generate plan. Check your API key.');
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">✦ AI Productivity Coach</h1>
        <p className="text-white/40 text-sm mt-0.5">Powered by AI · Personalized coaching based on your habit data</p>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5">
        {/* Chat */}
        <div className="flex flex-col h-[560px]">
          <div ref={messagesRef} className="flex-1 overflow-y-auto pr-1 mb-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                <div className="ai-msg-header">{m.role === 'user' ? 'You' : '✦ AI Coach'}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg assistant">
                <div className="ai-msg-header">✦ AI Coach</div>
                <span className="typing-dot" style={{animationDelay:'0s'}}></span>
                <span className="typing-dot" style={{animationDelay:'0.2s'}}></span>
                <span className="typing-dot" style={{animationDelay:'0.4s'}}></span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask your AI coach anything…"
              className="flex-1"
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              ↗
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div>
            <div className="section-title mb-3">Quick Prompts</div>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  className="btn btn-ghost w-full justify-start text-left text-xs py-2.5 gap-2"
                  onClick={() => sendMessage(p.text)}
                  disabled={loading}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="flex-1 whitespace-normal leading-snug">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Habit Plan Generator */}
      <div className="mt-6 grid grid-cols-2 gap-5">
        <div className="card">
          <div className="section-title mb-4">✦ AI Habit Plan Generator</div>
          <div className="form-group">
            <label className="form-label">My Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)}>
              {GOALS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <button
            className="btn btn-primary w-full justify-center"
            onClick={generatePlan}
            disabled={planLoading}
          >
            {planLoading ? '✦ Generating…' : '✦ Generate Personalized Plan'}
          </button>
        </div>

        {plan && (
          <div className="card">
            <div className="section-title mb-1">Your Plan</div>
            <p className="text-white/50 text-xs mb-3">{plan.summary}</p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(plan.habits || []).map((h, i) => (
                <div key={i} className="flex gap-2.5 p-2.5 bg-bg-3 rounded-lg border border-white/[0.07]">
                  <span className="text-xl flex-shrink-0">{h.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{h.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{h.frequency} · {h.bestTime} · {h.duration}</div>
                    <div className="text-xs text-white/30 mt-0.5">{h.reason}</div>
                  </div>
                </div>
              ))}
            </div>
            {plan.tips?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/[0.07]">
                {plan.tips.map((tip, i) => <div key={i} className="insight py-2">💡 {tip}</div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
