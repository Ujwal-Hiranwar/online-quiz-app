export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculatePercentage = (score, total) => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

export const getScoreColor = (percentage) => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
