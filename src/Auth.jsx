import { useState } from 'react'
import { supabase } from './supabase'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function signUp() {
    setLoading(true)
    setMessage('')

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
        <h2>🔐 Connexion</h2>

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