import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';

type SearchResult = {
  title: string | null;
  url: string;
  publishedDate: string | null;
  author: string | null;
  highlights: string[];
};

type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

const suggestedQueries = [
  'AI agents in enterprise automation',
  'LLM cost optimization strategies',
  'RAG architecture best practices',
];

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
};

const formatHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const InsightSearch = () => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const runSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setStatus('error');
      setErrorMessage('Enter a topic to search for.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setSubmittedQuery(trimmed);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setResults([]);
        setStatus('error');
        setErrorMessage(
          payload?.error?.message ?? 'The search service is unavailable right now. Please try again later.'
        );
        return;
      }

      const found: SearchResult[] = Array.isArray(payload?.results) ? payload.results : [];
      setResults(found);
      setStatus(found.length > 0 ? 'success' : 'empty');
    } catch {
      setResults([]);
      setStatus('error');
      setErrorMessage('Could not reach the search service. Check your connection and try again.');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void runSearch(query);
  };

  return (
    <section className="py-20 bg-gray-800/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 lg:p-12 space-y-8"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 text-cyan-400 text-sm font-medium">
              <Sparkles size={16} />
              <span>Live web search</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Search AI &amp; automation insights</h2>
            <p className="text-gray-300">
              Ask about a topic in AI, automation or cloud engineering and we will pull the most relevant
              sources from across the web.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <label htmlFor="insight-search" className="sr-only">
              Search topic
            </label>
            <input
              id="insight-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={200}
              placeholder="e.g. AI agents for customer support"
              className="flex-1 px-6 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={status === 'loading'}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Searching</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Search</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="flex flex-wrap gap-3">
            {suggestedQueries.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setQuery(suggestion);
                  void runSearch(suggestion);
                }}
                className="px-4 py-2 rounded-full text-sm bg-gray-800 text-gray-300 border border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div aria-live="polite" className="space-y-4">
            {status === 'loading' && (
              <p className="text-gray-400 text-sm">Searching the web for “{submittedQuery}”…</p>
            )}

            {status === 'error' && (
              <div className="flex items-start space-x-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <AlertCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-200 text-sm">{errorMessage}</p>
              </div>
            )}

            {status === 'empty' && (
              <p className="text-gray-400 text-sm">
                No sources matched “{submittedQuery}”. Try a broader topic.
              </p>
            )}

            {status === 'success' && (
              <ul className="space-y-4">
                {results.map((result) => {
                  const published = formatDate(result.publishedDate);
                  return (
                    <li key={result.url}>
                      <motion.a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -2 }}
                        className="block bg-gray-900/60 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors duration-200">
                            {result.title ?? formatHost(result.url)}
                          </h3>
                          <ExternalLink size={16} className="text-gray-500 mt-1 shrink-0" />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                          <span className="text-cyan-400">{formatHost(result.url)}</span>
                          {result.author && <span>By {result.author}</span>}
                          {published && <span>{published}</span>}
                        </div>

                        {result.highlights.map((highlight, index) => (
                          <p key={index} className="text-gray-300 text-sm leading-relaxed mt-4">
                            {highlight}
                          </p>
                        ))}
                      </motion.a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InsightSearch;
