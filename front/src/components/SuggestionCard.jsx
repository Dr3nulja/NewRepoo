export default function SuggestionCard({ suggestion, onVote, isVoting, canVote }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{suggestion.title}</h3>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
          {suggestion.status}
        </span>
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-600">{suggestion.description}</p>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Author: {suggestion.authorName}</p>

        <button
          type="button"
          onClick={() => onVote(suggestion.id)}
          disabled={isVoting || !canVote}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Голосовать
          <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs">{suggestion.voteCount}</span>
        </button>
      </div>
    </article>
  );
}
