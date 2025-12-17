import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPostureRankings, getOrganizationStats, getUserEmail } from '../../lib/managerAnalytics';

export default function Manager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [orgStats, setOrgStats] = useState(null);
  const [userEmails, setUserEmails] = useState({});

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [rankingsData, statsData] = await Promise.all([
          getUserPostureRankings(7),
          getOrganizationStats(7)
        ]);

        setRankings(rankingsData);
        setOrgStats(statsData);

        // Fetch user emails in parallel
        const emailPromises = rankingsData.map(async (ranking) => {
          try {
            const userData = await getUserEmail(ranking.user_id);
            return [ranking.user_id, userData?.username || userData?.email || 'Unknown User'];
          } catch (err) {
            console.error('Error fetching email for user:', ranking.user_id, err);
            return [ranking.user_id, 'Unknown User'];
          }
        });

        const emailEntries = await Promise.all(emailPromises);
        const emails = Object.fromEntries(emailEntries);
        setUserEmails(emails);
      } catch (error) {
        console.error('Failed to load manager data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading manager dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Please sign in to view manager dashboard</div>
      </div>
    );
  }

  const getBalanceLabel = (score) => {
    if (score < 10) return { text: 'Excellent', color: 'text-green-500' };
    if (score < 20) return { text: 'Good', color: 'text-blue-500' };
    if (score < 30) return { text: 'Fair', color: 'text-yellow-500' };
    return { text: 'Needs Improvement', color: 'text-red-500' };
  };

  return (
    <div className="space-y-6">
      <h1 className="font-semibold text-4xl text-gray-900 dark:text-gray-200">
        Manager Dashboard
      </h1>

      {/* Organization Stats */}
      {orgStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {orgStats.total_users}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Sitting</div>
            <div className="text-3xl font-bold text-red-500 mt-2">
              {orgStats.avg_sitting_percentage}%
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Standing</div>
            <div className="text-3xl font-bold text-green-500 mt-2">
              {orgStats.avg_standing_percentage}%
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Balance Score</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {orgStats.avg_balance_score}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              (0 = perfect balance)
            </div>
          </div>
        </div>
      )}

      {/* User Rankings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
            User Posture Rankings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ranked by posture balance (Last 7 days)
          </p>
        </div>
        
        {rankings.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No user data available yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sitting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Standing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Sitting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Standing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rankings.map((ranking, index) => {
                  const balanceLabel = getBalanceLabel(ranking.balance_score);
                  return (
                    <tr key={ranking.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {userEmails[ranking.user_id] || 'Loading...'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-semibold ${balanceLabel.color}`}>
                          {balanceLabel.text}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          ({ranking.balance_score.toFixed(1)})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                        {ranking.sitting_percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500 font-medium">
                        {ranking.standing_percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {ranking.avg_sitting_hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {ranking.avg_standing_hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {ranking.total_active_hours}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
