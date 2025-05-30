import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleLogin = async () => {
        // request login ke backend
        const response = await fetch("https://8dba-2404-c0-4670-00-140d-2ee5.ngrok-free.app/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.name);
            navigate("/chat");
        } else {
            alert(data.error || "Login failed");
        }
    };


    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Masuk ke CDT.AI</h2>
                <p className="auth-subtitle">Selamat datang kembali!</p>
                {error && <div className="auth-error">{error}</div>}

                <input
                    type="email"
                    placeholder="Email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="auth-button" onClick={handleLogin}>
                    Login
                </button>

                <p className="auth-switch">
                    Belum punya akun?{" "}
                    <span onClick={() => navigate("/register")}>Daftar sekarang</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
