import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye, Star, Tag, Trash2, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api"; // ✅ added

const FALLBACK_IMAGE = "/artworks/art_mind_mosaic.png";

const ArtworkCard = ({ artwork, compact = false }) => {
    const { isAuthenticated, toggleWishlist, isWishlisted } = useAuth();
    const wishlisted = isWishlisted(artwork.id);
    const navigate = useNavigate();

    const handleWishlist = (e) => {
        e.preventDefault();
        if (isAuthenticated) toggleWishlist(artwork.id);
    };

    // ✅ DELETE FUNCTION
    const handleDelete = async (e) => {
        e.preventDefault(); // prevent navigation

        if (!window.confirm("Are you sure you want to delete this artwork?")) return;

        try {
            await API.delete(`/artworks/${artwork.id}`);
            alert("Deleted successfully");
            window.location.reload(); // simple refresh
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    // ✅ EDIT FUNCTION
    const handleEdit = (e) => {
        e.preventDefault();
        navigate(`/edit-artwork/${artwork.id}`);
    };

    return (
        <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="artwork-card"
        >
            <Link to={`/artwork/${artwork.id}`} state={{ artwork }} style={{ display: "block" }}>

                {/* IMAGE */}
                <div className="artwork-image-wrapper">
                    <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="artwork-image"
                        onError={(e) => {
                            if (e.currentTarget.src !== window.location.origin + FALLBACK_IMAGE) {
                                e.currentTarget.src = FALLBACK_IMAGE;
                            }
                        }}
                    />

                    {/* OVERLAY */}
                    <div className="artwork-overlay">
                        <div className="artwork-overlay-actions">
                            <button className="overlay-action-btn">
                                <Eye size={16} /> View
                            </button>
                        </div>
                    </div>

                    {/* BADGES */}
                    <div className="artwork-badges">
                        {artwork.featured && <span className="badge badge-gold">Featured</span>}
                        {artwork.sold && <span className="badge badge-red">Sold</span>}
                    </div>

                    {/* ❤️ WISHLIST */}
                    <button
                        className={`wishlist-btn ${wishlisted ? "active" : ""}`}
                        onClick={handleWishlist}
                    >
                        <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="artwork-content">
                    <div className="artwork-meta">
                        <span>{artwork.category}</span>
                        <span>{artwork.era}</span>
                    </div>

                    <h3>{artwork.title}</h3>

                    {!compact && <p>by {artwork.artist}</p>}

                    <div className="artwork-footer">
                        <div>
                            <Star size={12} />
                            {artwork.rating}
                        </div>

                        <div>
                            {artwork.sold ? "Sold" : `₹${artwork.price}`}
                        </div>
                    </div>

                    {/* ✅ ACTION BUTTONS */}
                    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                        <button onClick={handleEdit} style={{ color: "blue" }}>
                            <Pencil size={14} /> Edit
                        </button>

                        <button onClick={handleDelete} style={{ color: "red" }}>
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>

            </Link>
        </motion.div>
    );
};

export default ArtworkCard;