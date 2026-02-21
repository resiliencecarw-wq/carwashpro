import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BookService from "./pages/BookService";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import TrackBooking from "./pages/TrackBooking";
import CustomerAuth from "./pages/CustomerAuth";
import CustomerDashboard from "./pages/CustomerDashboard";
import { isAdminAuthenticated, isCustomerAuthenticated } from "./utils/auth";

function ProtectedAdminRoute({ children }) {
  return isAdminAuthenticated() ? children : <Navigate to="/admin/login" replace />;
}

function ProtectedCustomerRoute({ children }) {
  return isCustomerAuthenticated() ? children : <Navigate to="/customer/auth" replace />;
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<BookService />} />
        <Route path="/track" element={<TrackBooking />} />
        <Route path="/customer/auth" element={<CustomerAuth />} />
        <Route
          path="/customer/dashboard"
          element={(
            <ProtectedCustomerRoute>
              <CustomerDashboard />
            </ProtectedCustomerRoute>
          )}
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={(
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          )}
        />
      </Routes>
    </Router>
  );
}
