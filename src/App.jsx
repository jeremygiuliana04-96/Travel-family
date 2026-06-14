import { useEffect, useState } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import Auth from './Auth.jsx'
import { supabase } from './supabase.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function ChangeMapView({ center, zoom = 13 }) {
  const map = useMap()

  useEffect(() => {
    if (center) map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}

const defaultPackingLists = {
  Famille: [],
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)

  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [travelDataId, setTravelDataId] = useState(null)

  const [tripName, setTripName] = useState('Mon voyage')
  const [tripIcon, setTripIcon] = useState('✈️')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')

  const [aiQuestion, setAiQuestion] = useState('')

  const [people, setPeople] = useState(['Famille'])
  const [selectedPerson, setSelectedPerson] = useState('Famille')
  const [newPersonName, setNewPersonName] = useState('')
  const [packingItemName, setPackingItemName] = useState('')
  const [packingLists, setPackingLists] = useState(defaultPackingLists)

  const [budget, setBudget] = useState(1500)
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

  const [startAddress, setStartAddress] = useState('')
  const [startPoint, setStartPoint] = useState(null)
  const [mapSearch, setMapSearch] = useState('')
  const [mapResult, setMapResult] = useState(null)
  const [mapLoading, setMapLoading] = useState(false)
  const [mapError, setMapError] = useState('')

  const [documents, setDocuments] = useState([])
  const [documentPerson, setDocumentPerson] = useState('Famille')
  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState('Passeport')
  const [documentFile, setDocumentFile] = useState(null)
  const [documentUploading, setDocumentUploading] = useState(false)

  const quickSuggestions = [
    '🍽️ Trouver un restaurant',
    '🏖️ Trouver une activité',
    '📅 Résumer ma journée',
    '🚗 Estimer un trajet',
    '💰 Calculer mes frais de déplacement',
    '👶 Activités pour les enfants',
    '📍 Que faire à proximité ?',
  ]

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
    if (session) {
      loadTravelData()
      loadDocuments()
    }
  }, [session])

  useEffect(() => {
    if (session && dataLoaded && travelDataId) saveTravelData()
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

  useEffect(() => {
    fetchWeather()
  }, [tripName])

  const currentPackingList = packingLists[selectedPerson] || []
  const filteredDocuments = documents.filter((doc) => doc.person_name === documentPerson)

  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0)
  const remaining = budget - totalSpent

  const allPackingItems = Object.values(packingLists).flat()
  const uncheckedPackingItems = allPackingItems.filter((item) => !item.checked)
  const checkedPackingItems = allPackingItems.filter((item) => item.checked)

  const packingProgress =
    allPackingItems.length === 0
      ? 0
      : Math.round((checkedPackingItems.length / allPackingItems.length) * 100)

  const boughtShoppingItems = shoppingList.filter((item) => item.bought)
  const missingShoppingItems = shoppingList.filter((item) => !item.bought)

  const shoppingProgress =
    shoppingList.length === 0
      ? 0
      : Math.round((boughtShoppingItems.length / shoppingList.length) * 100)

  const sortedActivities = [...activities].sort((a, b) => {
    return parseActivityDate(a.date) - parseActivityDate(b.date)
  })

  const nextActivity = sortedActivities.length > 0 ? sortedActivities[0] : null

  function resetAppState() {
    setTravelDataId(null)
    setTripName('Mon voyage')
    setTripIcon('✈️')
    setStartDate('')
    setEndDate('')
    setWeather(null)
    setWeatherError('')
    setAiQuestion('')
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
    setStartAddress('')
    setStartPoint(null)
    setMapSearch('')
    setMapResult(null)
    setMapError('')
    setDocuments([])
    setDocumentPerson('Famille')
    setDocumentName('')
    setDocumentType('Passeport')
    setDocumentFile(null)
  }

  function askAssistant(question) {
    const finalQuestion = question || aiQuestion
    if (!finalQuestion.trim()) return

    alert(`🤖 Assistant Travel Family\n\nQuestion : ${finalQuestion}`)
    setAiQuestion('')
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

  function getTripDatesText() {
    if (startDate && endDate) return `📅 Du ${formatDate(startDate)} au ${formatDate(endDate)}`
    if (startDate) return `📅 Départ le ${formatDate(startDate)}`
    if (endDate) return `📅 Retour le ${formatDate(endDate)}`
    return ''
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

    if (places.length > 0) {
      advice.push(`🗺️ Tu as ${places.length} lieu(x) enregistré(s) pour le voyage.`)
    } else {
      advice.push('🗺️ Ajoute ton hôtel, l’aéroport ou tes lieux favoris pour les retrouver vite.')
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
      setTripName(data.trip_name || 'Mon voyage')
      setTripIcon(data.trip_icon || '✈️')
      setStartDate(data.start_date || '')
      setEndDate(data.end_date || '')
      setPeople(data.people || ['Famille'])
      setPackingLists(data.packing_lists || defaultPackingLists)
      setBudget(Number(data.budget) || 0)
      setExpenses(data.expenses || [])
      setShoppingList(data.shopping_list || [])
      setActivities(data.activities || [])
      setPlaces(data.places || [])
      setSelectedPerson('Famille')
      setDocumentPerson('Famille')
    } else {
      const { data: newData } = await supabase
        .from('travel_data')
        .insert({
          user_id: session.user.id,
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
        })
        .select()
        .single()

      if (newData) setTravelDataId(newData.id)
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
      .eq('id', travelDataId)
  }

  async function loadDocuments() {
    const { data, error } = await supabase
      .from('travel_documents')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setDocuments(data || [])
  }

  async function addDocument() {
    if (!documentFile || documentName.trim() === '') return

    try {
      setDocumentUploading(true)

      const cleanFileName = documentFile.name.replaceAll(' ', '-')
      const filePath = `${session.user.id}/${Date.now()}-${cleanFileName}`

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
      setDocumentFile(null)
      await loadDocuments()
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

  async function resetCurrentAccountData() {
    const confirmReset = confirm(
      'Réinitialiser ce compte ? Toutes les données de ce compte seront effacées.'
    )

    if (!confirmReset || !session || !travelDataId) return

    const { data: docs } = await supabase
      .from('travel_documents')
      .select('*')
      .eq('user_id', session.user.id)

    const filePaths = (docs || []).map((document) => document.file_url)

    if (filePaths.length > 0) {
      await supabase.storage.from('travel-documents').remove(filePaths)
    }

    await supabase.from('travel_documents').delete().eq('user_id', session.user.id)

    await supabase
      .from('travel_data')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', travelDataId)

    resetAppState()
    await loadTravelData()
    await loadDocuments()
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

  async function searchAddress(query) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`
    )

    const data = await response.json()

    if (!data || data.length === 0) return null

    return {
      name: data[0].display_name.split(',')[0],
      address: data[0].display_name,
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
      countryCode: data[0].address?.country_code || '',
      country: data[0].address?.country || '',
      city:
        data[0].address?.city ||
        data[0].address?.town ||
        data[0].address?.village ||
        data[0].address?.municipality ||
        '',
    }
  }

  function useCurrentPosition() {
    if (!navigator.geolocation) {
      setMapError('La géolocalisation n’est pas disponible sur cet appareil.')
      return
    }

    setMapLoading(true)
    setMapError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartPoint({
          name: 'Ma position actuelle',
          address: 'Position GPS actuelle',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          countryCode: '',
          country: '',
          city: '',
        })
        setMapLoading(false)
      },
      () => {
        setMapError('Impossible de récupérer ta position.')
        setMapLoading(false)
      }
    )
  }

  async function defineStartAddress() {
    if (startAddress.trim() === '') return

    setMapLoading(true)
    setMapError('')

    try {
      const result = await searchAddress(startAddress)

      if (!result) {
        setMapError('Adresse de départ introuvable.')
        return
      }

      setStartPoint(result)
    } catch {
      setMapError('Erreur pendant la recherche de l’adresse.')
    } finally {
      setMapLoading(false)
    }
  }

  async function searchMapPlace() {
    if (mapSearch.trim() === '') return

    setMapLoading(true)
    setMapError('')
    setMapResult(null)

    try {
      const result = await searchAddress(mapSearch)

      if (!result) {
        setMapError('Lieu introuvable.')
        return
      }

      setMapResult({
        id: Date.now(),
        name: result.name,
        type: 'Lieu recherché',
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude,
        countryCode: result.countryCode,
        country: result.country,
        city: result.city,
      })
    } catch {
      setMapError('Erreur pendant la recherche du lieu.')
    } finally {
      setMapLoading(false)
    }
  }

  function addMapResultToPlaces() {
    if (!mapResult) return

    setPlaces([
      ...places,
      {
        ...mapResult,
        id: Date.now(),
      },
    ])

    setMapSearch('')
    setMapResult(null)
  }

  function getDistanceKm(destination) {
    if (!startPoint || !destination.latitude || !destination.longitude) return null

    const earthRadius = 6371
    const dLat = ((destination.latitude - startPoint.latitude) * Math.PI) / 180
    const dLon = ((destination.longitude - startPoint.longitude) * Math.PI) / 180
    const lat1 = (startPoint.latitude * Math.PI) / 180
    const lat2 = (destination.latitude * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.max(1, Math.round(earthRadius * c * 1.25))
  }

  function getLocalPriceSettings(destination) {
    const text = `${destination.address || ''} ${destination.countryCode || ''} ${destination.country || ''}`.toLowerCase()

    if (
      text.includes('gran canaria') ||
      text.includes('canarias') ||
      text.includes('canary') ||
      text.includes('españa') ||
      text.includes('spain') ||
      text.includes(' es ')
    ) {
      return {
        zone: 'Espagne / Canaries',
        taxiStart: 3.5,
        taxiKm: 1.35,
        busMin: 2,
        busMax: 6,
        fuelLiter: 1.6,
        consumption: 6.5,
      }
    }

    if (
      text.includes('belgique') ||
      text.includes('belgië') ||
      text.includes('belgium') ||
      text.includes(' be ')
    ) {
      return {
        zone: 'Belgique',
        taxiStart: 5,
        taxiKm: 2.4,
        busMin: 2.5,
        busMax: 5,
        fuelLiter: 1.75,
        consumption: 6.5,
      }
    }

    if (text.includes('france') || text.includes(' fr ')) {
      return {
        zone: 'France',
        taxiStart: 4,
        taxiKm: 1.8,
        busMin: 2,
        busMax: 5,
        fuelLiter: 1.8,
        consumption: 6.5,
      }
    }

    return {
      zone: 'Tarif moyen estimé',
      taxiStart: 4,
      taxiKm: 1.6,
      busMin: 2,
      busMax: 6,
      fuelLiter: 1.7,
      consumption: 6.5,
    }
  }

  function getTripCostEstimate(destination) {
    const distance = getDistanceKm(destination)
    if (!distance) return null

    const settings = getLocalPriceSettings(destination)
    const taxiMin = Math.round(settings.taxiStart + distance * settings.taxiKm * 0.9)
    const taxiMax = Math.round(settings.taxiStart + distance * settings.taxiKm * 1.2)
    const carFuel = Math.round(((distance / 100) * settings.consumption * settings.fuelLiter) * 10) / 10

    return {
      distance,
      zone: settings.zone,
      taxiMin,
      taxiMax,
      busMin: settings.busMin,
      busMax: settings.busMax,
      carFuel,
    }
  }

  function getRouteLink(destination, mode = 'driving') {
    const origin = startPoint
      ? `${startPoint.latitude},${startPoint.longitude}`
      : ''

    const destinationText =
      destination.latitude && destination.longitude
        ? `${destination.latitude},${destination.longitude}`
        : destination.address

    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destinationText)}&travelmode=${mode}`
  }

  function getAiMapAdvice(destination) {
    const estimate = getTripCostEstimate(destination)

    if (!startPoint) return 'Définis d’abord un point de départ pour obtenir une recommandation.'
    if (!estimate) return 'Estimation indisponible pour ce lieu.'

    if (estimate.distance <= 2) {
      return 'Le lieu semble proche. La marche peut être intéressante si le trajet est agréable et adapté à la famille.'
    }

    if (estimate.distance <= 8) {
      return 'Le taxi ou la voiture seront probablement les plus confortables. Le bus peut être intéressant si l’arrêt est proche.'
    }

    if (estimate.distance <= 25) {
      return 'Pour une famille, le taxi ou la voiture sont souvent plus simples. Le bus reste intéressant si tu veux réduire le budget.'
    }

    return 'Le trajet semble assez long. Il vaut mieux comparer l’itinéraire Google Maps avant de choisir entre voiture, taxi ou transport en commun.'
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

  function CostBox({ destination }) {
    if (!startPoint) {
      return (
        <div className="map-cost-box">
          <strong>💶 Estimation IA du trajet</strong>
          <p>Définis d’abord un point de départ pour calculer le coût.</p>
        </div>
      )
    }

    const estimate = getTripCostEstimate(destination)

    if (!estimate) {
      return (
        <div className="map-cost-box">
          <strong>💶 Estimation IA du trajet</strong>
          <p>Impossible de calculer l’estimation pour ce lieu.</p>
        </div>
      )
    }

    return (
      <div className="map-cost-box">
        <strong>💶 Estimation IA du trajet</strong>
        <p>📍 Zone détectée : {estimate.zone}</p>
        <p>📏 Distance estimée : {estimate.distance} km</p>
        <p>🚕 Taxi : ± {estimate.taxiMin} à {estimate.taxiMax} €</p>
        <p>🚗 Voiture : ± {estimate.carFuel} € de carburant</p>
        <p>🚌 Bus : ± {estimate.busMin} à {estimate.busMax} € / personne</p>
        <small>Estimation indicative, à vérifier avec l’itinéraire réel.</small>
      </div>
    )
  }

  if (sessionLoading || dataLoading) {
    return (
      <main className="app loading-screen">
        <section className="hero-card">
          <h1>✈️ Travel Family</h1>
          <p>Préparation de ton voyage...</p>
        </section>
      </main>
    )
  }

  if (!session) return <Auth />

  return (
    <main className="app">
      <section className="hero-card">
        <button className="menu-button" onClick={() => setMenuOpen(true)}>
          ☰
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

          <section className="card assistant-card">
            <h2>🤖 Assistant Travel Family</h2>
            <p className="assistant-intro">Posez une question sur votre voyage.</p>

            <div className="ai-search-box">
              <input
                type="text"
                placeholder="Ex : Que faire aujourd’hui ? Où manger ce soir ?"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') askAssistant()
                }}
              />

              <button onClick={() => askAssistant()}>
                Envoyer
              </button>
            </div>
          </section>

          <section className="card suggestions-card">
            <h2>✨ Suggestions rapides</h2>

            <div className="suggestions-grid">
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => askAssistant(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

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

            <input
              className="file-input"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setDocumentFile(e.target.files[0])}
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

      {activeTab === 'maps' && (
        <section className="card maps-card">
          <h2>🗺️ Cartes intelligentes</h2>

          <div className="map-start-box">
            <h3>📍 Point de départ</h3>

            <div className="map-actions">
              <button onClick={useCurrentPosition}>📍 Ma position actuelle</button>
              <button onClick={defineStartAddress}>🏨 Rechercher une adresse</button>
            </div>

            <input
              type="text"
              placeholder="Adresse de départ : hôtel, aéroport, appartement..."
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
            />

            {startPoint && (
              <div className="map-info-box">
                <strong>Point de départ défini :</strong>
                <p>{startPoint.name}</p>
                <span>{startPoint.address}</span>
              </div>
            )}
          </div>

          <div className="map-search-box">
            <h3>🔎 Recherche de lieu</h3>

            <input
              type="text"
              placeholder="Rechercher un lieu..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
            />

            <button onClick={searchMapPlace}>🔍 Rechercher</button>
          </div>

          {mapLoading && <p>Recherche en cours...</p>}
          {mapError && <p className="map-error">{mapError}</p>}

          <div className="travel-map">
            <MapContainer
              center={
                mapResult
                  ? [mapResult.latitude, mapResult.longitude]
                  : startPoint
                    ? [startPoint.latitude, startPoint.longitude]
                    : [20, 0]
              }
              zoom={mapResult || startPoint ? 13 : 2}
              scrollWheelZoom={false}
              style={{ height: '320px', width: '100%', borderRadius: '22px' }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapResult ? (
                <ChangeMapView center={[mapResult.latitude, mapResult.longitude]} zoom={13} />
              ) : startPoint ? (
                <ChangeMapView center={[startPoint.latitude, startPoint.longitude]} zoom={13} />
              ) : null}

              {startPoint && (
                <Marker position={[startPoint.latitude, startPoint.longitude]}>
                  <Popup>📍 {startPoint.name}</Popup>
                </Marker>
              )}

              {mapResult && (
                <Marker position={[mapResult.latitude, mapResult.longitude]}>
                  <Popup>{mapResult.name}</Popup>
                </Marker>
              )}

              {places
                .filter((place) => place.latitude && place.longitude)
                .map((place) => (
                  <Marker key={place.id} position={[place.latitude, place.longitude]}>
                    <Popup>{place.name}</Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          {mapResult && (
            <div className="document-row map-result-card">
              <strong>📍 {mapResult.name}</strong>
              <span>{mapResult.address}</span>

              <CostBox destination={mapResult} />

              <div className="ai-map-advice">
                <strong>🤖 Recommandation IA</strong>
                <p>{getAiMapAdvice(mapResult)}</p>
              </div>

              <div className="document-actions">
                <button className="open-document" onClick={addMapResultToPlaces}>
                  ➕ Ajouter à ma liste
                </button>

                <button
                  className="open-document"
                  onClick={() => window.open(getRouteLink(mapResult, 'driving'), '_blank')}
                >
                  🚗 Voiture / taxi
                </button>

                <button
                  className="open-document"
                  onClick={() => window.open(getRouteLink(mapResult, 'transit'), '_blank')}
                >
                  🚌 Bus
                </button>
              </div>
            </div>
          )}

          <div className="document-list">
            <h3>📌 Ma liste</h3>

            {places.length === 0 && <p>Aucun lieu ajouté.</p>}

            {places.map((place) => (
              <div className="document-row" key={place.id}>
                <strong>📍 {place.name}</strong>
                <span>{place.type}</span>
                <p>{place.address}</p>

                <CostBox destination={place} />

                <div className="ai-map-advice">
                  <strong>🤖 Analyse depuis le point de départ</strong>
                  <p>{getAiMapAdvice(place)}</p>
                </div>

                <div className="document-actions">
                  <button
                    className="open-document"
                    onClick={() => window.open(getRouteLink(place, 'driving'), '_blank')}
                  >
                    🚗 Voiture / taxi
                  </button>

                  <button
                    className="open-document"
                    onClick={() => window.open(getRouteLink(place, 'transit'), '_blank')}
                  >
                    🚌 Bus
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

      {activeTab === 'places' && (
        <section className="card places-card">
          <h2>🗺️ Lieux favoris</h2>

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

      {activeTab === 'destination' && (
        <section className="card">
          <h2>✈️ Ma destination</h2>

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

          <label className="field">
            Date de départ
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label className="field">
            Date de retour
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </section>
      )}

      {activeTab === 'system' && (
        <section className="card system-card">
          <h2>⚙️ Système</h2>

          <div className="system-section">
            <h3>👤 Compte</h3>
            <div className="system-row">
              <div>
                <strong>Email connecté</strong>
                <span>{session?.user?.email || 'Non disponible'}</span>
              </div>
            </div>
            <div className="system-row">
              <div>
                <strong>Statut</strong>
                <span>Connecté</span>
              </div>
            </div>
          </div>

          <div className="system-section">
            <h3>📱 Application</h3>
            <div className="system-row">
              <div>
                <strong>Nom de l’application</strong>
                <span>Travel Family</span>
              </div>
            </div>
            <div className="system-row">
              <div>
                <strong>Version</strong>
                <span>1.0.0</span>
              </div>
            </div>
            <div className="system-row">
              <div>
                <strong>Mode d’installation</strong>
                <span>Compatible iPhone / PWA</span>
              </div>
            </div>
          </div>

          <div className="system-section">
            <h3>💾 Sauvegarde</h3>
            <div className="system-row">
              <div>
                <strong>Sauvegarde cloud</strong>
                <span>Activée avec Supabase</span>
              </div>
            </div>
            <div className="system-row">
              <div>
                <strong>Données synchronisées</strong>
                <span>Voyage, budget, valises, achats, lieux et documents</span>
              </div>
            </div>
          </div>

          <div className="system-section">
            <h3>🎨 Apparence</h3>
            <div className="system-row">
              <div>
                <strong>Thème actuel</strong>
                <span>Tropical clair</span>
              </div>
            </div>
            <div className="system-row">
              <div>
                <strong>Interface</strong>
                <span>Optimisée mobile</span>
              </div>
            </div>
          </div>

          <div className="system-section">
            <h3>🗑️ Données</h3>
            <button className="delete-person-button" onClick={resetCurrentAccountData}>
              Réinitialiser mon voyage
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

      {menuOpen && (
        <div className="side-menu-overlay" onClick={() => setMenuOpen(false)}>
          <aside className="side-menu" onClick={(e) => e.stopPropagation()}>
            <button className="close-menu" onClick={() => setMenuOpen(false)}>×</button>

            <h2>🌴 Travel Family</h2>

            {[
              ['home', '🏠', 'Accueil'],
              ['packing', '🧳', 'Valises'],
              ['planning', '📅', 'Planning'],
              ['budget', '💰', 'Budget'],
              ['documents', '📁', 'Documents'],
              ['maps', '🗺️', 'Cartes'],
              ['places', '📍', 'Lieux'],
              ['destination', '✈️', 'Ma destination'],
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
          </aside>
        </div>
      )}
    </main>
  )
}

export default App
