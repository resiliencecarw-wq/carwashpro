import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./assets/components/Navbar";
import BottomNav from "./assets/components/BottomNav";
import NetworkStatus from "./assets/components/NetworkStatus";
import ErrorBoundary, { NotFound } from "./assets/components/ErrorBoundary";
import Home from "./pages/Home";
import BookService from "./pages/BookService";
import AdminDashboard from "./pages/AdminDashboard";
import TrackBooking from "./pages/TrackBooking";
import CustomerAuth from "./pages/CustomerAuth";
import CustomerDashboard from "./pages/CustomerDashboard";
import { isAdminAuthenticated, isCustomerAuthenticated } from "./utils/auth";

function ProtectedAdminRoute({ children }) {
  return isAdminAuthenticated() ? children : <Navigate to="/customer/auth" replace />;
}

function ProtectedCustomerRoute({ children }) {
  return isCustomerAuthenticated() ? children : <Navigate to="/customer/auth" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="pb-16 md:pb-0">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookService />} />
            <Route path="/track" element={<TrackBooking />} />
            <Route path="/customer/auth" element={<CustomerAuth />} />
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedCustomerRoute>
                  <CustomerDashboard />
                </ProtectedCustomerRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
          <NetworkStatus />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

