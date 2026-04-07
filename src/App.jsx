import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Styles
import "./App.css";

// Context
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import ArtworkDetails from "./pages/ArtworkDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import CuratorDashboard from "./pages/CuratorDashboard";
import VisitorDashboard from "./pages/VisitorDashboard";
import VirtualTour from "./pages/VirtualTour";
import Wishlist from "./pages/Wishlist";
import Purchases from "./pages/Purchases";
import Exhibitions from "./pages/Exhibitions";
import AddArtwork from "./pages/AddArtwork";
import EditArtwork from "./pages/EditArtwork"; // ✅ added

// Scroll to top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Footer hidden paths
const NO_FOOTER_PATHS = ["/admin", "/artist", "/curator", "/visitor", "/virtual-tour"];

const AppInner = () => {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/artwork/:id" element={<ArtworkDetails />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/virtual-tour" element={<VirtualTour />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED — GENERAL */}
          <Route path="/wishlist" element={
            <ProtectedRoute roles={["visitor", "admin", "artist", "curator"]}>
              <Wishlist />
            </ProtectedRoute>
          } />

          <Route path="/purchases" element={
            <ProtectedRoute roles={["visitor", "admin"]}>
              <Purchases />
            </ProtectedRoute>
          } />

          {/* PROTECTED — ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ADD ARTWORK */}
          <Route path="/add-artwork" element={
            <ProtectedRoute roles={["admin", "artist"]}>
              <AddArtwork />
            </ProtectedRoute>
          } />

          {/* EDIT ARTWORK */}
          <Route path="/edit-artwork/:id" element={
            <ProtectedRoute roles={["admin", "artist"]}>
              <EditArtwork />
            </ProtectedRoute>
          } />

          {/* PROTECTED — ARTIST */}
          <Route path="/artist" element={
            <ProtectedRoute roles={["artist"]}>
              <ArtistDashboard />
            </ProtectedRoute>
          } />

          {/* PROTECTED — CURATOR */}
          <Route path="/curator" element={
            <ProtectedRoute roles={["curator"]}>
              <CuratorDashboard />
            </ProtectedRoute>
          } />

          {/* PROTECTED — VISITOR */}
          <Route path="/visitor" element={
            <ProtectedRoute roles={["visitor", "admin"]}>
              <VisitorDashboard />
            </ProtectedRoute>
          } />

          {/* 404 PAGE */}
          <Route path="*" element={
            <div className="page-wrapper flex-center" style={{ minHeight: "80vh" }}>
              <div className="text-center">
                <h1 style={{ fontSize: "8rem" }}>404</h1>
                <h2>Page Not Found</h2>
                <p>The artwork you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            </div>
          } />

        </Routes>
      </AnimatePresence>

      {showFooter && <Footer />}
    </>
  );
};

// ROOT APP
const App = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("gallery_theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gallery_theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;