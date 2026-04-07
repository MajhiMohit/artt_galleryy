import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const EditArtwork = () => {
    const { id } = useParams();
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

    useEffect(() => {
        fetchArtwork();
    }, []);

    const fetchArtwork = async () => {
        try {
            const res = await API.get(`/artworks/${id}`);
            setForm(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await API.put(`/artworks/${id}`, form);
            alert("Updated successfully");
            navigate("/gallery");
        } catch (err) {
            console.error(err);
            alert("Update failed");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Edit Artwork</h2>

            <form onSubmit={handleSubmit}>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Title" /><br /><br />
                <input name="artist" value={form.artist} onChange={handleChange} placeholder="Artist" /><br /><br />
                <input name="price" value={form.price} onChange={handleChange} placeholder="Price" /><br /><br />

                <button type="submit">Update</button>
            </form>
        </div>
    );
};

export default EditArtwork;