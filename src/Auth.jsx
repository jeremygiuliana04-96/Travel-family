import { useState } from 'react'
import { supabase } from './supabase.js'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function signIn() {
    if (!email || !password) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Email ou mot de passe incorrect.')
    }

    setLoading(false)
  }

  async function signUp() {
    if (!email || !password) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Compte créé. Vérifie tes emails pour confirmer ton adresse.')
    }

    setLoading(false)
  }

  return (
    <main className="auth-page">
      <div className="auth-plane">✈️</div>
      <div className="auth-trail"></div>

      <div className="auth-palm auth-palm-right">🌴</div>
      <div className="auth-palm auth-palm-left">🌴</div>

      <section className="auth-hero">
        <div className="auth-logo">🌴</div>
        <h1>Travel Family</h1>
        <p>Vos vacances. Vos documents. Votre tranquillité.</p>
      </section>

      <section className="auth-card">
        <h2>Connexion</h2>
        <p>Bienvenue parmi nous 👋</p>

        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && <p className="auth-message">{message}</p>}

        <button onClick={signIn} disabled={loading}>
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>

        <div className="auth-separator">
          <span></span>
          <p>ou</p>
          <span></span>
        </div>

        <button className="secondary-auth-button" onClick={signUp} disabled={loading}>
          Créer un compte
        </button>
      </section>

      <section className="auth-features">
        <div>🧳 Valises</div>
        <div>💰 Budget</div>
        <div>📁 Documents</div>
        <div>🗺️ Lieux</div>
        <div>🌤️ Météo</div>
        <div>🤖 Assistant</div>
      </section>

      <p className="auth-footer">
        Prêt pour l’aventure ? ✈️🌴
      </p>
    </main>
  )
}

export default Auth