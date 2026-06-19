import { useEffect, useRef, useState } from 'react'
import './App.css'
import Auth from './Auth.jsx'
import { supabase } from './supabase.js'

const defaultPackingLists = {
  Famille: [],
}

const emptyTripPayload = {
  trip_name: 'Mon voyage',
  trip_icon: '✈️',
  start_date: null,
  end_date: null,
  people: ['Famille'],
  packing_lists: defaultPackingLists,
  budget: 0,
  expenses: [],
  shopping_list: [],
  activities: [],
  places: [],
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [mainView, setMainView] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [trips, setTrips] = useState([])
  const [selectedTripId, setSelectedTripId] = useState(null)

  const [tripName, setTripName] = useState('Mon voyage')
  const [tripIcon, setTripIcon] = useState('✈️')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [newTripName, setNewTripName] = useState('')
  const [newTripIcon, setNewTripIcon] = useState('✈️')
  const [newTripStartDate, setNewTripStartDate] = useState('')
  const [newTripEndDate, setNewTripEndDate] = useState('')

  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')

  const [people, setPeople] = useState(['Famille'])
  const [selectedPerson, setSelectedPerson] = useState('Famille')
  const [newPersonName, setNewPersonName] = useState('')
  const [packingItemName, setPackingItemName] = useState('')
  const [packingLists, setPackingLists] = useState(defaultPackingLists)

  const [budget, setBudget] = useState(0)
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenses, setExpenses] = useState([])

  const [shoppingItem, setShoppingItem] = useState('')
  const [shoppingList, setShoppingList] = useState([])

  const [activityDate, setActivityDate] = useState('')
  const [activityName, setActivityName] = useState('')
  const [activities, setActivities] = useState([])

  const [places, setPlaces] = useState([])
  const [placeName, setPlaceName] = useState('')
  const [placeType, setPlaceType] = useState('Hôtel')
  const [placeAddress, setPlaceAddress] = useState('')

  const [documents, setDocuments] = useState([])
  const [documentPerson, setDocumentPerson] = useState('Famille')
  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState('Passeport')
  const [documentFile, setDocumentFile] = useState(null)
  const [documentUploading, setDocumentUploading] = useState(false)
  const [documentFileInputKey, setDocumentFileInputKey] = useState(Date.now())
  const documentFileInputRef = useRef(null)

  const [photos, setPhotos] = useState([])
  const [photoFile, setPhotoFile] = useState(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoFileInputKey, setPhotoFileInputKey] = useState(Date.now())
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const photoFileInputRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      resetAppState()
      setSession(data.session)
      setSessionLoading(false)
      setDataLoaded(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      resetAppState()
      setSession(session)
      setSessionLoading(false)
      setDataLoaded(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session) loadTrips()
  }, [session])

  useEffect(() => {
    if (selectedTripId) fetchWeather()
  }, [tripName, selectedTripId])

  useEffect(() => {
    if (session && dataLoaded && selectedTripId && mainView === 'trip') saveCurrentTrip()
  }, [
    tripName,
    tripIcon,
    startDate,
    endDate,
    people,
    packingLists,
    budget,
    expenses,
    shoppingList,
    activities,
    places,
  ])

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) || null
  const currentPackingList = packingLists[selectedPerson] || []
  const filteredDocuments = documents.filter((doc) => doc.person_name === documentPerson)

  const totalSpent = expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)
  const remaining = Number(budget || 0) - totalSpent

  const allPackingItems = Object.values(packingLists || {}).flat()
  const uncheckedPackingItems = allPackingItems.filter((item) => !item.checked)
  const checkedPackingItems = allPackingItems.filter((item) => item.checked)

  const packingProgress =
    allPackingItems.length === 0
      ? 0
      : Math.round((checkedPackingItems.length / allPackingItems.length) * 100)

  const boughtShoppingItems = shoppingList.filter((item) => item.bought)
  const missingShoppingItems = shoppingList.filter((item) => !item.bought)

  const sortedActivities = [...activities].sort((a, b) => {
    return parseActivityDate(a.date) - parseActivityDate(b.date)
  })

  const todayForActivity = new Date()
  todayForActivity.setHours(0, 0, 0, 0)

  const nextActivity =
    sortedActivities.find((activity) => parseActivityDate(activity.date) >= todayForActivity.getTime()) ||
    sortedActivities[0] ||
    null

  function resetDocumentFileInput() {
    setDocumentFile(null)

    if (documentFileInputRef.current) {
      documentFileInputRef.current.value = ''
    }

    setDocumentFileInputKey(Date.now())

    setTimeout(() => {
      setDocumentFile(null)

      if (documentFileInputRef.current) {
        documentFileInputRef.current.value = ''
      }

      setDocumentFileInputKey(Date.now())
    }, 150)
  }

  function resetPhotoFileInput() {
    setPhotoFile(null)

    if (photoFileInputRef.current) {
      photoFileInputRef.current.value = ''
    }

    setPhotoFileInputKey(Date.now())

    setTimeout(() => {
      setPhotoFile(null)

      if (photoFileInputRef.current) {
        photoFileInputRef.current.value = ''
      }

      setPhotoFileInputKey(Date.now())
    }, 150)
  }

  function resetTripForm() {
    setNewTripName('')
    setNewTripIcon('✈️')
    setNewTripStartDate('')
    setNewTripEndDate('')
  }

  function resetCurrentTripState() {
    setSelectedTripId(null)
    setTripName('Mon voyage')
    setTripIcon('✈️')
    setStartDate('')
    setEndDate('')
    setWeather(null)
    setWeatherError('')
    setPeople(['Famille'])
    setSelectedPerson('Famille')
    setNewPersonName('')
    setPackingItemName('')
    setPackingLists(defaultPackingLists)
    setBudget(0)
    setExpenseName('')
    setExpenseAmount('')
    setExpenses([])
    setShoppingItem('')
    setShoppingList([])
    setActivityDate('')
    setActivityName('')
    setActivities([])
    setPlaces([])
    setPlaceName('')
    setPlaceType('Hôtel')
    setPlaceAddress('')
    setDocuments([])
    setDocumentPerson('Famille')
    setDocumentName('')
    setDocumentType('Passeport')
    setPhotos([])
    setPhotoCaption('')
    setSelectedPhoto(null)
    resetDocumentFileInput()
    resetPhotoFileInput()
  }

  function resetAppState() {
    setTrips([])
    setMainView('dashboard')
    setActiveTab('home')
    resetTripForm()
    resetCurrentTripState()
  }

  function hydrateTrip(trip) {
    setSelectedTripId(trip.id)
    setTripName(trip.trip_name || 'Mon voyage')
    setTripIcon(trip.trip_icon || '✈️')
    setStartDate(trip.start_date || '')
    setEndDate(trip.end_date || '')
    setPeople(trip.people || ['Famille'])
    setPackingLists(trip.packing_lists || defaultPackingLists)
    setBudget(Number(trip.budget) || 0)
    setExpenses(trip.expenses || [])
    setShoppingList(trip.shopping_list || [])
    setActivities(trip.activities || [])
    setPlaces(trip.places || [])
    setSelectedPerson('Famille')
    setDocumentPerson('Famille')
    setActiveTab('home')
    setMainView('trip')
  }

  function formatDate(dateValue) {
    if (!dateValue) return ''
    return new Date(dateValue).toLocaleDateString('fr-BE')
  }

  function parseActivityDate(dateText) {
    if (!dateText) return Number.MAX_SAFE_INTEGER

    const cleanDate = dateText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()

    const isoDate = new Date(cleanDate)
    if (!Number.isNaN(isoDate.getTime())) return isoDate.getTime()

    const months = {
      janvier: 0,
      fevrier: 1,
      mars: 2,
      avril: 3,
      mai: 4,
      juin: 5,
      juillet: 6,
      aout: 7,
      septembre: 8,
      octobre: 9,
      novembre: 10,
      decembre: 11,
    }

    const match = cleanDate.match(/(\d{1,2})\s+([a-z]+)/)
    if (!match) return Number.MAX_SAFE_INTEGER

    const day = Number(match[1])
    const month = months[match[2]]
    const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear()

    if (Number.isNaN(day) || month === undefined) return Number.MAX_SAFE_INTEGER

    return new Date(year, month, day).getTime()
  }

  function getDaysUntilStart() {
    if (!startDate) return null

    const today = new Date()
    const departure = new Date(startDate)

    today.setHours(0, 0, 0, 0)
    departure.setHours(0, 0, 0, 0)

    return Math.ceil((departure - today) / (1000 * 60 * 60 * 24))
  }

  function getTripDatesText(trip = null) {
    const tripStart = trip ? trip.start_date : startDate
    const tripEnd = trip ? trip.end_date : endDate

    if (tripStart && tripEnd) return `📅 Du ${formatDate(tripStart)} au ${formatDate(tripEnd)}`
    if (tripStart) return `📅 Départ le ${formatDate(tripStart)}`
    if (tripEnd) return `📅 Retour le ${formatDate(tripEnd)}`
    return '📅 Dates à définir'
  }

  function getActivityCountdownText(activity) {
    if (!activity) return ''

    const activityTime = parseActivityDate(activity.date)
    if (activityTime === Number.MAX_SAFE_INTEGER) return 'Date à vérifier dans le planning.'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days = Math.ceil((activityTime - today.getTime()) / (1000 * 60 * 60 * 24))

    if (days > 1) return `Dans ${days} jours`
    if (days === 1) return 'Demain'
    if (days === 0) return 'Aujourd’hui'
    return 'Activité déjà passée'
  }

  function getAssistantAdvice() {
    const advice = []
    const daysUntilStart = getDaysUntilStart()

    if (daysUntilStart !== null) {
      if (daysUntilStart > 1) advice.push(`✈️ Départ dans ${daysUntilStart} jours.`)
      else if (daysUntilStart === 1) advice.push('✈️ Départ demain ! Dernière vérification des valises.')
      else if (daysUntilStart === 0) advice.push('✈️ C’est le jour du départ ! Vérifie documents, valises et trajet.')
      else advice.push('🌴 Le voyage a déjà commencé. Profite bien !')
    }

    if (missingShoppingItems.length > 0) {
      advice.push(`🛒 Il reste ${missingShoppingItems.length} achat(s) à faire avant le départ.`)
    } else if (shoppingList.length > 0) {
      advice.push('🛒 Tous les achats avant départ sont faits.')
    }

    if (documents.length > 0) {
      advice.push(`📁 Coffre-fort : ${documents.length} document(s) enregistré(s).`)
    } else {
      advice.push('📁 Pense à ajouter les documents importants dans le coffre-fort.')
    }

    if (photos.length > 0) {
      advice.push(`📸 Galerie : ${photos.length} photo(s) enregistrée(s) pour ce voyage.`)
    } else {
      advice.push('📸 Tu pourras ajouter les photos souvenirs dans la galerie du voyage.')
    }

    if (weather) {
      if (weather.temperature >= 27 && weather.wind <= 25) {
        advice.push('☀️ Temps idéal pour prévoir une activité extérieure ou une sortie plage.')
      } else if (weather.temperature <= 20 || weather.code >= 51) {
        advice.push('🌧️ Météo moins favorable : une activité intérieure serait plus confortable.')
      } else {
        advice.push('🌤️ Météo correcte : garde une activité flexible selon l’énergie de la famille.')
      }
    }

    if (uncheckedPackingItems.length > 0) {
      advice.push(`🧳 Il reste ${uncheckedPackingItems.length} objet(s) non cochés dans les valises.`)
    } else if (allPackingItems.length > 0) {
      advice.push('✅ Toutes les valises sont prêtes. Nickel pour partir tranquille.')
    }

    if (budget > 0) {
      if (remaining < 0) advice.push(`⚠️ Le budget est dépassé de ${Math.abs(remaining)} €.`)
      else if (remaining <= budget * 0.2) advice.push(`💰 Il reste ${remaining} €. Budget à surveiller.`)
      else advice.push(`💰 Budget restant : ${remaining} €. Tu as encore une bonne marge.`)
    }

    if (nextActivity) {
      advice.push(`📅 Prochaine activité prévue : ${nextActivity.name} (${nextActivity.date}).`)
    } else {
      advice.push('📅 Aucun planning prévu pour le moment. Tu peux ajouter une activité simple.')
    }

    return advice
  }

  async function loadTrips() {
    setDataLoading(true)

    const { data, error } = await supabase
      .from('travel_data')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error(error)
      setDataLoading(false)
      return
    }

    setTrips(data || [])
    setDataLoaded(true)
    setDataLoading(false)
  }

  async function createTrip() {
    const cleanName = newTripName.trim()
    if (cleanName === '') {
      alert('Ajoute au moins le nom du voyage.')
      return
    }

    setDataLoading(true)

    const { data, error } = await supabase
      .from('travel_data')
      .insert({
        user_id: session.user.id,
        ...emptyTripPayload,
        trip_name: cleanName,
        trip_icon: newTripIcon.trim() || '✈️',
        start_date: newTripStartDate || null,
        end_date: newTripEndDate || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      alert("Impossible de créer le voyage.")
      setDataLoading(false)
      return
    }

    resetTripForm()
    setTrips([data, ...trips])
    hydrateTrip(data)
    await loadDocuments(data.id)
    await loadPhotos(data.id)
    setDataLoading(false)
  }

  async function openTrip(trip) {
    hydrateTrip(trip)
    await loadDocuments(trip.id)
    await loadPhotos(trip.id)
  }

  async function saveCurrentTrip() {
    const { error } = await supabase
      .from('travel_data')
      .update({
        trip_name: tripName,
        trip_icon: tripIcon,
        start_date: startDate || null,
        end_date: endDate || null,
        people,
        packing_lists: packingLists,
        budget,
        expenses,
        shopping_list: shoppingList,
        activities,
        places,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedTripId)

    if (error) {
      console.error(error)
      return
    }

    setTrips((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === selectedTripId
          ? {
              ...trip,
              trip_name: tripName,
              trip_icon: tripIcon,
              start_date: startDate || null,
              end_date: endDate || null,
              people,
              packing_lists: packingLists,
              budget,
              expenses,
              shopping_list: shoppingList,
              activities,
              places,
              updated_at: new Date().toISOString(),
            }
          : trip
      )
    )
  }

  async function deleteTrip(trip) {
    const confirmDelete = confirm(`Supprimer le voyage "${trip.trip_name}" ?`)
    if (!confirmDelete) return

    const { data: docs } = await supabase
      .from('travel_documents')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('trip_id', trip.id)

    const documentPaths = (docs || []).map((document) => document.file_url)

    if (documentPaths.length > 0) {
      await supabase.storage.from('travel-documents').remove(documentPaths)
    }

    const { data: tripPhotos } = await supabase
      .from('travel_photos')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('trip_id', trip.id)

    const photoPaths = (tripPhotos || []).map((photo) => photo.photo_url)

    if (photoPaths.length > 0) {
      await supabase.storage.from('travel-photos').remove(photoPaths)
    }

    await supabase.from('travel_documents').delete().eq('user_id', session.user.id).eq('trip_id', trip.id)
    await supabase.from('travel_photos').delete().eq('user_id', session.user.id).eq('trip_id', trip.id)
    await supabase.from('travel_data').delete().eq('id', trip.id)

    setTrips(trips.filter((item) => item.id !== trip.id))

    if (selectedTripId === trip.id) {
      resetCurrentTripState()
      setMainView('trips')
    }
  }

  function closeTrip() {
    resetCurrentTripState()
    setMainView('trips')
  }

  async function loadDocuments(tripId = selectedTripId) {
    if (!tripId) return

    const { data, error } = await supabase
      .from('travel_documents')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setDocuments(data || [])
  }

  async function addDocument() {
    if (!selectedTripId || !documentFile || documentName.trim() === '') return

    try {
      setDocumentUploading(true)

      const cleanFileName = documentFile.name.replaceAll(' ', '-')
      const filePath = `${session.user.id}/${selectedTripId}/${Date.now()}-${cleanFileName}`

      const { error: uploadError } = await supabase.storage
        .from('travel-documents')
        .upload(filePath, documentFile)

      if (uploadError) {
        console.error(uploadError)
        alert("Impossible d'envoyer le fichier.")
        return
      }

      const { error: insertError } = await supabase
        .from('travel_documents')
        .insert({
          user_id: session.user.id,
          trip_id: selectedTripId,
          person_name: documentPerson,
          document_name: documentName.trim(),
          document_type: documentType,
          file_url: filePath,
        })

      if (insertError) {
        console.error(insertError)
        alert("Impossible d'enregistrer le document.")
        return
      }

      setDocumentName('')
      setDocumentType('Passeport')
      resetDocumentFileInput()
      await loadDocuments()
      resetDocumentFileInput()
    } finally {
      setDocumentUploading(false)
    }
  }

  async function openDocument(filePath) {
    const { data, error } = await supabase.storage
      .from('travel-documents')
      .createSignedUrl(filePath, 60)

    if (error) {
      console.error(error)
      alert("Impossible d'ouvrir le document.")
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  async function deleteDocument(document) {
    const confirmDelete = confirm(`Supprimer ${document.document_name} ?`)
    if (!confirmDelete) return

    await supabase.storage.from('travel-documents').remove([document.file_url])
    await supabase.from('travel_documents').delete().eq('id', document.id)

    await loadDocuments()
  }

  async function loadPhotos(tripId = selectedTripId) {
    if (!tripId) return

    const { data, error } = await supabase
      .from('travel_photos')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setPhotos(data || [])
  }

  async function addPhoto() {
    if (!selectedTripId || !photoFile) return

    try {
      setPhotoUploading(true)

      const cleanFileName = photoFile.name.replaceAll(' ', '-')
      const filePath = `${session.user.id}/${selectedTripId}/${Date.now()}-${cleanFileName}`

      const { error: uploadError } = await supabase.storage
        .from('travel-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        console.error(uploadError)
        alert(uploadError.message)
        return
      }

      const { error: insertError } = await supabase
        .from('travel_photos')
        .insert({
          user_id: session.user.id,
          trip_id: selectedTripId,
          photo_url: filePath,
          caption: photoCaption.trim(),
        })

      if (insertError) {
        console.error(insertError)
        alert(insertError.message)
        return
      }

      setPhotoCaption('')
      resetPhotoFileInput()
      await loadPhotos()
      resetPhotoFileInput()
    } finally {
      setPhotoUploading(false)
    }
  }

  async function openPhoto(filePath) {
    const { data, error } = await supabase.storage
      .from('travel-photos')
      .createSignedUrl(filePath, 60)

    if (error) {
      console.error(error)
      alert("Impossible d'ouvrir la photo.")
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  function getPhotoUrl(filePath) {
    const { data } = supabase.storage
      .from('travel-photos')
      .getPublicUrl(filePath)

    return data?.publicUrl || ''
  }

  function getPhotoDate(photo) {
    if (!photo?.created_at) return ''

    return new Date(photo.created_at).toLocaleDateString('fr-BE')
  }

  async function deletePhoto(photo) {
    const confirmDelete = confirm('Supprimer cette photo ?')
    if (!confirmDelete) return

    await supabase.storage.from('travel-photos').remove([photo.photo_url])
    await supabase.from('travel_photos').delete().eq('id', photo.id)

    await loadPhotos()
  }

  async function resetCurrentTripData() {
    const confirmReset = confirm(
      'Réinitialiser ce voyage ? Les valises, achats, planning, budget, lieux, documents et photos de ce voyage seront effacés.'
    )

    if (!confirmReset || !session || !selectedTripId) return

    const documentPaths = documents.map((document) => document.file_url)
    const photoPaths = photos.map((photo) => photo.photo_url)

    if (documentPaths.length > 0) {
      await supabase.storage.from('travel-documents').remove(documentPaths)
    }

    if (photoPaths.length > 0) {
      await supabase.storage.from('travel-photos').remove(photoPaths)
    }

    await supabase.from('travel_documents').delete().eq('user_id', session.user.id).eq('trip_id', selectedTripId)
    await supabase.from('travel_photos').delete().eq('user_id', session.user.id).eq('trip_id', selectedTripId)

    await supabase
      .from('travel_data')
      .update({
        people: ['Famille'],
        packing_lists: defaultPackingLists,
        budget: 0,
        expenses: [],
        shopping_list: [],
        activities: [],
        places: [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedTripId)

    const currentTrip = trips.find((trip) => trip.id === selectedTripId)

    if (currentTrip) {
      const resetTrip = {
        ...currentTrip,
        people: ['Famille'],
        packing_lists: defaultPackingLists,
        budget: 0,
        expenses: [],
        shopping_list: [],
        activities: [],
        places: [],
      }

      setTrips(trips.map((trip) => (trip.id === selectedTripId ? resetTrip : trip)))
      hydrateTrip(resetTrip)
      setDocuments([])
      setPhotos([])
    }
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
    setDocumentPerson(cleanName)
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
    setDocumentPerson('Famille')
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

  function addShoppingItem() {
    if (shoppingItem.trim() === '') return

    setShoppingList([
      ...shoppingList,
      {
        id: Date.now(),
        name: shoppingItem.trim(),
        bought: false,
      },
    ])

    setShoppingItem('')
  }

  function toggleShoppingItem(id) {
    setShoppingList(
      shoppingList.map((item) =>
        item.id === id ? { ...item, bought: !item.bought } : item
      )
    )
  }

  function deleteShoppingItem(id) {
    setShoppingList(shoppingList.filter((item) => item.id !== id))
  }

  function addPlace() {
    if (placeName.trim() === '' || placeAddress.trim() === '') return

    setPlaces([
      ...places,
      {
        id: Date.now(),
        name: placeName.trim(),
        type: placeType.trim() || 'Lieu',
        address: placeAddress.trim(),
      },
    ])

    setPlaceName('')
    setPlaceType('Hôtel')
    setPlaceAddress('')
  }

  function deletePlace(id) {
    setPlaces(places.filter((place) => place.id !== id))
  }

  function openPlace(place) {
    const query = encodeURIComponent(place.address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  function addActivity() {
    if (activityDate.trim() === '' || activityName.trim() === '') return

    const updatedActivities = [
      ...activities,
      { id: Date.now(), date: activityDate.trim(), name: activityName.trim() },
    ].sort((a, b) => parseActivityDate(a.date) - parseActivityDate(b.date))

    setActivities(updatedActivities)
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
      <main className="app loading-screen">
        <section className="hero-card">
          <h1>✈️ Travel Family</h1>
          <p>Préparation de ton espace voyage...</p>
        </section>
      </main>
    )
  }

  if (!session) return <Auth />

  if (mainView === 'dashboard') {
    return (
      <main className="app">
        <section className="hero-card">
          <h1>✈️ Travel Family</h1>
          <p>Organise tous tes voyages de famille au même endroit.</p>
        </section>

        <section className="card dashboard-card">
          <h2>🌴 Accueil</h2>

          <div className="dashboard-actions">
            <button onClick={() => setMainView('trips')}>
              <span>🌍</span>
              <strong>Mes voyages</strong>
              <small>Voir les voyages déjà enregistrés</small>
            </button>

            <button onClick={() => setMainView('newTrip')}>
              <span>➕</span>
              <strong>Ajouter un nouveau voyage</strong>
              <small>Créer une destination, des dates et une organisation</small>
            </button>
          </div>
        </section>

        <section className="card system-card">
          <h2>⚙️ Compte</h2>
          <div className="system-row">
            <strong>Email connecté</strong>
            <span>{session?.user?.email || 'Non disponible'}</span>
          </div>
          <button className="delete-person-button" onClick={signOut}>
            Se déconnecter
          </button>
        </section>
      </main>
    )
  }

  if (mainView === 'trips') {
    return (
      <main className="app">
        <section className="hero-card">
          <button className="menu-button" onClick={() => setMainView('dashboard')}>
            ←
          </button>
          <h1>🌍 Mes voyages</h1>
          <p>{trips.length} voyage(s) enregistré(s)</p>
        </section>

        <section className="card">
          <div className="document-actions">
            <button className="open-document" onClick={() => setMainView('newTrip')}>
              ➕ Ajouter un nouveau voyage
            </button>
          </div>

          <div className="trip-list">
            {trips.length === 0 && (
              <div className="empty-state">
                <strong>Aucun voyage pour le moment.</strong>
                <p>Ajoute ton premier voyage pour commencer l’organisation.</p>
              </div>
            )}

            {trips.map((trip) => (
              <div className="trip-row" key={trip.id}>
                <button className="trip-open-button" onClick={() => openTrip(trip)}>
                  <span className="trip-icon">{trip.trip_icon || '✈️'}</span>
                  <span>
                    <strong>{trip.trip_name || 'Mon voyage'}</strong>
                    <small>{getTripDatesText(trip)}</small>
                  </span>
                </button>

                <div className="document-actions">
                  <button className="open-document" onClick={() => openTrip(trip)}>
                    Ouvrir
                  </button>
                  <button className="delete-document" onClick={() => deleteTrip(trip)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (mainView === 'newTrip') {
    return (
      <main className="app">
        <section className="hero-card">
          <button className="menu-button" onClick={() => setMainView('dashboard')}>
            ←
          </button>
          <h1>➕ Nouveau voyage</h1>
          <p>Crée ta destination et prépare l’organisation.</p>
        </section>

        <section className="card">
          <h2>✈️ Ajouter un nouveau voyage</h2>

          <label className="field">
            Destination
            <input
              type="text"
              placeholder="Ex : Maspalomas 2026, Paris, Tenerife..."
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
            />
          </label>

          <label className="field">
            Icône
            <input
              type="text"
              placeholder="Ex : 🌴 ✈️ 🏖️ 🏔️"
              value={newTripIcon}
              onChange={(e) => setNewTripIcon(e.target.value)}
            />
          </label>

          <label className="field">
            Date de départ
            <input
              type="date"
              value={newTripStartDate}
              onChange={(e) => setNewTripStartDate(e.target.value)}
            />
          </label>

          <label className="field">
            Date de retour
            <input
              type="date"
              value={newTripEndDate}
              onChange={(e) => setNewTripEndDate(e.target.value)}
            />
          </label>

          <div className="document-actions">
            <button className="open-document" onClick={createTrip}>
              Créer le voyage
            </button>
            <button className="delete-document" onClick={() => setMainView('dashboard')}>
              Annuler
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="hero-card">
        <button className="menu-button" onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        <button className="back-trip-button" onClick={closeTrip}>
          ← Mes voyages
        </button>

        <h1>{tripIcon} Travel Family</h1>
        <p>Vacances {tripName}</p>
        {getTripDatesText() && <p>{getTripDatesText()}</p>}
      </section>

      {activeTab === 'home' && (
        <>
          <section className="card weather-card">
            <h2>🌤️ Météo de la destination</h2>

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

          <section className="card next-activity-card">
            <h2>🤖 Assistant voyage</h2>

            <div className="next-activity-box">
              {getAssistantAdvice().slice(0, 6).map((advice, index) => (
                <p key={index}>{advice}</p>
              ))}
            </div>
          </section>

          <section className="card next-activity-card">
            <h2>📅 Prochaine activité</h2>

            {nextActivity ? (
              <div className="next-activity-box">
                <strong>{nextActivity.name}</strong>
                <p>📅 {nextActivity.date}</p>
                <p>⏳ {getActivityCountdownText(nextActivity)}</p>
                <button onClick={() => setActiveTab('planning')}>
                  Voir le planning
                </button>
              </div>
            ) : (
              <div className="next-activity-box">
                <p>Aucune activité prévue pour le moment.</p>
                <button onClick={() => setActiveTab('planning')}>
                  Ajouter une activité
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'packing' && (
        <section className="card">
          <h2>🧳 Valises</h2>

          <div className="budget-summary">
            <p>Préparation : <strong>{packingProgress}%</strong></p>
            <p>Restant : <strong>{uncheckedPackingItems.length}</strong></p>
          </div>

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
            <button className="delete-person-button" onClick={() => deletePerson(selectedPerson)}>
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
            {currentPackingList.length === 0 && <p>Aucun objet pour {selectedPerson}.</p>}

            {currentPackingList.map((item) => (
              <div className="packing-row" key={item.id}>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => togglePackingItem(item.id)}
                  />
                  <span className={item.checked ? 'checked' : ''}>{item.name}</span>
                </label>

                <button onClick={() => deletePackingItem(item.id)}>✕</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'shopping' && (
        <section className="card">
          <h2>🛒 Achats avant départ</h2>

          <div className="budget-summary">
            <p>Acheté : <strong>{boughtShoppingItems.length}</strong></p>
            <p>Restant : <strong>{missingShoppingItems.length}</strong></p>
          </div>

          <div className="expense-form">
            <input
              type="text"
              placeholder="Ex : Crème solaire, brassards, lunettes..."
              value={shoppingItem}
              onChange={(e) => setShoppingItem(e.target.value)}
            />

            <button onClick={addShoppingItem}>Ajouter</button>
          </div>

          <div className="packing-list">
            {shoppingList.length === 0 && <p>Aucun achat à prévoir pour le moment.</p>}

            {shoppingList.map((item) => (
              <div className="packing-row" key={item.id}>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={item.bought}
                    onChange={() => toggleShoppingItem(item.id)}
                  />
                  <span className={item.bought ? 'checked' : ''}>{item.name}</span>
                </label>

                <button onClick={() => deleteShoppingItem(item.id)}>✕</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'planning' && (
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
            {activities.length === 0 && <p>Aucune activité prévue.</p>}

            {sortedActivities.map((activity) => (
              <li key={activity.id}>
                <span><strong>{activity.date}</strong> — {activity.name}</span>
                <button onClick={() => deleteActivity(activity.id)}>✕</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'budget' && (
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
            <p>Dépensé : <strong>{totalSpent} €</strong></p>
            <p>Reste : <strong>{remaining} €</strong></p>
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
            {expenses.length === 0 && <p>Aucune dépense enregistrée.</p>}

            {expenses.map((expense) => (
              <li key={expense.id}>
                <span>{expense.name}</span>
                <strong>{expense.amount} €</strong>
                <button onClick={() => deleteExpense(expense.id)}>✕</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'documents' && (
        <section className="card vault-card">
          <h2>📁 Coffre-fort Voyage</h2>

          <div className="person-tabs">
            {people.map((person) => (
              <button
                key={person}
                className={documentPerson === person ? 'active-tab' : ''}
                onClick={() => setDocumentPerson(person)}
              >
                {person}
              </button>
            ))}
          </div>

          <div className="expense-form">
            <input
              type="text"
              placeholder="Nom du document : ex Passeport Jérémy"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Type : ex Passeport, Hôtel, Assurance..."
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            />

            <label className="file-picker-button" htmlFor="document-file-input">
              {documentFile ? '✅ Fichier sélectionné' : '📎 Choisir une photo ou un PDF'}
            </label>

            <input
              id="document-file-input"
              key={documentFileInputKey}
              ref={documentFileInputRef}
              className="file-input"
              type="file"
              accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.pdf"
              onClick={(e) => {
                e.target.value = ''
              }}
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setDocumentFile(file)

                setTimeout(() => {
                  if (documentFileInputRef.current) {
                    documentFileInputRef.current.value = ''
                  }

                  setDocumentFileInputKey(Date.now())
                }, 50)
              }}
            />

            <button onClick={addDocument} disabled={documentUploading}>
              {documentUploading ? 'Envoi en cours...' : 'Ajouter le document'}
            </button>
          </div>

          <div className="document-list">
            {filteredDocuments.length === 0 && <p>Aucun document pour {documentPerson}.</p>}

            {filteredDocuments.map((document) => (
              <div className="document-row" key={document.id}>
                <strong>📄 {document.document_name}</strong>
                <span>{document.document_type}</span>

                <div className="document-actions">
                  <button
                    className="open-document"
                    onClick={() => openDocument(document.file_url)}
                  >
                    Ouvrir
                  </button>

                  <button
                    className="delete-document"
                    onClick={() => deleteDocument(document)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'gallery' && (
        <section className="card gallery-card">
          <div className="gallery-header">
            <div>
              <h2>📸 Galerie photo</h2>
              <p className="muted-text">Souvenirs du voyage : <strong>{tripName}</strong></p>
            </div>

            <div className="gallery-counter">
              <strong>{photos.length}</strong>
              <span>{photos.length > 1 ? 'photos' : 'photo'}</span>
            </div>
          </div>

          <div className="gallery-upload-box">
            <label className="file-picker-button" htmlFor="photo-file-input">
              {photoFile ? '✅ Photo sélectionnée' : '📷 Choisir une photo'}
            </label>

            <input
              id="photo-file-input"
              key={photoFileInputKey}
              ref={photoFileInputRef}
              className="file-input"
              type="file"
              accept="image/*,.heic,.heif,.jpg,.jpeg,.png"
              onClick={(e) => {
                e.target.value = ''
              }}
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setPhotoFile(file)

                setTimeout(() => {
                  if (photoFileInputRef.current) {
                    photoFileInputRef.current.value = ''
                  }

                  setPhotoFileInputKey(Date.now())
                }, 50)
              }}
            />

            <input
              type="text"
              placeholder="Petit souvenir : ex Plage, restaurant, aquarium..."
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
            />

            <button onClick={addPhoto} disabled={photoUploading}>
              {photoUploading ? 'Envoi en cours...' : 'Ajouter à la galerie'}
            </button>
          </div>

          {photos.length === 0 && (
            <div className="empty-state">
              <strong>Aucune photo pour ce voyage.</strong>
              <p>Ajoute tes souvenirs ici, ils resteront classés dans ce voyage.</p>
            </div>
          )}

          {photos.length > 0 && (
            <div className="photo-grid premium-photo-grid">
              {photos.map((photo) => (
                <article className="photo-card premium-photo-card" key={photo.id}>
                  <button className="photo-preview-button" onClick={() => setSelectedPhoto(photo)}>
                    <img
                      src={getPhotoUrl(photo.photo_url)}
                      alt={photo.caption || 'Photo souvenir'}
                      className="gallery-thumbnail"
                    />
                    <span className="photo-open-hint">Agrandir</span>
                  </button>

                  <div className="photo-card-info">
                    <strong>{photo.caption || 'Photo souvenir'}</strong>
                    <small>{getPhotoDate(photo)}</small>
                  </div>

                  <button className="delete-photo-button" onClick={() => deletePhoto(photo)}>
                    Supprimer
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'places' && (
        <section className="card places-card">
          <h2>📍 Lieux favoris</h2>

          <div className="expense-form">
            <input
              type="text"
              placeholder="Nom : ex Hôtel, Aquarium..."
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Type : Hôtel, Restaurant, Plage..."
              value={placeType}
              onChange={(e) => setPlaceType(e.target.value)}
            />

            <input
              type="text"
              placeholder="Adresse ou lien Google Maps"
              value={placeAddress}
              onChange={(e) => setPlaceAddress(e.target.value)}
            />

            <button onClick={addPlace}>Ajouter le lieu</button>
          </div>

          <div className="document-list">
            {places.length === 0 && <p>Aucun lieu enregistré.</p>}

            {places.map((place) => (
              <div className="document-row" key={place.id}>
                <strong>📍 {place.name}</strong>
                <span>{place.type}</span>
                <p>{place.address}</p>

                <div className="document-actions">
                  <button className="open-document" onClick={() => openPlace(place)}>
                    Ouvrir Maps
                  </button>

                  <button className="delete-document" onClick={() => deletePlace(place.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'system' && (
        <section className="card system-card">
          <h2>⚙️ Système</h2>

          <div className="system-section">
            <h3>✈️ Voyage ouvert</h3>
            <div className="system-row">
              <strong>{selectedTrip?.trip_name || tripName}</strong>
              <span>{getTripDatesText()}</span>
            </div>
          </div>

          <div className="system-section">
            <h3>👤 Compte</h3>
            <div className="system-row">
              <strong>Email connecté</strong>
              <span>{session?.user?.email || 'Non disponible'}</span>
            </div>
            <div className="system-row">
              <strong>Statut</strong>
              <span>Connecté</span>
            </div>
          </div>

          <div className="system-section">
            <h3>📱 Application</h3>
            <div className="system-row">
              <strong>Nom de l’application</strong>
              <span>Travel Family</span>
            </div>
            <div className="system-row">
              <strong>Version</strong>
              <span>2.0.0 - Multi-voyages</span>
            </div>
            <div className="system-row">
              <strong>Mode d’installation</strong>
              <span>Compatible iPhone / PWA</span>
            </div>
          </div>

          <div className="system-section">
            <h3>💾 Sauvegarde</h3>
            <div className="system-row">
              <strong>Sauvegarde cloud</strong>
              <span>Activée avec Supabase</span>
            </div>
            <div className="system-row">
              <strong>Données synchronisées</strong>
              <span>Voyage, budget, valises, achats, lieux, documents et photos</span>
            </div>
          </div>

          <div className="system-section">
            <h3>🗑️ Données</h3>
            <button className="delete-person-button" onClick={resetCurrentTripData}>
              Réinitialiser ce voyage
            </button>
          </div>

          <div className="system-section">
            <h3>🚪 Session</h3>
            <button className="delete-person-button" onClick={signOut}>
              Se déconnecter
            </button>
          </div>
        </section>
      )}

      {selectedPhoto && (
        <div className="photo-modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setSelectedPhoto(null)}>×</button>
            <img src={getPhotoUrl(selectedPhoto.photo_url)} alt={selectedPhoto.caption || 'Photo souvenir'} />
            <div className="photo-modal-info">
              <strong>{selectedPhoto.caption || 'Photo souvenir'}</strong>
              <span>{getPhotoDate(selectedPhoto)}</span>
            </div>
            <div className="document-actions">
              <button className="open-document" onClick={() => openPhoto(selectedPhoto.photo_url)}>
                Ouvrir dans un nouvel onglet
              </button>
              <button className="delete-document" onClick={() => {
                deletePhoto(selectedPhoto)
                setSelectedPhoto(null)
              }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="side-menu-overlay" onClick={() => setMenuOpen(false)}>
          <aside className="side-menu" onClick={(e) => e.stopPropagation()}>
            <button className="close-menu" onClick={() => setMenuOpen(false)}>×</button>

            <h2>🌴 Travel Family</h2>

            {[
              ['home', '🏠', 'Accueil'],
              ['packing', '🧳', 'Valises'],
              ['shopping', '🛒', 'Achats'],
              ['planning', '📅', 'Planning'],
              ['budget', '💰', 'Budget'],
              ['documents', '📁', 'Documents'],
              ['gallery', '📸', 'Galerie'],
              ['places', '📍', 'Lieux'],
              ['system', '⚙️', 'Système'],
            ].map(([tab, icon, label]) => (
              <button
                key={tab}
                className={activeTab === tab ? 'side-menu-active' : ''}
                onClick={() => {
                  setActiveTab(tab)
                  setMenuOpen(false)
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}

            <button onClick={closeTrip}>
              <span>🌍</span>
              Retour à mes voyages
            </button>
          </aside>
        </div>
      )}
    </main>
  )
}

export default App
