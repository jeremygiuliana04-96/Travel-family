import { useState } from 'react'
import { supabase } from './supabase'

function Auth() {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('lastLoginEmail') || ''
  })

  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true'
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function saveLoginPreferences() {
    if (rememberMe) {
      localStorage.setItem('lastLoginEmail', email)
      localStorage.setItem('rememberMe', 'true')
    } else {
      localStorage.removeItem('lastLoginEmail')
      localStorage.setItem('rememberMe', 'false')
    }
  }

  async function signUp() {
    setLoading(true)
    setMessage('')

    saveLoginPreferences()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Compte créé ✅ Vérifie tes emails pour confirmer ton compte.')
    }

    setLoading(false)
  }

  async function signIn() {
    setLoading(true)
    setMessage('')

    saveLoginPreferences()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <main className="app">
      <section className="hero-card">
        <h1>🌴 Travel Family</h1>
        <p>Connecte-toi pour accéder à tes voyages</p>
      </section>

      <section className="card">
        <h2><span className="section-badge">🔐</span>Connexion</h2>

        <label className="field">
          Email
          <input
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          Mot de passe
          <input
            type="password"
            placeholder="Minimum 6 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="remember-row">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Se souvenir de moi</span>
        </label>

        {message && <p>{message}</p>}

        <div className="auth-buttons">
          <button onClick={signIn} disabled={loading}>
            Se connecter
          </button>

          <button onClick={signUp} disabled={loading}>
            Créer un compte
          </button>
        </div>
      </section>
    </main>
  )
}

export default Auth