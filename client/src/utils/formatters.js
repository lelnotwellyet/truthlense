export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatScore(score) {
  if (score === null || score === undefined) return 'N/A';
  return `${Math.round(score)}%`;
}

export function truncateText(text, length = 150) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

export function getVerdictColor(verdict) {
  switch (verdict) {
    case 'Highly Credible': return 'text-emerald-400';
    case 'Likely Credible': return 'text-accent-400';
    case 'Uncertain': return 'text-amber-400';
    case 'Potentially Misleading': return 'text-rose-400';
    default: return 'text-gray-400';
  }
}

export function getVerdictBg(verdict) {
  switch (verdict) {
    case 'Highly Credible': return 'badge-credible';
    case 'Likely Credible': return 'badge-likely';
    case 'Uncertain': return 'badge-uncertain';
    case 'Potentially Misleading': return 'badge-misleading';
    default: return 'badge-uncertain';
  }
}

export function getScoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#f43f5e';
}
