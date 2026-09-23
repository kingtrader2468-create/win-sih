import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
  Mail,
  User as UserIcon,
  Globe2,
  Compass,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './AuthPage.css';

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    loginWithGoogle,
    sendRegisterOtp,
    submitRegisterOtp,
    sendForgotOtp,
    submitResetPassword,
    isAuthenticated
  } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [registerStep, setRegisterStep] = useState(1); // 1 = Details, 2 = OTP
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP & New Password

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [institution, setInstitution] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Messages & status
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Parse redirect query param if any
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              setError('');
              try {
                await loginWithGoogle(response.credential);
                navigate(redirectPath, { replace: true });
              } catch (err) {
                setError(err.message || 'Google authentication failed.');
              } finally {
                setLoading(false);
              }
            }
          }
        });

        const btnContainer = document.getElementById('googleSignInContainer');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with'
          });
        }
      } catch (e) {
        console.warn('Google Identity Service Warning:', e);
      }
    }
  }, [loginWithGoogle, navigate, redirectPath]);

  // Standard Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In (Single unified handler)
  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (window.google?.accounts?.id && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.prompt();
      } else {
        // Authenticate with Backend API /api/auth/google
        const profile = {
          email: email.trim() || 'scholar.fellow@ncpor.gov.in',
          name: name.trim() || 'Dr. Ananya Sharma',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          sub: `google-oauth-${Date.now()}`
        };
        await loginWithGoogle(null, profile);
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP for Registration
  const handleRequestRegisterOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDevOtpHint('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both passwords.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendRegisterOtp({
        name,
        email,
        password,
        confirmPassword,
        role,
        institution
      });
      setSuccessMsg(res.message || 'Verification code sent to your email.');
      if (res.devOtp) {
        setDevOtpHint(`Development Preview OTP: ${res.devOtp}`);
      }
      setRegisterStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await submitRegisterOtp({ email, otp });
      setSuccessMsg('Account verified and created successfully! Redirecting...');
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request Forgot Password OTP
  const handleRequestForgotOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDevOtpHint('');
    setLoading(true);

    try {
      const res = await sendForgotOtp(email);
      setSuccessMsg(res.message || 'Password reset OTP sent to your email.');
      if (res.devOtp) {
        setDevOtpHint(`Development Preview OTP: ${res.devOtp}`);
      }
      setForgotStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Failed to send password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitResetPassword({
        email,
        otp,
        newPassword,
        confirmPassword: confirmNewPassword
      });
      setSuccessMsg(res.message || 'Password has been reset successfully! Please sign in.');
      setActiveTab('login');
      setForgotStep(1);
      setOtp('');
      setPassword(newPassword);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8">
      <div className="auth-container max-w-[1120px] w-full">
        {/* Left Side: Institutional Trust & Public Access Charter */}
        <div className="auth-sidebar">
          <div>
            <div className="auth-sidebar__header mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm font-bold tracking-wider uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                MoES / NCPOR · Sovereign Portal
              </span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mb-1">
                Polar India Hub
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Gateway to Antarctic, Arctic, and Himalayan Cryospheric Sciences
              </p>
            </div>

            <div className="auth-charter-box p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/80 mb-6 flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-primary-container/20 text-primary shrink-0 mt-0.5">
                <Globe2 size={20} />
              </div>
              <div>
                <h3 className="font-title-md text-label-md font-bold text-on-surface mb-1">
                  Public Data Guarantee
                </h3>
                <p className="font-body-sm text-label-sm text-on-surface-variant leading-relaxed">
                  All polar stations telemetry, 1,400+ research papers, and NetCDF-4 observational datasets are <strong>100% open to the public without login</strong>.
                </p>
              </div>
            </div>

            <div className="auth-benefits flex flex-col gap-3">
              <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Why Register a Scholar ID?
              </h4>

              <div className="benefit-item flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition-colors">
                <Compass size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="font-title-md text-body-sm font-semibold text-on-surface block">
                    Investigate Polar Mysteries
                  </strong>
                  <p className="font-body-sm text-label-sm text-on-surface-variant">
                    Submit deductive evidence answers and decode cryospheric science puzzles.
                  </p>
                </div>
              </div>

              <div className="benefit-item flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition-colors">
                <Sparkles size={18} className="text-tertiary shrink-0 mt-0.5" />
                <div>
                  <strong className="font-title-md text-body-sm font-semibold text-on-surface block">
                    Earn Cryospheric Merit XP
                  </strong>
                  <p className="font-body-sm text-label-sm text-on-surface-variant">
                    Accumulate verifiable research experience and unlock scientific achievements.
                  </p>
                </div>
              </div>

              <div className="benefit-item flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition-colors">
                <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="font-title-md text-body-sm font-semibold text-on-surface block">
                    Nodemailer-Verified Identity
                  </strong>
                  <p className="font-body-sm text-label-sm text-on-surface-variant">
                    Secure single-use OTP authentication protects your research credentials.
                  </p>
                </div>
              </div>

              <div className="benefit-item flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition-colors">
                <GraduationCap size={18} className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="font-title-md text-body-sm font-semibold text-on-surface block">
                    Track Polar Learning
                  </strong>
                  <p className="font-body-sm text-label-sm text-on-surface-variant">
                    Resume research workflows and progress milestones seamlessly across devices.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-sidebar__footer pt-6 mt-6 border-t border-surface-container-high/60">
            <p className="font-label-sm text-label-sm text-outline m-0">
              Governed by National Centre for Polar and Ocean Research, Goa · Ministry of Earth Sciences
            </p>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="auth-form-card">
          <div>
            <div className="auth-card-header mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">
                {activeTab === 'forgot'
                  ? 'Reset Scholar Password'
                  : activeTab === 'register'
                  ? 'Register MoES Scholar ID'
                  : 'Scholar Access Portal'}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {activeTab === 'forgot'
                  ? 'Verify with a 6-digit OTP sent to your institutional email'
                  : activeTab === 'register'
                  ? 'Create your sovereign research credentials with OTP email validation'
                  : 'Sign in with your MoES Scholar ID or Google Account'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 text-error flex items-center gap-2 mb-4 font-body-sm text-body-sm" role="alert">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-tertiary-fixed/40 border border-tertiary/20 text-on-tertiary-fixed flex items-center gap-2 mb-4 font-body-sm text-body-sm" role="status">
                <CheckCircle2 size={18} className="shrink-0 text-tertiary" />
                <span>{successMsg}</span>
              </div>
            )}

            {devOtpHint && (
              <div className="p-3 rounded-lg bg-primary-container/20 border border-primary/30 text-primary flex items-center gap-2 mb-4 font-label-sm text-label-sm font-semibold">
                <KeyRound size={16} className="shrink-0" />
                <span>{devOtpHint}</span>
              </div>
            )}

            {/* Google Sign-In (Only unified Sign In with Google) */}
            {activeTab !== 'forgot' && (
              <div className="google-oauth-section mb-6">
                <div id="googleSignInContainer" className="mb-2" />
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-lg bg-surface-container-lowest border border-surface-container-high hover:bg-surface-container-low text-on-surface font-title-md text-body-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="google-icon shrink-0" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}

            {/* Separator */}
            {activeTab !== 'forgot' && (
              <div className="flex items-center my-6 text-outline font-label-sm text-[11px] uppercase tracking-wider">
                <div className="flex-1 border-t border-surface-container-high" />
                <span className="px-3 bg-surface-container-lowest">Or continue with credentials</span>
                <div className="flex-1 border-t border-surface-container-high" />
              </div>
            )}

            {/* Form Tabs */}
            {activeTab !== 'forgot' ? (
              <div className="flex rounded-lg bg-surface-container-low p-1 mb-6" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'login'}
                  className={`flex-1 py-2 text-center rounded-md font-title-md text-body-sm font-semibold transition-all ${
                    activeTab === 'login'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                    setSuccessMsg('');
                    setDevOtpHint('');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'register'}
                  className={`flex-1 py-2 text-center rounded-md font-title-md text-body-sm font-semibold transition-all ${
                    activeTab === 'register'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => {
                    setActiveTab('register');
                    setRegisterStep(1);
                    setError('');
                    setSuccessMsg('');
                    setDevOtpHint('');
                  }}
                >
                  Register (OTP)
                </button>
              </div>
            ) : (
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setForgotStep(1);
                    setError('');
                    setSuccessMsg('');
                    setDevOtpHint('');
                  }}
                  className="inline-flex items-center gap-1.5 text-primary text-body-sm font-semibold hover:underline"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </button>
                <span className="font-label-sm text-outline">
                  Step {forgotStep} of 2
                </span>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="login-email" className="font-label-md text-label-md text-on-surface font-semibold">
                    Institutional Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-3 text-outline" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      placeholder="scholar@ncpor.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="font-label-md text-label-md text-on-surface font-semibold">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot');
                        setForgotStep(1);
                        setError('');
                        setSuccessMsg('');
                        setDevOtpHint('');
                      }}
                      className="font-label-sm text-label-sm text-primary hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3 text-outline" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-2.5 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{loading ? 'Authenticating…' : 'Sign In to Scholar Portal'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* 2. REGISTRATION FLOW (OTP VALIDATION) */}
            {activeTab === 'register' && (
              <>
                {registerStep === 1 ? (
                  /* Register Step 1: Details */
                  <form onSubmit={handleRequestRegisterOtp} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-name" className="font-label-md text-label-md text-on-surface font-semibold">
                        Full Name &amp; Title
                      </label>
                      <div className="relative flex items-center">
                        <UserIcon size={16} className="absolute left-3 text-outline" />
                        <input
                          id="reg-name"
                          type="text"
                          required
                          placeholder="e.g. Dr. Rajesh Verma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-email" className="font-label-md text-label-md text-on-surface font-semibold">
                        Institutional Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail size={16} className="absolute left-3 text-outline" />
                        <input
                          id="reg-email"
                          type="email"
                          required
                          placeholder="e.g. verma@university.ac.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="reg-role" className="font-label-md text-label-md text-on-surface font-semibold">
                          Research Role
                        </label>
                        <select
                          id="reg-role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                        >
                          <option value="student">University Student / PG</option>
                          <option value="educator">Educator (NCERT XI–XII)</option>
                          <option value="researcher">Cryospheric Scientist</option>
                          <option value="administrator">Scientific Administrator</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="reg-inst" className="font-label-md text-label-md text-on-surface font-semibold">
                          Affiliation / Institution
                        </label>
                        <input
                          id="reg-inst"
                          type="text"
                          placeholder="e.g. Gossner College / IIT"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-password" className="font-label-md text-label-md text-on-surface font-semibold">
                        Create Secure Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock size={16} className="absolute left-3 text-outline" />
                        <input
                          id="reg-password"
                          type="password"
                          required
                          minLength={6}
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-confirm-password" className="font-label-md text-label-md text-on-surface font-semibold">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock size={16} className="absolute left-3 text-outline" />
                        <input
                          id="reg-confirm-password"
                          type="password"
                          required
                          minLength={6}
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 bg-surface-container-lowest border rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 ${
                            confirmPassword && password !== confirmPassword
                              ? 'border-error focus:ring-error'
                              : 'border-surface-container-high focus:ring-primary-container'
                          }`}
                        />
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <span className="font-label-sm text-[11px] text-error">Passwords do not match</span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full py-2.5 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>{loading ? 'Sending Code via Nodemailer…' : 'Send Verification OTP'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  /* Register Step 2: OTP Validation */
                  <form onSubmit={handleVerifyRegisterOtp} className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                      <span className="font-label-sm uppercase tracking-wider text-outline block mb-1">
                        Verification Code Sent
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface m-0">
                        We sent a 6-digit sovereign authentication code to <strong>{email}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-otp" className="font-label-md text-label-md text-on-surface font-semibold">
                        Enter 6-Digit OTP Code
                      </label>
                      <div className="relative flex items-center">
                        <KeyRound size={16} className="absolute left-3 text-outline" />
                        <input
                          id="reg-otp"
                          type="text"
                          required
                          maxLength={6}
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-body-sm">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-sm"
                      >
                        <ArrowLeft size={14} />
                        <span>Edit Details</span>
                      </button>

                      <button
                        type="button"
                        disabled={countdown > 0 || loading}
                        onClick={handleRequestRegisterOtp}
                        className={`font-label-sm flex items-center gap-1 ${
                          countdown > 0
                            ? 'text-outline cursor-not-allowed'
                            : 'text-primary hover:underline'
                        }`}
                      >
                        <RotateCcw size={14} />
                        <span>{countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="mt-2 w-full py-2.5 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <span>{loading ? 'Verifying Code…' : 'Verify & Complete Registration'}</span>
                      <CheckCircle2 size={16} />
                    </button>
                  </form>
                )}
              </>
            )}

            {/* 3. FORGOT PASSWORD FLOW (OTP VALIDATION) */}
            {activeTab === 'forgot' && (
              <>
                {forgotStep === 1 ? (
                  /* Forgot Step 1: Email */
                  <form onSubmit={handleRequestForgotOtp} className="flex flex-col gap-4">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Enter the institutional email associated with your Scholar ID. We will dispatch a 6-digit single-use OTP via Nodemailer to verify your identity.
                    </p>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="forgot-email" className="font-label-md text-label-md text-on-surface font-semibold">
                        Registered Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail size={16} className="absolute left-3 text-outline" />
                        <input
                          id="forgot-email"
                          type="email"
                          required
                          placeholder="scholar@ncpor.gov.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full py-2.5 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>{loading ? 'Sending Reset Code…' : 'Send Password Reset Code'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  /* Forgot Step 2: OTP & New Password */
                  <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                      <span className="font-label-sm uppercase tracking-wider text-outline block mb-1">
                        Reset Code Dispatched
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface m-0">
                        We sent a 6-digit reset code to <strong>{email}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="forgot-otp" className="font-label-md text-label-md text-on-surface font-semibold">
                        Enter 6-Digit OTP Code
                      </label>
                      <div className="relative flex items-center">
                        <KeyRound size={16} className="absolute left-3 text-outline" />
                        <input
                          id="forgot-otp"
                          type="text"
                          required
                          maxLength={6}
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="forgot-new-pass" className="font-label-md text-label-md text-on-surface font-semibold">
                        New Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock size={16} className="absolute left-3 text-outline" />
                        <input
                          id="forgot-new-pass"
                          type="password"
                          required
                          minLength={6}
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="forgot-confirm-new-pass" className="font-label-md text-label-md text-on-surface font-semibold">
                        Confirm New Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock size={16} className="absolute left-3 text-outline" />
                        <input
                          id="forgot-confirm-new-pass"
                          type="password"
                          required
                          minLength={6}
                          placeholder="Re-enter your new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 bg-surface-container-lowest border rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 ${
                            confirmNewPassword && newPassword !== confirmNewPassword
                              ? 'border-error focus:ring-error'
                              : 'border-surface-container-high focus:ring-primary-container'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-body-sm">
                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
                        className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-sm"
                      >
                        <ArrowLeft size={14} />
                        <span>Change Email</span>
                      </button>

                      <button
                        type="button"
                        disabled={countdown > 0 || loading}
                        onClick={handleRequestForgotOtp}
                        className={`font-label-sm flex items-center gap-1 ${
                          countdown > 0
                            ? 'text-outline cursor-not-allowed'
                            : 'text-primary hover:underline'
                        }`}
                      >
                        <RotateCcw size={14} />
                        <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="mt-2 w-full py-2.5 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <span>{loading ? 'Resetting Password…' : 'Save New Password & Sign In'}</span>
                      <CheckCircle2 size={16} />
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-surface-container-high text-center">
            <Link
              to="/research"
              className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <span>← Return to Public Research Explorer without signing in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
