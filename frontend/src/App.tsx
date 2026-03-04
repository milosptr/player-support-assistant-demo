import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import ErrorBoundary from './components/ErrorBoundary';
import ChatWidget from './components/ChatWidget';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
const NewTicket = lazy(() => import('./pages/NewTicket'));

function PageLoader() {
  return (
    <div className="flex justify-center py-12">
      <Spinner />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
          <Route path="/tickets/new" element={<Suspense fallback={<PageLoader />}><NewTicket /></Suspense>} />
          <Route path="/tickets/:id" element={<Suspense fallback={<PageLoader />}><TicketDetail /></Suspense>} />
        </Route>
      </Routes>
      <ChatWidget />
    </ErrorBoundary>
  );
}
