import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Purchases from './pages/Purchases';
import Inventory from './pages/Inventory';
import Quotations from './pages/Quotations';
import Sales from './pages/Sales';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected administrative routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                
                <Route element={<ProtectedRoute permission="view-clients" />}>
                  <Route path="/clients" element={<Clients />} />
                </Route>
                
                <Route element={<ProtectedRoute permission="view-products" />}>
                  <Route path="/products" element={<Products />} />
                </Route>
                
                <Route element={<ProtectedRoute permission="view-purchases" />}>
                  <Route path="/purchases" element={<Purchases />} />
                </Route>
                
                <Route element={<ProtectedRoute permission="view-inventory" />}>
                  <Route path="/inventory" element={<Inventory />} />
                </Route>
                
                <Route element={<ProtectedRoute permission="view-quotations" />}>
                  <Route path="/quotations" element={<Quotations />} />
                </Route>
                
                <Route element={<ProtectedRoute permission="view-sales" />}>
                  <Route path="/sales" element={<Sales />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback redirect */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
