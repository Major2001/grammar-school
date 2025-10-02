export const getPercentageClass = (percentage) => {
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'average';
  return 'poor';
};

export const getLastAttemptForExam = (examAttempts, examId) => {
  return examAttempts
    .filter(attempt => attempt.exam_id === examId)
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];
};
