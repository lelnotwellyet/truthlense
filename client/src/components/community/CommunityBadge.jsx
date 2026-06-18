export default function CommunityBadge({ upvotes = 0, downvotes = 0 }) {
  const total = upvotes + downvotes;
  if (total === 0) return null;

  const approvalRate = (upvotes / total) * 100;
  let text = 'Community Verified';
  let colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

  if (approvalRate < 40) {
    text = 'Community Disputed';
    colorClass = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  } else if (approvalRate < 70) {
    text = 'Mixed Opinions';
    colorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }

  return (
    <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${colorClass}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span>{text}</span>
    </div>
  );
}
