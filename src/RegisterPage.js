import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      alert("Password dan konfirmasi password harus sama!");
      return;
    }

    try {
      const res = await axios.post("https://8dba-2404-c0-4670-00-140d-2ee5.ngrok-free.app/api/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      });

      if (res.status === 201) {
        alert("Registrasi berhasil, silakan login.");
        navigate("/login");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat registrasi.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Konfirmasi Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        <p>
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </p>
      </form>

      <style>{authStyle}</style>
    </div>
  );
}
const authStyle = `
/* Reset box-sizing agar padding dan border tidak bikin lebar bertambah */
*, *::before, *::after {
  box-sizing: border-box;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-form {
  background: #fff;
  padding: 3rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow-wrap: break-word; /* amankan jika ada teks panjang */
}

.auth-form:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.auth-form h2 {
  margin-bottom: 2rem;
  color: #4a4a4a;
  font-weight: 700;
  font-size: 2.25rem;
  letter-spacing: 1.2px;
}

.auth-form input {
  width: 100%;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  box-sizing: border-box;
}

.auth-form input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 8px rgba(102,126,234,0.5);
}

.auth-form button {
  width: 100%;
  padding: 0.95rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.15rem;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(102,126,234,0.5);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
}

.auth-form button:hover {
  background-color: #5563c1;
  box-shadow: 0 8px 16px rgba(85,99,193,0.6);
}

.auth-form p {
  margin-top: 1.5rem;
  font-size: 1rem;
  color: #666;
  word-wrap: break-word;
}

.auth-form a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-form a:hover {
  color: #5563c1;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-form {
    padding: 2rem 1.5rem;
    border-radius: 12px;
    max-width: 100%;
  }

  .auth-form h2 {
    font-size: 1.75rem;
    margin-bottom: 1.25rem;
  }

  .auth-form input {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }

  .auth-form button {
    font-size: 1rem;
    padding: 0.85rem;
  }
}


/* Responsive */
@media (max-width: 480px) {
  .auth-form {
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }

  .auth-form h2 {
    font-size: 1.75rem;
    margin-bottom: 1.25rem;
  }

  .auth-form input {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }

  .auth-form button {
    font-size: 1rem;
    padding: 0.85rem;
  }
}

`;
export default Register;
