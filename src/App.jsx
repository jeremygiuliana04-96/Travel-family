import { useEffect, useState } from 'react'
import './App.css'
import Auth from './Auth.jsx'
import { supabase } from './supabase.js'

const defaultPackingLists = {
  Famille: [
    { id: 1, name: 'Passeports', checked: false },
    { id: 2, name: 'Crème solaire', checked: false },
    { id: 3, name: 'Maillots de bain', checked: false },
    { id: 4, name: 'AirTags', checked: false },
    { id: 5, name: 'Médicaments enfant', checked: false },
  ],
}

function App() {
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [travelDataId, setTravelDataId] = useState(null)

  const [tripName, setTripName] = useState('Gran Canaria — Maspalomas')
  const [tripIcon, setTripIcon] = useState('🌴')

  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')

  const [people, setPeople] = useState(['Famille'])
  const [selectedPerson, setSelectedPerson] = useState('Famille')
  const [newPersonName, setNewPersonName] = useState('')
  const [packingItemName, setPackingItemName] = useState('')
  const [packingLists, setPackingLists] = useState(defaultPackingLists)

  const [budget, setBudget] = useState(1500)
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenses, setExpenses] = useState([])

  const [activityDate, setActivityDate] = useState('')
  const [activityName, setActivityName] = useState('')
  const [activities, setActivities] = useState([
    { id: 1, date: '25 juin', name: 'Arrivée à Maspalomas' },
    { id: 2, date: '26 juin', name: 'Aquarium Poema del Mar' },
    { id: 3, date: '27 juin', name: 'Puerto de Mogán' },
    { id: 4, date: '28 juin', name: 'Plage + promenade' },
  ])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setSessionLoading(false)
      setDataLoaded(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session) {
      loadTravelData()
    }
  }, [session])

  useEffect(() => {
    if (session && dataLoaded && travelDataId) {
      saveTravelData()
    }
  }, [tripName, tripIcon, people, packingLists, budget, expenses, activities])

  useEffect(() => {
    fetchWeather()
  }, [tripName])

  const currentPackingList = packingLists[selectedPerson] || []
  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0)
  const remaining = budget - totalSpent

  async function loadTravelData() {
    setDataLoading(true)

    const { data, error } = await supabase
      .from('travel_data')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error(error)
      setDataLoading(false)
      return
    }

    if (data) {
      setTravelDataId(data.id)
      setTripName(data.trip_name || 'Gran Canaria — Maspalomas')
      setTripIcon(data.trip_icon || '🌴')
      setPeople(data.people || ['Famille'])
      setPackingLists(data.packing_lists || defaultPackingLists)
      setBudget(Number(data.budget) || 1500)
      setExpenses(data.expenses || [])
      setActivities(data.activities || [])
      setSelectedPerson('Famille')
    } else {
      const { data: newData } = await supabase
        .from('travel_data')
        .insert({
          user_id: session.user.id,
          trip_name: 'Gran Canaria — Maspalomas',
          trip_icon: '🌴',
          people: ['Famille'],
          packing_lists: defaultPackingLists,
          budget: 1500,
          expenses: [],
          activities: [
            { id: 1, date: '25 juin', name: 'Arrivée à Maspalomas' },
            { id: 2, date: '26 juin', name: 'Aquarium Poema del Mar' },
            { id: 3, date: '27 juin', name: 'Puerto de Mogán' },
            { id: 4, date: '28 juin', name: 'Plage + promenade' },
          ],
        })
        .select()
        .single()

      if (newData) {
        setTravelDataId(newData.id)
      }
    }

    setDataLoaded(true)
    setDataLoading(false)
  }

  async function saveTravelData() {
    await supabase
      .from('travel_data')
      .update({
        trip_name: tripName,
        trip_icon: tripIcon,
        people,
        packing_lists: packingLists,
        budget,
        expenses,
        activities,
        updated_at: new Date().toISOString(),
      })
      .eq('id', travelDataId)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  function getWeatherIcon(code) {
    if (code === 0) return '☀️'
    if ([1, 2, 3].includes(code)) return '⛅'
    if ([45, 48].includes(code)) return '🌫️'
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'
    if ([95, 96, 99].includes(code)) return '⛈️'
    return '🌤️'
  }

  function getSearchLocation() {
    if (tripName.includes('—')) return tripName.split('—').pop().trim()
    if (tripName.includes('-')) return tripName.split('-').pop().trim()
    return tripName.trim()
  }

  async function fetchWeather() {
    const location = getSearchLocation()
    if (!location) return

    try {
      setWeatherLoading(true)
      setWeatherError('')

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=fr&format=json`
      )

      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        setWeather(null)
        setWeatherError('Destination introuvable pour la météo')
        return
      }

      const place = geoData.results[0]

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
      )

      const weatherData = await weatherResponse.json()

      setWeather({
        city: place.name,
        country: place.country,
        temperature: Math.round(weatherData.current.temperature_2m),
        feelsLike: Math.round(weatherData.current.apparent_temperature),
        humidity: weatherData.current.relative_humidity_2m,
        wind: Math.round(weatherData.current.wind_speed_10m),
        code: weatherData.current.weather_code,
      })
    } catch {
      setWeatherError('Impossible de charger la météo')
    } finally {
      setWeatherLoading(false)
    }
  }

  function addPerson() {
    const cleanName = newPersonName.trim()
    if (cleanName === '' || people.includes(cleanName)) return

    setPeople([...people, cleanName])
    setPackingLists({ ...packingLists, [cleanName]: [] })
    setSelectedPerson(cleanName)
    setNewPersonName('')
  }

  function deletePerson(personName) {
    if (personName === 'Famille') return

    const updatedPeople = people.filter((person) => person !== personName)
    const updatedPackingLists = { ...packingLists }
    delete updatedPackingLists[personName]

    setPeople(updatedPeople)
    setPackingLists(updatedPackingLists)
    setSelectedPerson('Famille')
  }

  function addPackingItem() {
    if (packingItemName.trim() === '') return

    setPackingLists({
      ...packingLists,
      [selectedPerson]: [
        ...currentPackingList,
        { id: Date.now(), name: packingItemName.trim(), checked: false },
      ],
    })

    setPackingItemName('')
  }

  function deletePackingItem(id) {
    setPackingLists({
      ...packingLists,
      [selectedPerson]: currentPackingList.filter((item) => item.id !== id),
    })
  }

  function togglePackingItem(id) {
    setPackingLists({
      ...packingLists,
      [selectedPerson]: currentPackingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    })
  }

  function addActivity() {
    if (activityDate === '' || activityName === '') return

    setActivities([...activities, { id: Date.now(), date: activityDate, name: activityName }])
    setActivityDate('')
    setActivityName('')
  }

  function deleteActivity(id) {
    setActivities(activities.filter((activity) => activity.id !== id))
  }

  function addExpense() {
    if (expenseName === '' || expenseAmount === '') return

    setExpenses([...expenses, { id: Date.now(), name: expenseName, amount: Number(expenseAmount) }])
    setExpenseName('')
    setExpenseAmount('')
  }

  function deleteExpense(id) {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  if (sessionLoading || dataLoading) {
    return (
      <main className="app">
        <section className="hero-card">
          <h1>🌴 Travel Family</h1>
          <p>Chargement...</p>
        </section>
      </main>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <main className="app">
      <section className="hero-card">
        <h1>{tripIcon} Travel Family</h1>
        <p>Vacances {tripName}</p>
        <button onClick={signOut}>Se déconnecter</button>
      </section>

      <section className="card weather-card">
        <h2>🌤️ Météo</h2>

        {weatherLoading && <p>Chargement de la météo...</p>}
        {weatherError && <p>{weatherError}</p>}

        {weather && (
          <div className="weather-box">
            <div className="weather-main">
              <span className="weather-icon">{getWeatherIcon(weather.code)}</span>
              <div>
                <strong>{weather.city}, {weather.country}</strong>
                <p>{weather.temperature}°C — ressenti {weather.feelsLike}°C</p>
              </div>
            </div>

            <div className="weather-details">
              <p>💨 Vent : <strong>{weather.wind} km/h</strong></p>
              <p>💧 Humidité : <strong>{weather.humidity}%</strong></p>
            </div>
          </div>
        )}

        <button onClick={fetchWeather}>Actualiser météo</button>
      </section>

      <section className="card">
        <h2>⚙️ Thème du voyage</h2>

        <label className="field">
          Destination
          <input type="text" placeholder="Ex : Italie, Paris, Tenerife..." value={tripName} onChange={(e) => setTripName(e.target.value)} />
        </label>

        <label className="field">
          Icône
          <input type="text" placeholder="Ex : 🌴 ✈️ 🏖️ 🏔️" value={tripIcon} onChange={(e) => setTripIcon(e.target.value)} />
        </label>
      </section>

      <section className="card">
        <h2>📅 Planning</h2>

        <div className="expense-form">
          <input type="text" placeholder="Date : ex 29 juin" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
          <input type="text" placeholder="Activité : ex Restaurant" value={activityName} onChange={(e) => setActivityName(e.target.value)} />
          <button onClick={addActivity}>Ajouter une activité</button>
        </div>

        <ul className="expenses-list">
          {activities.map((activity) => (
            <li key={activity.id}>
              <span><strong>{activity.date}</strong> — {activity.name}</span>
              <button onClick={() => deleteActivity(activity.id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>🧳 Valises</h2>

        <div className="expense-form">
          <input type="text" placeholder="Ajouter une personne : ex Eva" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} />
          <button onClick={addPerson}>Ajouter une personne</button>
        </div>

        <div className="person-tabs">
          {people.map((person) => (
            <button key={person} className={selectedPerson === person ? 'active-tab' : ''} onClick={() => setSelectedPerson(person)}>
              {person}
            </button>
          ))}
        </div>

        {selectedPerson !== 'Famille' && (
          <button className="delete-person-button" onClick={() => deletePerson(selectedPerson)}>
            Supprimer {selectedPerson}
          </button>
        )}

        <div className="expense-form">
          <input type="text" placeholder={`À prendre pour ${selectedPerson}`} value={packingItemName} onChange={(e) => setPackingItemName(e.target.value)} />
          <button onClick={addPackingItem}>Ajouter</button>
        </div>

        <div className="packing-list">
          {currentPackingList.map((item) => (
            <div className="packing-row" key={item.id}>
              <label className="check-item">
                <input type="checkbox" checked={item.checked} onChange={() => togglePackingItem(item.id)} />
                <span className={item.checked ? 'checked' : ''}>{item.name}</span>
              </label>

              <button onClick={() => deletePackingItem(item.id)}>✕</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>💰 Budget</h2>

        <label className="field">
          Budget prévu
          <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
        </label>

        <div className="budget-summary">
          <p>Dépensé : <strong>{totalSpent} €</strong></p>
          <p>Reste : <strong>{remaining} €</strong></p>
        </div>

        <div className="expense-form">
          <input type="text" placeholder="Ex : Restaurant" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} />
          <input type="number" placeholder="Montant" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
          <button onClick={addExpense}>Ajouter</button>
        </div>

        <ul className="expenses-list">
          {expenses.map((expense) => (
            <li key={expense.id}>
              <span>{expense.name}</span>
              <strong>{expense.amount} €</strong>
              <button onClick={() => deleteExpense(expense.id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App