import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

function Login() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data } = await api.post("/login", { email, password })
      localStorage.setItem("token", data.token)
      localStorage.setItem("isAuth", "true")
      localStorage.setItem("role", data.user.role)
      localStorage.setItem("userName", data.user.name)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)"
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "2.5rem",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          <img
            src="/logo.jpg.jpeg"
            alt="Logo"
            style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
          />
          <h2 style={{ textAlign: "center", color: "#1e3a5f", margin: 0 }}>Connexion</h2>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Mot de passe</label>
            <div className="input-group">
              <input
                type={showPass ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? "�" : "�️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
