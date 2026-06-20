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
      options: {
        emailRedirectTo: window.location.origin
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Compte créé. Vérifie tes emails pour confirmer ton adresse.')
    }

    setLoading(false)
  }

  return (
    <main className="auth-page auth-premium-page">
      <div className="auth-soft-plane">✈️</div>
      <div className="auth-soft-cloud auth-soft-cloud-one"></div>
      <div className="auth-soft-cloud auth-soft-cloud-two"></div>

      <section className="auth-premium-hero">
        <div className="auth-premium-logo">✈️</div>
        <h1>Travel Family</h1>
        <p>Organisez vos voyages<br />en toute simplicité</p>
      </section>

      <section className="auth-card auth-premium-card">
        <h2>Bienvenue !</h2>
        <p>Connectez-vous à votre compte</p>

        <label className="auth-input-wrap">
          <span>✉️</span>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="auth-input-wrap">
          <span>🔒</span>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {message && <p className="auth-message">{message}</p>}

        <button className="auth-primary-button" onClick={signIn} disabled={loading}>
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>

        <div className="auth-separator">
          <span></span>
          <p>ou</p>
          <span></span>
        </div>

        <button className="secondary-auth-button auth-create-button" onClick={signUp} disabled={loading}>
          👤+ Créer un compte
        </button>
      </section>

      <section className="auth-features auth-premium-features">
        <div><span>🧳</span><strong>Valises</strong></div>
        <div><span>💰</span><strong>Budget</strong></div>
        <div><span>📁</span><strong>Documents</strong></div>
        <div><span>📅</span><strong>Planning</strong></div>
        <div><span>🖼️</span><strong>Galerie</strong></div>
        <div><span>🤖</span><strong>Assistant</strong></div>
      </section>

      <p className="auth-footer auth-premium-footer">
        Prêt pour l’aventure ? 💙<br />
        <span>Travel Family · Tous vos voyages au même endroit</span>
      </p>
    </main>
  )
}

export default Auth
