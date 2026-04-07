import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import API from "../services/api";
import ArtworkCard from "../components/ArtworkCard";
import { ARTWORKS } from "../data/mockData";

const FALLBACK_IMAGE = "/artworks/art_mind_mosaic.png";

// ✅ Normalize image URLs (VERY IMPORTANT for Vercel issue)
const normalizeArtwork = (artwork) => {
  const directImage = artwork?.image;
  const rawImage =
    (typeof directImage === "string" ? directImage : "") ||
    artwork?.imageUrl ||
    artwork?.image_url ||
    artwork?.thumbnail ||
    artwork?.thumbnailUrl ||
    artwork?.secureUrl ||
    artwork?.secure_url ||
    artwork?.cloudinaryUrl ||
    artwork?.cloudinary?.url ||
    artwork?.cloudinary?.secure_url ||
    artwork?.image?.url ||
    artwork?.image?.secure_url ||
    artwork?.image?.secureUrl ||
    "";

  let normalizedImage = FALLBACK_IMAGE;

  if (rawImage) {
    if (/^(https?:|data:|blob:)/i.test(rawImage) || rawImage.startsWith("/")) {
      normalizedImage = rawImage;
    } else if (rawImage.startsWith("artworks/")) {
      normalizedImage = `/${rawImage}`;
    } else {
      normalizedImage = `/artworks/${rawImage}`;
    }
  }

  return {
    ...artwork,
    image: normalizedImage,
  };
};

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [era, setEra] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    API.get("/artworks")
      .then((res) => {
        const apiArtworks = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const source = apiArtworks.length > 0 ? apiArtworks : ARTWORKS;
        setArtworks(source.map(normalizeArtwork));
      })
      .catch((err) => {
        console.error(err);
        setArtworks(ARTWORKS.map(normalizeArtwork));
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Dynamic filters
  const CATEGORIES = ["All", ...new Set(artworks.map((a) => a.category).filter(Boolean))];
  const ERAS = ["All", ...new Set(artworks.map((a) => a.era).filter(Boolean))];

  // ✅ Filter logic
  const filtered = useMemo(() => {
    return artworks
      .filter((a) => {
        const matchesSearch =
          a.title?.toLowerCase().includes(search.toLowerCase()) ||
          a.artist?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = category === "All" || a.category === category;
        const matchesEra = era === "All" || a.era === era;

        return matchesSearch && matchesCategory && matchesEra;
      })
      .sort((a, b) => {
        if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "newest") return (b.year || 0) - (a.year || 0);
        return 0;
      });
  }, [artworks, search, category, era, sortBy]);

  const hasActiveFilters = search.trim() || category !== "All" || era !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setEra("All");
    setSortBy("featured");
  };

  if (loading) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: "70vh" }}>
        <div className="text-center">
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p className="text-secondary">Loading artworks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2.75rem", paddingBottom: "4rem" }}>
        <motion.div className="text-center mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-eyebrow">Explore Collection</p>
          <h1 className="section-title">Gallery</h1>
          <div className="gold-divider" />
        </motion.div>

        <div className="gallery-controls">
          <div className="search-wrapper">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              className="input-field search-input"
              placeholder="Search artworks or artists"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="gallery-control-right">
            <select
              className="input-field sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort artworks"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="filter-panel glass-card">
          <div className="filter-grid">
            <div>
              <p className="input-label">Category</p>
              <div className="filter-chips">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`filter-chip ${category === c ? "active" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="input-label">Era</p>
              <div className="filter-chips">
                {ERAS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`filter-chip ${era === e ? "active" : ""}`}
                    onClick={() => setEra(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="input-label">Quick Actions</p>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                style={{ opacity: hasActiveFilters ? 1 : 0.55 }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div className="gallery-results-bar">
          <p className="text-muted text-sm">
            Showing {filtered.length} artwork{filtered.length !== 1 ? "s" : ""}
          </p>
          {hasActiveFilters && <span className="badge badge-gold">Filters Applied</span>}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No artworks found</h3>
            <p>Try adjusting search or filters to see more results.</p>
            <button type="button" className="btn btn-outline mt-3" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="gallery-grid">
            {filtered.map((art, i) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ArtworkCard artwork={art} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;