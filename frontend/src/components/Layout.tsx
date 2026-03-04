import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const { pathname } = useLocation();

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        pathname === to ? 'text-gray-100' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-bold tracking-tight text-gray-100">
            PSA
          </Link>
          <nav className="flex items-center gap-6">
            {navLink('/', 'Dashboard')}
            {navLink('/tickets/new', 'New Ticket')}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
