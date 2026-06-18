import NewsCard from './NewsCard';

export default function NewsFeed({ articles, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass overflow-hidden flex flex-col h-[400px] animate-pulse">
            <div className="h-48 bg-navy-800 w-full" />
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex justify-between mb-4">
                <div className="h-6 w-20 bg-navy-800 rounded-full" />
                <div className="h-4 w-16 bg-navy-800 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-navy-800 rounded mb-2" />
              <div className="h-6 w-1/2 bg-navy-800 rounded mb-4" />
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-navy-800 rounded" />
                <div className="h-4 w-5/6 bg-navy-800 rounded" />
              </div>
              <div className="mt-auto pt-4 border-t border-white/10 flex justify-between">
                <div className="h-4 w-24 bg-navy-800 rounded" />
                <div className="h-4 w-16 bg-navy-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-20 glass">
        <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
        <p className="text-navy-300">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
