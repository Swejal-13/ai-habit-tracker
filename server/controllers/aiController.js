const Habit = require('../models/Habit');
const Task = require('../models/Task');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require('openai');

// ── Gemini Client ─────────────────────────────────────
let geminiModel = null;

if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  geminiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });
}

// ── OpenAI / Anthropic Client ─────────────────────────
const getClient = () => {
  if (process.env.ANTHROPIC_API_KEY) {
    return new OpenAI({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: 'https://api.anthropic.com/v1/',
      defaultHeaders: { 'anthropic-version': '2023-06-01' },
    });
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const MODEL = process.env.ANTHROPIC_API_KEY
  ? 'claude-sonnet-4-20250514'
  : 'gpt-4o-mini';

// ── Unified AI Call Function ───────────────────────────
async function callAI(prompt, maxTokens = 600) {

  if (geminiModel) {

    const result = await geminiModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    return result.response.text();
  }

  // fallback (OpenAI)
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content;
}

// ── Build user context string ─────────────────────────
async function buildUserContext(userId) {

  const habits = await Habit.find({ user: userId, isActive: true }).lean();
  const tasks  = await Task.find({ user: userId, isCompleted: false }).lean();

  const habitList = habits
    .map(h => `${h.emoji} ${h.name} (streak: ${h.currentStreak}, ${h.frequency})`)
    .join(', ');

  const taskList = tasks
    .slice(0, 5)
    .map(t => `${t.title} [${t.priority}]`)
    .join(', ');

  return `User habits: ${habitList || 'none yet'}. Pending tasks: ${taskList || 'none'}.`;
}

// ── CHAT with AI Coach ────────────────────────────────
exports.chat = async (req, res, next) => {
  try {

    const { messages } = req.body;

    if (!messages?.length) {
      return res.status(400).json({
        success: false,
        message: 'Messages required'
      });
    }

    const context = await buildUserContext(req.user.id);

    const conversation = messages
      .slice(-10)
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
You are an expert AI Productivity Coach for HabitFlow.

${context}

Conversation:
${conversation}

Your role:
- analyze habits
- give actionable advice
- motivate users
- suggest improvements

Keep responses under 200 words.
Be warm, specific, and encouraging.
`;

    const reply = await callAI(prompt, 500);

    res.json({
      success: true,
      reply
    });

  } catch (err) {
    next(err);
  }
};

// ── GENERATE HABIT PLAN ───────────────────────────────
exports.generateHabitPlan = async (req, res, next) => {

  try {

    const { goal, currentHabits = [] } = req.body;

    if (!goal) {
      return res.status(400).json({
        success: false,
        message: 'Goal required'
      });
    }

    const prompt = `
Create a personalized habit plan for this goal: "${goal}".

Current habits: ${currentHabits.join(', ') || 'none'}.

Return JSON with this structure:

{
  "summary": "brief goal overview",
  "habits": [
    {
      "name": "habit name",
      "emoji": "single emoji",
      "frequency": "daily|weekly",
      "bestTime": "morning|afternoon|evening",
      "duration": "10 minutes",
      "reason": "why this helps",
      "category": "Health & Fitness|Mental Wellness|Learning|Productivity|Nutrition|Other"
    }
  ],
  "weeklySchedule": "schedule idea",
  "tips": ["tip 1","tip 2","tip 3"]
}

Return ONLY valid JSON.
`;

    const text = await callAI(prompt, 800);

    let plan;

    try {
      plan = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      plan = {
        summary: "AI plan generated",
        habits: [],
        tips: []
      };
    }

    res.json({
      success: true,
      plan
    });

  } catch (err) {
    next(err);
  }
};

// ── DAILY PLANNER ─────────────────────────────────────
exports.generateDayPlan = async (req, res, next) => {

  try {

    const { items, energyLevel = 'medium', wakeTime = '7:00 AM' } = req.body;

    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: 'Items required'
      });
    }

    const prompt = `
Create an optimized daily schedule.

Wake time: ${wakeTime}
Energy level: ${energyLevel}

Items:
${items.join(', ')}

Return JSON:

{
 "schedule":[
  {
   "time":"9:00 AM",
   "task":"task name",
   "duration":"2 hours",
   "type":"deep_work|habit|break|admin",
   "reason":"why scheduled here"
  }
 ],
 "advice":"one productivity tip"
}
`;

    const text = await callAI(prompt, 600);

    let plan;

    try {
      plan = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      plan = {
        schedule: [],
        advice: "Plan hardest tasks early."
      };
    }

    res.json({
      success: true,
      plan
    });

  } catch (err) {
    next(err);
  }
};

// ── WEEKLY REPORT ─────────────────────────────────────
exports.weeklyReport = async (req, res, next) => {

  try {

    const context = await buildUserContext(req.user.id);

    const prompt = `
Generate a weekly productivity report.

${context}

Return JSON:

{
 "performanceSummary":"...",
 "bestHabit":"...",
 "missedHabits":["..."],
 "suggestions":["..."],
 "motivation":"...",
 "score":0-100
}
`;

    const text = await callAI(prompt, 600);

    let report;

    try {
      report = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      report = {
        performanceSummary: "Great week!",
        suggestions: [],
        motivation: "Keep going!",
        score: 75
      };
    }

    res.json({
      success: true,
      report
    });

  } catch (err) {
    next(err);
  }
};

// ── HABIT SUGGESTIONS ─────────────────────────────────
exports.habitSuggestions = async (req, res, next) => {

  try {

    const context = await buildUserContext(req.user.id);

    const prompt = `
Based on user habits suggest 4 NEW habits.

${context}

Return JSON array:

[
 { "name":"...", "emoji":"...", "reason":"...", "category":"...", "frequency":"daily|weekly" }
]

Only suggest habits not already listed.
`;

    const text = await callAI(prompt, 400);

    let suggestions;

    try {
      suggestions = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      suggestions = [];
    }

    res.json({
      success: true,
      suggestions
    });

  } catch (err) {
    next(err);
  }
};