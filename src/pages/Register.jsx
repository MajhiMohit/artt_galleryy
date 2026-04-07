import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Palette, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import API from "../services/api";

const ROLES = ["visitor", "artist", "curator", "admin"];
const ROLE_API_MAP = {
    visitor: "VISITOR",
    artist: "ARTIST",
    curator: "CURATOR",
    admin: "ADMIN",
};

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "visitor" });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (field, value, pwRef) => {
        let msg = "";
        if (field === "name" && !value.trim()) msg = "Full name is required.";
        if (field === "email") {
            if (!value.trim()) msg = "Email is required.";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = "Enter a valid email address.";
        }
        if (field === "password") {
            if (!value) msg = "Password is required.";
            else if (value.length < 6) msg = "Password must be at least 6 characters.";
        }
        if (field === "confirm") {
            const pw = pwRef !== undefined ? pwRef : form.password;
            if (!value) msg = "Please confirm your password.";
            else if (value !== pw) msg = "Passwords do not match.";
        }
        setFieldErrors((prev) => ({ ...prev, [field]: msg }));
        return msg;
    };

    const update = (field) => (e) => {
        const val = e.target.value;
        setForm((f) => ({ ...f, [field]: val }));
        setTouched((t) => ({ ...t, [field]: true }));
        validateField(field, val, field === "confirm" ? form.password : undefined);
    };

    const getPasswordStrength = (pw) => {
        if (!pw) return { level: 0, label: "", color: "" };
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 2) return { level: 1, label: "Weak", color: "#ef4444" };
        if (score <= 3) return { level: 2, label: "Fair", color: "#d4af37" };
        return { level: 3, label: "Strong", color: "#4ade80" };
    };
    const pwStrength = getPasswordStrength(form.password);
    const hasFieldError = (f) => touched[f] && fieldErrors[f];


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Mark all fields as touched and validate
        const errs = {
            name: validateField("name", form.name),
            email: validateField("email", form.email),
            password: validateField("password", form.password),
            confirm: validateField("confirm", form.confirm, form.password),
        };
        setTouched({ name: true, email: true, password: true, confirm: true });
        if (Object.values(errs).some(Boolean)) return;

        setLoading(true);

        try {
            await API.post("/users/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                role: ROLE_API_MAP[form.role] || "VISITOR"
            });

            setLoading(false);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);

        } catch (err) {
            console.error(err);
            setLoading(false);
            const message =
                err?.displayMessage ||
                err?.response?.data?.message ||
                err?.response?.data ||
                "Registration failed. Please try again.";
            setError(message);
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
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className="auth-header">
                        <Link to="/" className="navbar-logo" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
                            <Palette size={22} strokeWidth={1.5} />
                            <span className="logo-text">Art<span className="italic">Gallery</span></span>
                        </Link>
                        <h2 className="auth-title">Create Your Account</h2>
                        <p className="auth-subtitle">Join the world's finest virtual gallery</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="alert alert-error">{error}</div>}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    background: "rgba(34,197,94,0.12)",
                                    border: "1.5px solid rgba(34,197,94,0.4)",
                                    borderRadius: "10px",
                                    padding: "1rem 1.25rem",
                                    marginBottom: "1rem",
                                    color: "#4ade80",
                                }}
                            >
                                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>Account created!</p>
                                    <p style={{ fontSize: "0.8rem" }}>Redirecting to sign in…</p>
                                </div>
                            </motion.div>
                        )}

                        <div className="form-group">
                            <label className="input-label">Full Name</label>
                            <div className="input-icon-wrapper">
                                <User size={16} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    value={form.name}
                                    onChange={update("name")}
                                    onBlur={() => { setTouched(t => ({ ...t, name: true })); validateField("name", form.name); }}
                                    className={`input-field input-with-icon ${hasFieldError("name") ? "input-error" : ""}`}
                                />
                            </div>
                            {hasFieldError("name") && <p className="field-error">{fieldErrors.name}</p>}
                        </div>

                        <div className="form-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-icon-wrapper">
                                <Mail size={16} className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={update("email")}
                                    onBlur={() => { setTouched(t => ({ ...t, email: true })); validateField("email", form.email); }}
                                    className={`input-field input-with-icon ${hasFieldError("email") ? "input-error" : ""}`}
                                />
                            </div>
                            {hasFieldError("email") && <p className="field-error">{fieldErrors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label className="input-label">I am a…</label>
                            <div className="role-picker">
                                {ROLES.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        className={`role-pill ${form.role === r ? "active" : ""}`}
                                        onClick={() => setForm((f) => ({ ...f, role: r }))}
                                    >
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="input-label">Password</label>
                            <div className="input-icon-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={form.password}
                                    placeholder="Min. 6 characters"
                                    onChange={update("password")}
                                    onBlur={() => { setTouched(t => ({ ...t, password: true })); validateField("password", form.password); }}
                                    className={`input-field input-with-icon input-with-toggle ${hasFieldError("password") ? "input-error" : ""}`}
                                />
                                <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {hasFieldError("password") && <p className="field-error">{fieldErrors.password}</p>}
                            {form.password && (
                                <div style={{ marginTop: "0.5rem" }}>
                                    <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} style={{
                                                flex: 1, height: "4px", borderRadius: "2px",
                                                background: i <= pwStrength.level ? pwStrength.color : "var(--border)",
                                                transition: "background 0.3s"
                                            }} />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: "0.73rem", color: pwStrength.color }}>{pwStrength.label} password</p>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="input-label">Confirm Password</label>
                            <div className="input-icon-wrapper" style={{ position: "relative" }}>
                                <Lock size={16} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={form.confirm}
                                    onChange={update("confirm")}
                                    onBlur={() => { setTouched(t => ({ ...t, confirm: true })); validateField("confirm", form.confirm, form.password); }}
                                    className={`input-field input-with-icon ${hasFieldError("confirm") ? "input-error" : (touched.confirm && form.confirm && form.confirm === form.password ? "input-success" : "")}`}
                                />
                                {touched.confirm && form.confirm && form.confirm === form.password && (
                                    <CheckCircle2 size={16} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#4ade80", pointerEvents: "none" }} />
                                )}
                            </div>
                            {hasFieldError("confirm") && <p className="field-error">{fieldErrors.confirm}</p>}
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <span className="btn-spinner" />
                                    Creating Account…
                                </span>
                            ) : (
                                <>Create Account <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <Link to="/login" className="text-gold">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;