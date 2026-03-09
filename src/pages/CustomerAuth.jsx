import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { isCustomerAuthenticated, isAdminAuthenticated, setAuthSession, getAuthSession } from "../utils/auth";
import { toast } from "../assets/components/Toast";
import registerImage from "../assets/register page.jpg";
import loginImage from "../assets/loginpage.jpg";

export default function CustomerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mode, setMode] = useState("login");
  
  const session = getAuthSession();
  const isLoggedIn = isCustomerAuthenticated();
  const isAdmin = isAdminAuthenticated();

  // Redirect if already logged in
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  if (isLoggedIn && mode !== "profile") {
    return <Navigate to="/customer/dashboard" replace />;
  }
  
  // Validation state
  const [validation, setValidation] = useState({
    name: { valid: true, message: "" },
    email: { valid: true, message: "" },
    password: { valid: true, message: "" },
    contact: { valid: true, message: "" },
  });

  // Password requirements
  const passwordRequirements = [
    { id: "length", label: "At least 6 characters", test: (p) => p.length >= 6 },
    { id: "number", label: "Contains a number", test: (p) => /\d/.test(p) },
  ];

  // Login/Register form
  const [authForm, setAuthForm] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    contact: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Handle initial mode from navigation state
  useEffect(() => {
    if (location.state?.mode === "profile" && isLoggedIn) {
      setMode("profile");
    }
  }, [location.state, isLoggedIn]);

  // Load profile data when switching to profile tab
  const loadProfileData = async () => {
    if (!session?.user) return;
    setProfileForm({
      name: session.user.name || "",
      contact: session.user.contact || "",
    });
  };

  useEffect(() => {
    if (isLoggedIn && mode === "profile") {
      loadProfileData();
    }
  }, [mode, isLoggedIn]);

  // Validation functions
  const validateField = (field, value) => {
    let valid = true;
    let message = "";

    switch (field) {
      case "name":
        if (!value.trim()) {
          valid = false;
          message = "Name is required";
        } else if (value.trim().length < 2) {
          valid = false;
          message = "Name must be at least 2 characters";
        }
        break;
      case "email":
        if (!value.trim()) {
          valid = false;
          message = "Email or Username is required";
        }
        break;
      case "password":
        if (!value) {
          valid = false;
          message = "Password is required";
        } else if (value.length < 6) {
          valid = false;
          message = "Password must be at least 6 characters";
        }
        break;
      case "contact":
        if (!value.trim()) {
          valid = false;
          message = "Contact is required";
        }
        break;
      default:
        break;
    }

    setValidation((prev) => ({
      ...prev,
      [field]: { valid, message },
    }));
    return valid;
  };

  const handleInputChange = (field, value) => {
    setAuthForm({ ...authForm, [field]: value });
    if (mode === "register") {
      validateField(field, value);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields for register mode
    if (mode === "register") {
      const fieldsToValidate = ["name", "email", "password", "contact"];
      let isValid = true;
      
      fieldsToValidate.forEach((field) => {
        if (!validateField(field, authForm[field])) {
          isValid = false;
        }
      });

      if (!isValid) return;
    }

    setLoading(true);
    setAuthError("");
    try {
      let endpoint;
      let payload;

      if (mode === "register") {
        endpoint = "/auth/customer/register";
        payload = authForm;
      } else {
        // Unified login - backend detects email vs username
        endpoint = "/auth/login";
        payload = {
          email: authForm.email,
          password: authForm.password,
        };
      }

      const { data } = await API.post(endpoint, payload);
      
      // Handle remember me
      if (rememberMe && mode === "login") {
        localStorage.setItem("carwash_remember", "true");
      }
      
      // Set session with the role from response
      setAuthSession({
        role: data.user.role,
        token: data.token,
        user: data.user,
      });
      
      toast("Welcome! You are now logged in.", "success");
      
      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const { data } = await API.put("/auth/customer/profile", {
        name: profileForm.name,
        contact: profileForm.contact,
      });
      setProfileSuccess(data.message);
      // Update session
      const currentSession = getAuthSession();
      setAuthSession({
        ...currentSession,
        user: {
          ...currentSession.user,
          name: data.user.name,
          contact: data.user.contact,
        },
      });
      toast("Profile updated successfully", "success");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await API.put("/auth/customer/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Password changed successfully", "success");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Check password strength
  const getPasswordStrength = () => {
    const password = authForm.password;
    if (!password) return { strength: 0, label: "" };
    
    let passed = 0;
    passwordRequirements.forEach((req) => {
      if (req.test(password)) passed++;
    });

    if (passed === 0) return { strength: 1, label: "Very Weak", color: "bg-rose-500" };
    if (passed === 1) return { strength: 2, label: "Weak", color: "bg-rose-400" };
    if (passed === 2) return { strength: 3, label: "Medium", color: "bg-amber-500" };
    return { strength: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength();

  // Profile Tab Content
  const renderProfileTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Information */}
      <form onSubmit={handleProfileUpdate} className="rounded-xl border border-brand-border bg-white p-5">
        <h3 className="text-lg font-bold text-brand-ink">Profile Information</h3>
        <p className="mb-4 text-sm text-brand-muted">Update your personal information</p>
        
        {profileSuccess && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 animate-scale-in">
            {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700 animate-scale-in">
            {profileError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Full Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-brand-border p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Contact</label>
            <input
              type="text"
              className="w-full rounded-lg border border-brand-border p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={profileForm.contact}
              onChange={(e) => setProfileForm({ ...profileForm, contact: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Email</label>
            <input
              type="email"
              disabled
              className="w-full rounded-lg border border-brand-border bg-gray-50 p-3 text-brand-muted cursor-not-allowed"
              value={session?.user?.email || ""}
            />
            <p className="mt-1 text-xs text-brand-muted">Email cannot be changed</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={profileLoading}
          className="mt-4 w-full rounded-lg bg-brand-accent py-3 font-bold text-brand-ink hover:bg-brand-accent-strong disabled:opacity-60 transition-all"
        >
          {profileLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordChange} className="rounded-xl border border-brand-border bg-white p-5">
        <h3 className="text-lg font-bold text-brand-ink">Change Password</h3>
        <p className="mb-4 text-sm text-brand-muted">Update your account password</p>
        
        {passwordSuccess && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 animate-scale-in">
            {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700 animate-scale-in">
            {passwordError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Current Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-brand-border p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">New Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-brand-border p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-muted">Confirm New Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-brand-border p-3 text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={passwordLoading}
          className="mt-4 w-full rounded-lg bg-brand-ink py-3 font-bold text-white hover:bg-brand-ink-soft disabled:opacity-60 transition-all"
        >
          {passwordLoading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );

  // Login/Register Tab Content
  const renderAuthForm = () => (
    <>
      <div className="mb-5 overflow-hidden rounded-xl border border-brand-border">
        <img
          src={mode === "register" ? registerImage : loginImage}
          alt={mode === "register" ? "Register" : "Login"}
          className="h-40 w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <h2 className="text-3xl font-bold text-brand-ink animate-fade-in">
        {mode === "register" ? "Create Account" : "Welcome Back"}
      </h2>
      <p className="mt-2 text-sm text-brand-muted animate-fade-in stagger-1">
        {mode === "register" ? "Register to manage your bookings." : "Login with email or username."}
      </p>

      <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <>
            <div className="animate-slide-in-left">
              <input
                placeholder="Full Name"
                className={`w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all ${
                  validation.name.valid 
                    ? "border-brand-border focus:border-brand-accent" 
                    : "border-rose-500 focus:border-rose-500"
                }`}
                value={authForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={(e) => validateField("name", e.target.value)}
                required
              />
              {!validation.name.valid && (
                <p className="mt-1 text-xs text-rose-500 animate-fade-in">{validation.name.message}</p>
              )}
            </div>
            <div className="animate-slide-in-left stagger-1">
              <input
                placeholder="Contact"
                className={`w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all ${
                  validation.contact.valid 
                    ? "border-brand-border focus:border-brand-accent" 
                    : "border-rose-500 focus:border-rose-500"
                }`}
                value={authForm.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                onBlur={(e) => validateField("contact", e.target.value)}
                required
              />
              {!validation.contact.valid && (
                <p className="mt-1 text-xs text-rose-500 animate-fade-in">{validation.contact.message}</p>
              )}
            </div>
          </>
        )}
        
        <div className={mode === "register" ? "animate-slide-in-left stagger-2" : "animate-fade-in"}>
          <input
            type="text"
            placeholder={mode === "register" ? "Email" : "Email or Username"}
            className={`w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all ${
              validation.email.valid 
                ? "border-brand-border focus:border-brand-accent" 
                : "border-rose-500 focus:border-rose-500"
            }`}
            value={authForm.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onBlur={(e) => validateField("email", e.target.value)}
            required
          />
          {!validation.email.valid && (
            <p className="mt-1 text-xs text-rose-500 animate-fade-in">{validation.email.message}</p>
          )}
        </div>
        
        <div className={mode === "register" ? "animate-slide-in-left stagger-3" : "animate-fade-in stagger-1"}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full rounded-lg border p-3 pr-20 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all ${
                validation.password.valid 
                  ? "border-brand-border focus:border-brand-accent" 
                  : "border-rose-500 focus:border-rose-500"
              }`}
              value={authForm.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onBlur={(e) => validateField("password", e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-muted hover:bg-brand-accent hover:text-brand-ink transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {!validation.password.valid && (
            <p className="mt-1 text-xs text-rose-500 animate-fade-in">{validation.password.message}</p>
          )}
          
          {/* Password Requirements (only in register mode) */}
          {mode === "register" && authForm.password && (
            <div className="mt-2 space-y-1 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-brand-muted">{passwordStrength.label}</span>
              </div>
              {passwordRequirements.map((req) => (
                <div key={req.id} className="flex items-center gap-2 text-xs">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    req.test(authForm.password) ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {req.test(authForm.password) ? "✓" : "○"}
                  </span>
                  <span className={req.test(authForm.password) ? "text-emerald-600" : "text-brand-muted"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Remember Me (only in login mode) */}
        {mode === "login" && (
          <div className="flex items-center animate-fade-in stagger-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-brand-muted cursor-pointer">
              Remember me
            </label>
          </div>
        )}

        {authError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700 animate-scale-in">
            {authError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-accent py-3 font-bold text-brand-ink transition-all duration-300 hover:bg-brand-accent-strong hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Please wait...
            </span>
          ) : mode === "register" ? "Register" : "Login"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "register" ? "login" : "register");
          setAuthError("");
          setValidation({
            name: { valid: true, message: "" },
            email: { valid: true, message: "" },
            password: { valid: true, message: "" },
            contact: { valid: true, message: "" },
          });
        }}
        className="mt-4 text-sm font-semibold text-brand-muted hover:text-brand-ink transition-colors"
      >
        {mode === "register" ? "Already have an account? Login" : "Need an account? Register"}
      </button>
    </>
  );

  // Main render
  if (isLoggedIn && mode === "profile") {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center justify-between animate-fade-in">
            <h2 className="text-2xl font-bold text-brand-ink">My Profile</h2>
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-card transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          {renderProfileTab()}
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-brand-border bg-white p-7 shadow-sm animate-scale-in">
        {renderAuthForm()}
      </div>
    </div>
  );
}

