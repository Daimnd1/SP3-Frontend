import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getWeeklyStats, msToHours, calculatePostureBalance } from "../../lib/postureAnalytics";

// Shared chart styles and configurations
const chartColors = {
  grid: "#334155",
  axis: "#94a3b8",
  sitting: "#f87171",
  standing: "#34d399",
  changes: "#a78bfa",
  avgSitting: "#38bdf8",
  avgStanding: "#fbbf24",
};

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#e2e8f0",
};

const commonAxisProps = {
  stroke: chartColors.axis,
  tick: { fill: chartColors.axis, fontSize: 12 },
  interval: 0,
};

// Day names for chart display
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Analyze posture data to identify habits and generate tips
function analyzePostureData(postureTimeData, postureChangeData, sessionDurationData) {
  if (!postureTimeData.length) {
    return { habits: [{ text: "No data yet - start tracking!", emoji: "📊" }], tips: [] };
  }
  // Calculate averages
  const avgSittingTime =
    postureTimeData.reduce((sum, day) => sum + day.sitting, 0) /
    postureTimeData.length;
  const avgStandingTime =
    postureTimeData.reduce((sum, day) => sum + day.standing, 0) /
    postureTimeData.length;
  const avgChanges =
    postureChangeData.reduce((sum, day) => sum + day.changes, 0) /
    postureChangeData.length;
  const avgSittingSession =
    sessionDurationData.reduce((sum, day) => sum + day.avgSitting, 0) /
    sessionDurationData.length;
  const avgStandingSession =
    sessionDurationData.reduce((sum, day) => sum + day.avgStanding, 0) /
    sessionDurationData.length;

  const totalActiveTime = avgSittingTime + avgStandingTime;
  const sittingPercentage = (avgSittingTime / totalActiveTime) * 100;

  const habits = [];
  const tips = [];

  // Identify multiple habits based on data
  if (sittingPercentage > 60) {
    habits.push({
      text: `You sit ${sittingPercentage.toFixed(0)}% of your active time`,
      emoji: "🪑",
    });
  }

  if (avgChanges < 10) {
    habits.push({
      text: `Low posture changes: ${avgChanges.toFixed(0)} times per day`,
      emoji: "😴",
    });
  }

  if (avgSittingSession > 40) {
    habits.push({
      text: `Long sitting sessions: ${avgSittingSession.toFixed(
        0
      )} min average`,
      emoji: "⏱️",
    });
  }

  if (avgStandingSession < 25) {
    habits.push({
      text: `Short standing sessions: ${avgStandingSession.toFixed(
        0
      )} min average`,
      emoji: "⚡",
    });
  }

  if (avgStandingTime < 2.5) {
    habits.push({
      text: `Only ${avgStandingTime.toFixed(1)}h standing time per day`,
      emoji: "📉",
    });
  }

  // Positive habits
  if (sittingPercentage < 50 && avgChanges > 10) {
    habits.push({
      text: "Great balance between sitting and standing!",
      emoji: "✨",
    });
  }

  if (avgChanges > 12) {
    habits.push({
      text: "Excellent posture change frequency",
      emoji: "🎯",
    });
  }

  if (avgStandingTime > 3) {
    habits.push({
      text: `Strong standing habit: ${avgStandingTime.toFixed(1)}h daily`,
      emoji: "💪",
    });
  }

  // If no habits identified, add a default
  if (habits.length === 0) {
    habits.push({
      text: "Building healthy posture habits",
      emoji: "🌱",
    });
  }

  // Generate personalized tips based on habits
  if (sittingPercentage > 60) {
    tips.push({
      text: "Try standing for 2-3 hours daily. Start with 15-minute intervals!",
      emoji: "💡",
    });
  }

  if (avgChanges < 10) {
    tips.push({
      text: "Change posture every 30-45 minutes to improve circulation",
      emoji: "🔄",
    });
  }

  if (avgSittingSession > 40) {
    tips.push({
      text: "Limit sitting sessions to 30-40 minutes, then stand up",
      emoji: "⏰",
    });
  }

  if (avgStandingTime < 2.5) {
    tips.push({
      text: "Aim for 2+ hours of standing time per day for better health",
      emoji: "🎯",
    });
  }

  if (avgStandingSession < 25) {
    tips.push({
      text: "Extend standing sessions to 20-30 minutes for better benefits",
      emoji: "📈",
    });
  }

  // Positive reinforcement tips
  if (avgChanges > 12) {
    tips.push({
      text: "Great job! Keep alternating postures regularly",
      emoji: "⭐",
    });
  }

  // General wellness tips
  if (tips.length < 3) {
    const generalTips = [
      {
        text: "Take a 5-minute walk every 2 hours to boost energy",
        emoji: "🚶",
      },
      {
        text: "Stretch your legs and back when switching postures",
        emoji: "🧘",
      },
      {
        text: "Set hourly reminders to check and adjust your posture",
        emoji: "⏰",
      },
      {
        text: "Stay hydrated - it encourages regular movement breaks",
        emoji: "�",
      },
    ];

    generalTips.forEach((tip) => {
      if (tips.length < 3) tips.push(tip);
    });
  }

  return { habits, tips };
}

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [postureTimeData, setPostureTimeData] = useState([]);
  const [postureChangeData, setPostureChangeData] = useState([]);
  const [sessionDurationData, setSessionDurationData] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const stats = await getWeeklyStats(user.id, 7);

        // Transform data for charts
        const timeData = stats.map(day => {
          const date = new Date(day.date);
          return {
            day: dayNames[date.getDay()],
            sitting: parseFloat(msToHours(day.total_sitting_ms)),
            standing: parseFloat(msToHours(day.total_standing_ms))
          };
        });

        const changeData = stats.map(day => {
          const date = new Date(day.date);
          return {
            day: dayNames[date.getDay()],
            changes: day.posture_changes_count
          };
        });

        const durationData = stats.map(day => {
          const date = new Date(day.date);
          return {
            day: dayNames[date.getDay()],
            avgSitting: Math.round((day.avg_sitting_session_ms || 0) / 60000),
            avgStanding: Math.round((day.avg_standing_session_ms || 0) / 60000)
          };
        });

        setPostureTimeData(timeData);
        setPostureChangeData(changeData);
        setSessionDurationData(durationData);
      } catch (error) {
        console.error('Failed to load reports data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Use rule-based analysis
  const { habits, tips } = analyzePostureData(postureTimeData, postureChangeData, sessionDurationData);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading reports...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Please sign in to view reports</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-semibold text-4xl text-gray-900 dark:text-gray-200">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Habits" items={habits} />
        <Card title="Tips" items={tips} />
      </div>

      <ChartCard title="Daily Sitting vs Standing Time" height={350}>
        <BarChart data={postureTimeData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartColors.grid}
            vertical={false}
          />
          <XAxis dataKey="day" {...commonAxisProps} />
          <YAxis
            stroke={chartColors.axis}
            tick={{ fill: chartColors.axis }}
            label={{
              value: "Hours",
              angle: -90,
              position: "insideLeft",
              fill: chartColors.axis,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => `${value}h`}
          />
          <Legend wrapperStyle={{ color: "#e2e8f0" }} />
          <Bar
            dataKey="sitting"
            fill={chartColors.sitting}
            name="Sitting"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="standing"
            fill={chartColors.standing}
            name="Standing"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartCard>

      <ChartCard title="Posture Change Frequency" height={300}>
        <LineChart data={postureChangeData}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis dataKey="day" {...commonAxisProps} />
          <YAxis
            stroke={chartColors.axis}
            tick={{ fill: chartColors.axis }}
            label={{
              value: "Changes",
              angle: -90,
              position: "insideLeft",
              fill: chartColors.axis,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => `${value} changes`}
          />
          <Legend wrapperStyle={{ color: "#e2e8f0" }} />
          <Line
            type="monotone"
            dataKey="changes"
            stroke={chartColors.changes}
            strokeWidth={3}
            name="Daily Changes"
            dot={{ fill: chartColors.changes, r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ChartCard>

      <ChartCard title="Average Session Duration" height={300}>
        <BarChart data={sessionDurationData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartColors.grid}
            vertical={false}
          />
          <XAxis dataKey="day" {...commonAxisProps} />
          <YAxis
            stroke={chartColors.axis}
            tick={{ fill: chartColors.axis }}
            label={{
              value: "Minutes",
              angle: -90,
              position: "insideLeft",
              fill: chartColors.axis,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => `${value} min`}
          />
          <Legend wrapperStyle={{ color: "#e2e8f0" }} />
          <Bar
            dataKey="avgSitting"
            fill={chartColors.avgSitting}
            name="Avg Sitting"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="avgStanding"
            fill={chartColors.avgStanding}
            name="Avg Standing"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, height, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-6">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function Card({ title, items }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = items.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="flex bg-blue-100 dark:bg-blue-900/60 rounded-lg p-6">
      <div className="flex items-stretch gap-4">
        <div className="w-1 bg-blue-500 rounded-full"></div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">{title}</h3>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label="Previous"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label="Next"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <ul className="space-y-3">
            {currentItems.map((item, index) => (
              <li
                key={index}
                className="text-gray-700 dark:text-gray-300 text-base flex items-start gap-2"
              >
                <span className="text-lg shrink-0">{item.emoji}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
