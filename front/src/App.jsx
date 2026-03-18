import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import NewSuggestionForm from './components/NewSuggestionForm';
import SuggestionCard from './components/SuggestionCard';
import { getCurrentUser, login, logout, register } from './services/auth';
import { redirectToStripePaymentLink } from './services/billing';
import { createSuggestion, fetchSuggestions, voteForSuggestion } from './services/suggestions';

export default function App() {
  const [suggestions, setSuggestions] = useState([]);
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [error, setError] = useState('');

  const canInteract = useMemo(() => Boolean(user?.id), [user]);

  async function loadSuggestions() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchSuggestions();
      setSuggestions(data);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить предложения.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function handleLogin() {
    const email = window.prompt('Email');
    const password = window.prompt('Password');

    if (!email || !password) {
      return;
    }

    try {
      const currentUser = await login({ email, password });
      setUser(currentUser);
      await loadSuggestions();
    } catch (err) {
      setError(err.message || 'Ошибка входа.');
    }
  }

  async function handleRegister() {
    const name = window.prompt('Name');
    const email = window.prompt('Email');
    const password = window.prompt('Password');

    if (!email || !password) {
      return;
    }

    try {
      await register({ name, email, password });
      setUser(getCurrentUser());
      await loadSuggestions();
    } catch (err) {
      setError(err.message || 'Ошибка регистрации.');
    }
  }

  function handleLogout() {
    logout();
    setUser(null);
  }

  function handleUpgrade() {
    try {
      redirectToStripePaymentLink();
    } catch (err) {
      setError(err.message || 'Не удалось открыть оплату.');
    }
  }

  async function handleCreateSuggestion(payload) {
    setSubmitting(true);
    setError('');

    try {
      await createSuggestion(payload);
      await loadSuggestions();
    } catch (err) {
      setError(err.message || 'Не удалось создать предложение.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(suggestionId) {
    setVotingId(suggestionId);
    setError('');

    try {
      await voteForSuggestion(suggestionId);
      await loadSuggestions();
    } catch (err) {
      setError(err.message || 'Не удалось проголосовать.');
    } finally {
      setVotingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white text-slate-900">
      <Navbar
        user={user}
        onLoginClick={handleLogin}
        onRegisterClick={handleRegister}
        onLogout={handleLogout}
        onUpgrade={handleUpgrade}
      />

      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <section>
          <NewSuggestionForm
            onSubmit={handleCreateSuggestion}
            isSubmitting={submitting}
            canCreate={canInteract}
          />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Идеи пользователей</h2>

          {error && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Загрузка...</p>
          ) : suggestions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              Пока нет предложений. Станьте первым автором идеи.
            </p>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onVote={handleVote}
                  isVoting={votingId === suggestion.id}
                  canVote={canInteract}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
