import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export const today = () => format(new Date(), 'yyyy-MM-dd');
export const formatDate = (d) => format(new Date(d + 'T00:00:00'), 'EEEE d MMM yyyy');
export const formatDateShort = (d) => format(new Date(d + 'T00:00:00'), 'dd MMM');
export const lastNDays = (n) => {
  const end = new Date();
  const start = subDays(end, n - 1);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

export const TIME_OF_DAY_LABELS = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
};

export const FEELING_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Below Average',
  4: 'Slightly Below Average',
  5: 'Average',
  6: 'Slightly Above Average',
  7: 'Good',
  8: 'Very Good',
  9: 'Excellent',
  10: 'Perfect',
};

export const feelingColor = (score) => {
  if (!score) return 'text-gray-400';
  if (score <= 3) return 'text-red-500';
  if (score <= 5) return 'text-orange-500';
  if (score <= 7) return 'text-yellow-500';
  return 'text-green-500';
};

export const feelingBg = (score) => {
  if (!score) return 'bg-gray-100 text-gray-500';
  if (score <= 3) return 'bg-red-100 text-red-700';
  if (score <= 5) return 'bg-orange-100 text-orange-700';
  if (score <= 7) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};
