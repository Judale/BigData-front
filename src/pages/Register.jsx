import React, { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import api from "../api/axios";
import styles from "../styles/LoginRegister.module.css";

export default function Register() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/register", form);
            navigate("/login");
        } catch (err) {
            setError("Nom d'utilisateur déjà pris");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Inscription</h2>
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
                <button type="submit">Créer un compte</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            <p className={styles.link}>Déjà un compte ? <Link to="/login">Connecte-toi</Link></p>
        </div>
    );
}