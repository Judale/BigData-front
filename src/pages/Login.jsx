import React, { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import api from "../api/axios";
import styles from "../styles/LoginRegister.module.css";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/login", form);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user_id", res.data.user_id);
            navigate("/profile");
        } catch (err) {
            setError("Identifiants invalides");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Connexion</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    name="username"
                    placeholder="Nom d'utilisateur"
                    value={form.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Se connecter</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            <p className={styles.link}>Pas encore de compte ? <Link to="/register">Inscris-toi</Link></p>
        </div>
    );
}
