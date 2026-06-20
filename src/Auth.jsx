import { useState } from 'react'
import { supabase } from './supabase.js'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordValid = password.length >= 6
  const passwordsMatch = password === confirmPassword

  async function signIn() {
    if (!email || !password) {
      setMessage('Remplis ton email et ton mot de passe.')
      return
    }

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
    if (!isEmailValid) {
      setMessage('Adresse e-mail invalide.')
      return
    }

    if (!isPasswordValid) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (!passwordsMatch) {
      setMessage('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Compte créé. Vérifie tes emails pour confirmer ton adresse.')
    }

    setLoading(false)
  }

  async function resetPassword() {
    if (!isEmailValid) {
      setMessage('Entre ton adresse e-mail pour réinitialiser ton mot de passe.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Email de réinitialisation envoyé.')
    }

    setLoading(false)
  }

  function switchMode() {
    setMessage('')
    setConfirmPassword('')
    setIsRegister(!isRegister)
  }

  return (
    <main className="auth-page auth-premium-page">
      <div className="auth-soft-cloud auth-soft-cloud-one"></div>
      <div className="auth-soft-cloud auth-soft-cloud-two"></div>

      <section className="auth-premium-hero">
        <div className="auth-premium-logo">
          <img src="/logo-travel-family.png" alt="Travel Family" />
        </div>
        <h1>Travel Family</h1>
        <p>Organisez vos voyages<br />en toute simplicité</p>
      </section>

      <section className={`auth-card auth-premium-card auth-switch-animation ${isRegister ? 'register-mode' : 'login-mode'}`}>
        <h2>{isRegister ? 'Créer un compte' : 'Bienvenue !'}</h2>

        <p>
          {isRegister
            ? 'Créez votre compte Travel Family'
            : 'Connectez-vous à votre compte'}
        </p>

        <label className={`auth-input-wrap ${email ? (isEmailValid ? 'input-valid' : 'input-invalid') : ''}`}>
          <span className="auth-input-icon">✉️</span>
          <input
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && <strong>{isEmailValid ? '✓' : '!'}</strong>}
        </label>

        <label className={`auth-input-wrap ${password ? (isPasswordValid ? 'input-valid' : 'input-invalid') : ''}`}>
          <span className="auth-input-icon">🔒</span>
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {isRegister && (
          <label className={`auth-input-wrap ${confirmPassword ? (passwordsMatch ? 'input-valid' : 'input-invalid') : ''}`}>
            <span className="auth-input-icon">🔒</span>
            <input
              type="password"
              placeholder="Retapez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
        )}

        {isRegister && confirmPassword && !passwordsMatch && (
          <p className="auth-helper-error">Les mots de passe ne correspondent pas.</p>
        )}

        {message && <p className="auth-message">{message}</p>}

        <button
          className="auth-primary-button"
          onClick={isRegister ? signUp : signIn}
          disabled={loading}
        >
          {loading
            ? 'Chargement...'
            : isRegister
              ? 'Créer mon compte'
              : 'Se connecter'}
        </button>

        {!isRegister && (
          <button
            type="button"
            className="forgot-password-button auth-forgot-link"
            onClick={resetPassword}
            disabled={loading}
          >
            Mot de passe oublié ?
          </button>
        )}

        <div className="auth-separator">
          <span></span>
          <p>ou</p>
          <span></span>
        </div>

        <button
          className="secondary-auth-button auth-create-button"
          onClick={switchMode}
          disabled={loading}
        >
          {isRegister ? '← Retour à la connexion' : '👤 + Créer un compte'}
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