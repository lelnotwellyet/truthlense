export default function TopicFilter({ topics, selected, onSelect }) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
      {topics.map((topic) => {
        const isSelected = selected === topic.value;
        return (
          <button
            key={topic.value}
            onClick={() => onSelect(topic.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isSelected
                ? 'gradient-bg text-white shadow-lg shadow-accent/20'
                : 'glass text-navy-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {topic.label}
          </button>
        );
      })}
    </div>
  );
}
