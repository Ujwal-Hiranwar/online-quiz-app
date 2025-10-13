import React from 'react';
import Leaderboard from '../components/leaderboard/Leaderboard';

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Leaderboard />
      </div>
    </div>
  );
};

export default LeaderboardPage;
