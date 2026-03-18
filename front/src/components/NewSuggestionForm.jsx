import { useState } from 'react';

const INITIAL_STATE = {
  title: '',
  description: '',
};

export default function NewSuggestionForm({ onSubmit, isSubmitting, canCreate }) {
  const [form, setForm] = useState(INITIAL_STATE);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
    });

    setForm(INITIAL_STATE);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Новая идея</h2>

      <div className="mb-3">
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Заголовок
        </label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={updateField}
          placeholder="Например: Добавить дорожную карту"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring-2"
          disabled={isSubmitting || !canCreate}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={updateField}
          rows={4}
          placeholder="Опишите проблему и желаемый результат..."
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring-2"
          disabled={isSubmitting || !canCreate}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !canCreate}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? 'Отправка...' : 'Отправить идею'}
      </button>

      {!canCreate && (
        <p className="mt-2 text-xs text-amber-600">Чтобы отправлять идеи, войдите в аккаунт.</p>
      )}
    </form>
  );
}
