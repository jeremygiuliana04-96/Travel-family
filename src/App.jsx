import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [tripName, setTripName] = useState(() => {
    return localStorage.getItem('tripName') || 'Gran Canaria — Maspalomas'
  })

  const [tripIcon, setTripIcon] = useState(() => {
    return localStorage.getItem('tripIcon') || '🌴'
  })

  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem('budget')
    return savedBudget ? Number(savedBudget) : 1500
  })

  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')

  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses')
    return savedExpenses ? JSON.parse(savedExpenses) : []
  })

  const [activityDate, setActivityDate] = useState('')
  const [activityName, setActivityName] = useState('')

  const [activities, setActivities] = useState(() => {
    const savedActivities = localStorage.getItem('activities')
    if (savedActivities) return JSON.parse(savedActivities)

    return [
      { id: 1, date: '25 juin', name: 'Arrivée à Maspalomas' },
      { id: 2, date: '26 juin', name: 'Aquarium Poema del Mar' },
      { id: 3, date: '27 juin', name: 'Puerto de Mogán' },
      { id: 4, date: '28 juin', name: 'Plage + promenade' },
    ]
  })

  const [packingItemName, setPackingItemName] = useState('')

  const [packingList, setPackingList] = useState(() => {
    const savedList = localStorage.getItem('packingList')
    if (savedList) return JSON.parse(savedList)

    return [
      { id: 1, name: 'Passeports', checked: false },
      { id: 2, name: 'Crème solaire', checked: false },
      { id: 3, name: 'Maillots de bain', checked: false },
      { id: 4, name: 'AirTags', checked: false },
      { id: 5, name: 'Médicaments enfant', checked: false },
    ]
  })

  useEffect(() => {
    localStorage.setItem('tripName', tripName)
  }, [tripName])

  useEffect(() => {
    localStorage.setItem('tripIcon', tripIcon)
  }, [tripIcon])

  useEffect(() => {
    localStorage.setItem('budget', String(budget))
  }, [budget])

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('packingList', JSON.stringify(packingList))
  }, [packingList])

  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities))
  }, [activities])

  const totalSpent = expenses.reduce((total, expense) => {
    return total + expense.amount
  }, 0)

  const remaining = budget - totalSpent

  function addActivity() {
    if (activityDate === '' || activityName === '') return

    const newActivity = {
      id: Date.now(),
      date: activityDate,
      name: activityName,
    }

    setActivities([...activities, newActivity])
    setActivityDate('')
    setActivityName('')
  }

  function deleteActivity(id) {
    setActivities(activities.filter((activity) => activity.id !== id))
  }

  function addPackingItem() {
    if (packingItemName === '') return

    const newItem = {
      id: Date.now(),
      name: packingItemName,
      checked: false,
    }

    setPackingList([...packingList, newItem])
    setPackingItemName('')
  }

  function deletePackingItem(id) {
    setPackingList(packingList.filter((item) => item.id !== id))
  }

  function togglePackingItem(id) {
    setPackingList(
      packingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  function addExpense() {
    if (expenseName === '' || expenseAmount === '') return

    const newExpense = {
      id: Date.now(),
      name: expenseName,
      amount: Number(expenseAmount),
    }

    setExpenses([...expenses, newExpense])
    setExpenseName('')
    setExpenseAmount('')
  }

  function deleteExpense(id) {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  return (
    <main className="app">
      <section className="hero-card">
        <h1>{tripIcon} Travel Family</h1>
        <p>Vacances {tripName}</p>
      </section>

      <section className="card">
        <h2>⚙️ Thème du voyage</h2>

        <label className="field">
          Destination
          <input
            type="text"
            placeholder="Ex : Italie, Paris, Tenerife..."
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />
        </label>

        <label className="field">
          Icône
          <input
            type="text"
            placeholder="Ex : 🌴 ✈️ 🏖️ 🏔️"
            value={tripIcon}
            onChange={(e) => setTripIcon(e.target.value)}
          />
        </label>
      </section>

      <section className="card">
        <h2>📅 Planning</h2>

        <div className="expense-form">
          <input
            type="text"
            placeholder="Date : ex 29 juin"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
          />

          <input
            type="text"
            placeholder="Activité : ex Restaurant"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
          />

          <button onClick={addActivity}>Ajouter une activité</button>
        </div>

        <ul className="expenses-list">
          {activities.map((activity) => (
            <li key={activity.id}>
              <span>
                <strong>{activity.date}</strong> — {activity.name}
              </span>
              <button onClick={() => deleteActivity(activity.id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>🧳 Valises</h2>

        <div className="expense-form">
          <input
            type="text"
            placeholder="Ex : Doudou, chargeur, lunettes..."
            value={packingItemName}
            onChange={(e) => setPackingItemName(e.target.value)}
          />

          <button onClick={addPackingItem}>Ajouter</button>
        </div>

        <div className="packing-list">
          {packingList.map((item) => (
            <div className="packing-row" key={item.id}>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => togglePackingItem(item.id)}
                />

                <span className={item.checked ? 'checked' : ''}>
                  {item.name}
                </span>
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
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </label>

        <div className="budget-summary">
          <p>
            Dépensé : <strong>{totalSpent} €</strong>
          </p>
          <p>
            Reste : <strong>{remaining} €</strong>
          </p>
        </div>

        <div className="expense-form">
          <input
            type="text"
            placeholder="Ex : Restaurant"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Montant"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
          />

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

export default App.packing-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.packing-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.packing-row button {
  width: auto;
  padding: 8px 12px;
}