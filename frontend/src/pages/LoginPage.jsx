import { useState } from 'react'
import { Boxes } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter both email and password'); return }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // AuthContext calls window.location.href on success via App redirect
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Boxes size={26} />
          </div>
          <div>
            <div className="login-logo-text">StockFlow</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Inventory OS</div>
          </div>
        </div>
        <p className="login-subtitle">Sign in to manage your inventory & orders</p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email address"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@stockflow.com"
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="login-form-actions">
            <Button
              type="submit"
              variant="primary"
              className="login-submit"
              loading={loading}
            >
              Sign in
            </Button>
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
          Demo: admin@stockflow.com / admin1234
        </p>
      </div>
    </div>
  )
}
