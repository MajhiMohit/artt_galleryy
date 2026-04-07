import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const AddArtwork = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        artist: "",
        price: "",
        category: "",
        era: "",
        year: "",
        rating: "",
        featured: false
    });

    const [image, setImage] = useState(null); // ✅ ADD THIS

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    // ✅ UPDATED SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // append all fields
        formData.append("title", form.title);
        formData.append("artist", form.artist);
        formData.append("price", Number(form.price));
        formData.append("category", form.category);
        formData.append("era", form.era);
        formData.append("year", Number(form.year));
        formData.append("rating", Number(form.rating));
        formData.append("featured", form.featured);

        formData.append("image", image); // ✅ IMPORTANT

        try {
            await API.post("/artworks", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("Artwork added successfully");
            navigate("/gallery");

        } catch (err) {
            console.error(err);
            alert("Error adding artwork");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Add Artwork</h2>

            <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>

                <input name="title" placeholder="Title" onChange={handleChange} required /><br /><br />
                <input name="artist" placeholder="Artist" onChange={handleChange} required /><br /><br />
                <input name="price" placeholder="Price" onChange={handleChange} required /><br /><br />
                <input name="category" placeholder="Category" onChange={handleChange} /><br /><br />
                <input name="era" placeholder="Era" onChange={handleChange} /><br /><br />
                <input name="year" placeholder="Year" onChange={handleChange} /><br /><br />
                <input name="rating" placeholder="Rating" onChange={handleChange} /><br /><br />

                {/* ✅ IMAGE INPUT */}
                <input 
                    type="file" 
                    onChange={(e) => setImage(e.target.files[0])} 
                    required 
                /><br /><br />

                <label>
                    Featured:
                    <input type="checkbox" name="featured" onChange={handleChange} />
                </label><br /><br />

                <button type="submit">Add Artwork</button>
            </form>
        </div>
    );
};

export default AddArtwork;