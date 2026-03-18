export default function Navbar({ user, onLoginClick, onRegisterClick, onLogout, onUpgrade }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-brand-700">SaaS MVP</p>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Feedback Board</h1>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-600">
              {user.name || user.email}
              {user.isPremium ? ' • Premium' : ''}
            </p>
            {!user.isPremium && (
              <button
                type="button"
                onClick={onUpgrade}
                className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
              >
                Upgrade
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegisterClick}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Register
            </button>
            <button
              type="button"
              onClick={onLoginClick}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
