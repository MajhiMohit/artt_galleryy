import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

// ─────────────────────────────────────────────
// Auth Context
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

const normalizeUser = (payload) => {
    const rawUser = payload?.user ?? payload ?? {};
    const normalizedRole = String(rawUser.role || "visitor").toLowerCase();
    const role = normalizedRole === "user" ? "visitor" : normalizedRole;
    const name =
        rawUser.name ||
        rawUser.fullName ||
        rawUser.username ||
        (rawUser.email ? String(rawUser.email).split("@")[0] : "User");

    return {
        ...rawUser,
        name,
        role,
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [purchases, setPurchases] = useState([]);

    // Persist session across page refreshes
    useEffect(() => {
        const storedUser = localStorage.getItem("gallery_user") || localStorage.getItem("user");
        const storedWishlist = localStorage.getItem("gallery_wishlist");
        const storedPurchases = localStorage.getItem("gallery_purchases");

        if (storedUser) {
            try {
                const parsed = normalizeUser(JSON.parse(storedUser));
                setUser(parsed);
                localStorage.setItem("gallery_user", JSON.stringify(parsed));
                localStorage.removeItem("user");
            } catch {
                localStorage.removeItem("gallery_user");
                localStorage.removeItem("user");
            }
        }
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
        if (storedPurchases) setPurchases(JSON.parse(storedPurchases));
        setLoading(false);
    }, []);

    // Login using backend API
    const login = async (email, password) => {
        try {
            const res = await API.post("/users/login", { email, password });
            if (!res?.data) {
                return { success: false, message: "Invalid email or password." };
            }

            const normalizedUser = normalizeUser(res.data);
            setUser(normalizedUser);
            localStorage.setItem("gallery_user", JSON.stringify(normalizedUser));

            const token = res.data?.token || res.data?.jwt || res.data?.accessToken;
            if (token) {
                localStorage.setItem("gallery_token", token);
            }

            return { success: true, role: normalizedUser.role, user: normalizedUser };
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Login failed. Please check your credentials.";
            return { success: false, message };
        }
    };

    // Logout — clear state and storage
    const logout = () => {
        setUser(null);
        localStorage.removeItem("gallery_user");
        localStorage.removeItem("user");
        localStorage.removeItem("gallery_token");
    };

    // Wishlist helpers
    const toggleWishlist = (artworkId) => {
        setWishlist((prev) => {
            const updated = prev.includes(artworkId)
                ? prev.filter((id) => id !== artworkId)
                : [...prev, artworkId];
            localStorage.setItem("gallery_wishlist", JSON.stringify(updated));
            return updated;
        });
    };

    const isWishlisted = (artworkId) => wishlist.includes(artworkId);

    // Purchase helpers
    const addPurchase = (artwork) => {
        setPurchases((prev) => {
            const updated = [...prev, { ...artwork, purchasedAt: new Date().toISOString() }];
            localStorage.setItem("gallery_purchases", JSON.stringify(updated));
            return updated;
        });
    };

    // Role helpers
    const isAdmin = user?.role === "admin";
    const isArtist = user?.role === "artist";
    const isCurator = user?.role === "curator";
    const isVisitor = user?.role === "visitor";
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                wishlist,
                toggleWishlist,
                isWishlisted,
                purchases,
                addPurchase,
                isAdmin,
                isArtist,
                isCurator,
                isVisitor,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for convenient usage
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

export default AuthContext;
