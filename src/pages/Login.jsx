import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Palette, Mail, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ── CAPTCHA helper ─────────────────────────────────────── */
const OPS = ["+", "-", "×"];

function generateCaptcha() {
    const op = OPS[Math.floor(Math.random() * OPS.length)];
    let a, b, answer;
    if (op === "+") {
        a = Math.floor(Math.random() * 15) + 1;
        b = Math.floor(Math.random() * 15) + 1;
        answer = a + b;
    } else if (op === "-") {
        a = Math.floor(Math.random() * 15) + 6;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        answer = a - b;
    } else {
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 9) + 2;
        answer = a * b;
    }
    return { question: `${a} ${op} ${b}`, answer };
}

/* ── Component ──────────────────────────────────────────── */
const Login = () => {
    const navigate  = useNavigate();
    const { login } = useAuth();

    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [showPw,   setShowPw]   = useState(false);
    const [error,    setError]    = useState("");
    const [loading,  setLoading]  = useState(false);

    /* CAPTCHA */
    const [captcha,      setCaptcha]      = useState(() => generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaOk,    setCaptchaOk]    = useState(false);
    const [captchaErr,   setCaptchaErr]   = useState(false);

    const refreshCaptcha = useCallback(() => {
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
        setCaptchaOk(false);
        setCaptchaErr(false);
    }, []);

    /* Live validation as user types */
    useEffect(() => {
        const val = parseInt(captchaInput, 10);
        if (captchaInput === "") { setCaptchaOk(false); setCaptchaErr(false); return; }
        if (!isNaN(val) && val === captcha.answer) { setCaptchaOk(true);  setCaptchaErr(false); }
        else                                        { setCaptchaOk(false); setCaptchaErr(captchaInput.length >= String(captcha.answer).length); }
    }, [captchaInput, captcha.answer]);

    const ROLE_MAP = { admin: "/admin", artist: "/artist", curator: "/curator", visitor: "/visitor" };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!captchaOk) {
            setError("Please solve the CAPTCHA correctly before signing in.");
            setCaptchaErr(true);
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate(ROLE_MAP[result.role] || "/");
        } else {
            setError(result.message || "Invalid credentials");
            refreshCaptcha();
        }
    };

    return (
        <div className="auth-page page-wrapper">
            <div className="auth-bg">
                <img
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80"
                    alt=""
                    className="auth-bg-img"
                />
                <div className="auth-bg-overlay" />
            </div>

            <div className="container auth-container">
                <motion.div
                    className="auth-card glass-card"
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="auth-header">
                        <Link to="/" className="navbar-logo" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
                            <Palette size={22} />
                            <span className="logo-text">Art<span className="italic">Gallery</span></span>
                        </Link>
                        <h2 className="auth-title">Welcome Back</h2>
                        <p className="auth-subtitle">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="alert alert-error">{error}</div>}

                        {/* Email */}
                        <div className="form-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-icon-wrapper">
                                <Mail size={16} className="input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field input-with-icon"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="input-label">Password</label>
                            <div className="input-icon-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field input-with-icon input-with-toggle"
                                    required
                                />
                                <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* ── CAPTCHA ───────────────────────────────── */}
                        <div className="form-group">
                            <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <ShieldCheck size={13} />
                                Security Check
                            </label>

                            <div className="captcha-box">
                                {/* Question tile */}
                                <div className="captcha-question">
                                    <span className="captcha-expr">{captcha.question} = ?</span>
                                </div>

                                {/* Answer input */}
                                <div className="captcha-answer-wrap">
                                    <input
                                        type="number"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        placeholder="Answer"
                                        className={`input-field captcha-input ${captchaOk ? "captcha-ok" : ""} ${captchaErr ? "captcha-err" : ""}`}
                                        autoComplete="off"
                                        required
                                    />
                                    <AnimatePresence>
                                        {captchaOk && (
                                            <motion.span
                                                className="captcha-tick"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                            >✓</motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Refresh */}
                                <motion.button
                                    type="button"
                                    className="captcha-refresh"
                                    onClick={refreshCaptcha}
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.35 }}
                                    title="New question"
                                >
                                    <RefreshCw size={15} />
                                </motion.button>
                            </div>

                            {captchaErr && !captchaOk && (
                                <p className="captcha-hint">Incorrect — try again or refresh</p>
                            )}
                        </div>
                        {/* ────────────────────────────────────────── */}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <span className="btn-spinner" />
                                    Signing in…
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-gold">Create one</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;