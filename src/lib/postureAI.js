// AI-powered posture insights using Google Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Generate personalized habits and tips using AI
 */
export async function generatePostureInsights(weeklyStats) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using rule-based analysis');
    return null;
  }

  // Calculate summary metrics
  const totalSitting = weeklyStats.reduce((sum, day) => sum + day.total_sitting_ms, 0);
  const totalStanding = weeklyStats.reduce((sum, day) => sum + day.total_standing_ms, 0);
  const totalChanges = weeklyStats.reduce((sum, day) => sum + day.posture_changes_count, 0);
  
  const avgSittingHours = (totalSitting / weeklyStats.length / 3600000).toFixed(1);
  const avgStandingHours = (totalStanding / weeklyStats.length / 3600000).toFixed(1);
  const avgChanges = Math.round(totalChanges / weeklyStats.length);
  const avgSittingSession = weeklyStats.reduce((sum, day) => sum + day.avg_sitting_session_ms, 0) / weeklyStats.length;
  const avgStandingSession = weeklyStats.reduce((sum, day) => sum + day.avg_standing_session_ms, 0) / weeklyStats.length;
  
  const sittingPercent = Math.round((totalSitting / (totalSitting + totalStanding)) * 100);

  const prompt = `You are an expert in ergonomics and workplace health. Analyze this user's 7-day desk posture data and provide personalized insights.

Data Summary:
- Average sitting time: ${avgSittingHours}h/day (${sittingPercent}% of total)
- Average standing time: ${avgStandingHours}h/day
- Average posture changes: ${avgChanges}/day
- Average sitting session: ${Math.round(avgSittingSession / 60000)} minutes
- Average standing session: ${Math.round(avgStandingSession / 60000)} minutes

Provide exactly 3-5 specific habits you observe (both positive and negative) and 3-5 actionable tips to improve their posture health.

Respond in this exact JSON format:
{
  "habits": [
    {"text": "Short observation about their habit", "emoji": "relevant emoji"}
  ],
  "tips": [
    {"text": "Specific actionable tip", "emoji": "relevant emoji"}
  ]
}

Be concise, specific, and encouraging. Focus on their actual data patterns.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON from response (may have markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    const insights = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!insights.habits || !insights.tips || 
        !Array.isArray(insights.habits) || !Array.isArray(insights.tips)) {
      throw new Error('Invalid insights structure');
    }

    return insights;
  } catch (error) {
    console.error('Failed to generate AI insights:', error);
    return null;
  }
}
