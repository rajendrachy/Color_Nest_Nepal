import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import './styles/globals.css';

// Lazy loaded pages for optimal chunk splitting
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminPainters = lazy(() => import('./pages/AdminPainters'));
const AdminWarehouses = lazy(() => import('./pages/AdminWarehouses'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminReportLogs = lazy(() => import('./pages/AdminReportLogs'));
const AdminColorMixing = lazy(() => import('./pages/AdminColorMixing'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const About = lazy(() => import('./pages/About'));
const Track = lazy(() => import('./pages/Track'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Profile = lazy(() => import('./pages/Profile'));
const Painters = lazy(() => import('./pages/Painters'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const PainterDashboard = lazy(() => import('./pages/PainterDashboard'));

const GlobalLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(196, 30, 58, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading ColorNest...</p>
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Page Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ color: 'var(--secondary)', fontSize: '24px', margin: 0 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
            This page encountered an error. Please try refreshing.
          </p>
          <button 
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Toaster position="top-right" reverseOrder={false} />
            <Navbar />
            <main className="main-content">
              <ErrorBoundary>
                <Suspense fallback={<GlobalLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/track" element={<Track />} />
                    <Route path="/track/:id" element={<OrderTracking />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/painters" element={<Painters />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/painter-dashboard" element={
                      <ProtectedRoute>
                        <PainterDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/products" element={
                      <ProtectedRoute adminOnly>
                        <AdminProducts />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <ProtectedRoute adminOnly>
                        <AdminOrders />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                      <ProtectedRoute adminOnly>
                        <AdminUsers />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/painters" element={
                      <ProtectedRoute adminOnly>
                        <AdminPainters />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/warehouses" element={
                      <ProtectedRoute adminOnly>
                        <AdminWarehouses />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                      <ProtectedRoute adminOnly>
                        <AdminSettings />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/payments" element={
                      <ProtectedRoute adminOnly>
                        <AdminPayments />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/report-logs" element={
                      <ProtectedRoute adminOnly>
                        <AdminReportLogs />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/color-mixing" element={
                      <ProtectedRoute adminOnly>
                        <AdminColorMixing />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-success/:method" element={<PaymentSuccess />} />
                    <Route path="/payment-failure" element={<PaymentFailure />} />
                    <Route path="/payment-failure/:method" element={<PaymentFailure />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
