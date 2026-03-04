import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const { pathname } = useLocation();

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        pathname === to ? 'text-teal-400' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen">
      <div className="h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
      <header className="border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-500/15 ring-1 ring-teal-500/30">
              <svg className="h-4 w-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-gray-100">PSA</span>
              <span className="text-[10px] tracking-wider text-gray-500">Player Support</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            {navLink('/', 'Dashboard')}
            {navLink('/tickets/new', 'New Ticket')}
          </nav>
        </div>
      </header>
      <main className="animate-fade-in mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
