import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [tripName, setTripName] = useState(() => {
    return localStorage.getItem('tripName') || 'Gran Canaria — Maspalomas'
  })

  const [tripIcon, setTripIcon] = useState(() => {
    return localStorage.getItem('tripIcon') || '🌴'
  })

  const [people, setPeople] = useState(() => {
    const savedPeople = localStorage.getItem('people')
    return savedPeople ? JSON.parse(savedPeople) : ['Famille']
  })

  const [selectedPerson, setSelectedPerson] = useState(() => {
    return localStorage.getItem('selectedPerson') || 'Famille'
  })

  const [newPersonName, setNewPersonName] = useState('')
  const [packingItemName, setPackingItemName] = useState('')

  const [packingLists, setPackingLists] = useState(() => {
    const savedPackingLists = localStorage.getItem('packingLists')
    if (savedPackingLists) return JSON.parse(savedPackingLists)

    const oldList = localStorage.getItem('packingList')

    return {
      Famille: oldList
        ? JSON.parse(oldList)
        : [
            { id: 1, name: 'Passeports', checked: false },
            { id: 2, name: 'Crème solaire', checked: false },
            { id: 3, name: 'Maillots de bain', checked: false },
            { id: 4, name: 'AirTags', checked: false },
            { id: 5, name: 'Médicaments enfant', checked: false },
          ],
    }
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

  useEffect(() => {
    localStorage.setItem('tripName', tripName)
  }, [tripName])

  useEffect(() => {
    localStorage.setItem('tripIcon', tripIcon)
  }, [tripIcon])

  useEffect(() => {
    localStorage.setItem('people', JSON.stringify(people))
  }, [people])

  useEffect(() => {
    localStorage.setItem('selectedPerson', selectedPerson)
  }, [selectedPerson])

  useEffect(() => {
    localStorage.setItem('packingLists', JSON.stringify(packingLists))
  }, [packingLists])

  useEffect(() => {
    localStorage.setItem('budget', String(budget))
  }, [budget])

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities))
  }, [activities])

  const currentPackingList = packingLists[selectedPerson] || []

  const totalSpent = expenses.reduce((total, expense) => {
    return total + expense.amount
  }, 0)

  const remaining = budget - totalSpent

  function addPerson() {
    const cleanName = newPersonName.trim()
    if (cleanName === '') return
    if (people.includes(cleanName)) return

    setPeople([...people, cleanName])
    setPackingLists({
      ...packingLists,
      [cleanName]: [],
    })
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

    const newItem = {
      id: Date.now(),
      name: packingItemName.trim(),
      checked: false,
    }

    setPackingLists({
      ...packingLists,
      [selectedPerson]: [...currentPackingList, newItem],
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

    setActivities([
      ...activities,
      { id: Date.now(), date: activityDate, name: activityName },
    ])

    setActivityDate('')
    setActivityName('')
  }

  function deleteActivity(id) {
    setActivities(activities.filter((activity) => activity.id !== id))
  }

  function addExpense() {
    if (expenseName === '' || expenseAmount === '') return

    setExpenses([
      ...expenses,
      { id: Date.now(), name: expenseName, amount: Number(expenseAmount) },
    ])

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
            placeholder="Ajouter une personne : ex Eva"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
          />

          <button onClick={addPerson}>Ajouter une personne</button>
        </div>

        <div className="person-tabs">
          {people.map((person) => (
            <button
              key={person}
              className={selectedPerson === person ? 'active-tab' : ''}
              onClick={() => setSelectedPerson(person)}
            >
              {person}
            </button>
          ))}
        </div>

        {selectedPerson !== 'Famille' && (
          <button
            className="delete-person-button"
            onClick={() => deletePerson(selectedPerson)}
          >
            Supprimer {selectedPerson}
          </button>
        )}

        <div className="expense-form">
          <input
            type="text"
            placeholder={`À prendre pour ${selectedPerson}`}
            value={packingItemName}
            onChange={(e) => setPackingItemName(e.target.value)}
          />

          <button onClick={addPackingItem}>Ajouter</button>
        </div>

        <div className="packing-list">
          {currentPackingList.map((item) => (
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

export default App