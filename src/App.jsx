import { useEffect, useRef, useState } from 'react'
import './App.css'
import Auth from './Auth.jsx'
import { supabase } from './supabase.js'
import heic2any from 'heic2any'

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

const translations = {
  fr: {
    appTagline: 'Organise tous tes voyages de famille au même endroit.',
    preparingSpace: 'Préparation de ton espace voyage...',
    home: 'Accueil', trips: 'Mes voyages', newTrip: 'Nouveau voyage', addNewTrip: 'Ajouter un nouveau voyage',
    seeSavedTrips: 'Voir les voyages déjà enregistrés', createDestination: 'Créer une destination, des dates et une organisation',
    account: 'Compte', connectedEmail: 'Email connecté', unavailable: 'Non disponible', signOut: 'Se déconnecter',
    savedTrips: 'voyage(s) enregistré(s)', noTrip: 'Aucun voyage pour le moment.', addFirstTrip: 'Ajoute ton premier voyage pour commencer l’organisation.',
    open: 'Ouvrir', delete: 'Supprimer', cancel: 'Annuler', createTrip: 'Créer le voyage', destination: 'Destination', icon: 'Icône', departureDate: 'Date de départ', returnDate: 'Date de retour',
    destinationPlaceholder: 'Ex : Maspalomas 2026, Paris, Tenerife...', iconPlaceholder: 'Ex : 🌴 ✈️ 🏖️ 🏔️',
    backTrips: 'Mes voyages', holidays: 'Vacances', datesToDefine: '📅 Dates à définir', departureOn: '📅 Départ le', returnOn: '📅 Retour le', fromTo: '📅 Du', to: 'au',
    weatherTitle: 'Météo de la destination', loadingWeather: 'Chargement de la météo...', refreshWeather: 'Actualiser météo', feelsLike: 'ressenti', wind: 'Vent', humidity: 'Humidité', weatherNotFound: 'Destination introuvable pour la météo', weatherImpossible: 'Impossible de charger la météo',
    assistant: 'Assistant voyage', nextActivity: 'Prochaine activité', seePlanning: 'Voir le planning', addActivity: 'Ajouter une activité', noActivityYet: 'Aucune activité prévue pour le moment.', noActivityPlanned: 'Aucune activité prévue.',
    packing: 'Valises', preparation: 'Préparation', remaining: 'Restant', addPersonPlaceholder: 'Ajouter une personne : ex Jean', addPerson: 'Ajouter une personne', deletePerson: 'Supprimer', takeFor: 'À prendre pour', add: 'Ajouter', noObjectFor: 'Aucun objet pour',
    shopping: 'Achats', shoppingTitle: 'Achats avant départ', bought: 'Acheté', shoppingPlaceholder: 'Ex : Crème solaire, brassards, lunettes...', noShopping: 'Aucun achat à prévoir pour le moment.',
    planning: 'Planning', datePlaceholder: 'Date : ex 29 juin', activityPlaceholder: 'Activité : ex Restaurant',
    budget: 'Budget', plannedBudget: 'Budget prévu', spent: 'Dépensé', expensePlaceholder: 'Ex : Restaurant', amount: 'Montant', noExpense: 'Aucune dépense enregistrée.',
    documents: 'Documents', vault: 'Coffre-fort Voyage', documentNamePlaceholder: 'Nom du document : ex Passeport de Jean', documentTypePlaceholder: 'Type : ex Passeport, Hôtel, Assurance...', fileSelected: '✅ Fichier sélectionné', chooseFile: '📎 Choisir une photo ou un PDF', uploading: 'Envoi en cours...', addDocument: 'Ajouter le document', noDocumentFor: 'Aucun document pour',
    gallery: 'Galerie', galleryTitle: 'Galerie photo', tripMemories: 'Souvenirs du voyage', photos: 'photos', photo: 'photo', photoSelected: '✅ Photo sélectionnée', choosePhoto: '📷 Choisir une photo', captionPlaceholder: 'Petit souvenir : ex Plage, restaurant, aquarium...', addGallery: 'Ajouter à la galerie', noPhotoTrip: 'Aucune photo pour ce voyage.', addMemoriesHere: 'Ajoute tes souvenirs ici, ils resteront classés dans ce voyage.', enlarge: 'Agrandir', memoryPhoto: 'Photo souvenir', openNewTab: 'Ouvrir dans un nouvel onglet',
    places: 'Lieux', favoritePlaces: 'Lieux favoris', placeNamePlaceholder: 'Nom : ex Hôtel, Aquarium...', placeTypePlaceholder: 'Type : Hôtel, Restaurant, Plage...', addressPlaceholder: 'Adresse ou lien Google Maps', addPlace: 'Ajouter le lieu', noPlace: 'Aucun lieu enregistré.', openMaps: 'Ouvrir Maps',
    system: 'Système', openTrip: 'Voyage ouvert', status: 'Statut', connected: 'Connecté', application: 'Application', appName: 'Nom de l’application', version: 'Version', installMode: 'Mode d’installation', iphoneCompatible: 'Compatible iPhone / PWA', save: 'Sauvegarde', cloudSave: 'Sauvegarde cloud', enabledSupabase: 'Activée avec Supabase', syncedData: 'Données synchronisées', syncedDataText: 'Voyage, budget, valises, achats, lieux, documents et photos', data: 'Données', resetTrip: 'Réinitialiser ce voyage', session: 'Session', language: 'Langue', chooseLanguage: 'Choisis la langue de l’application', french: 'Français', english: 'English', spanish: 'Español', returnToTrips: 'Retour à mes voyages',
    today: 'Aujourd’hui', tomorrow: 'Demain', daysIn: 'Dans', days: 'jours', pastActivity: 'Activité déjà passée', checkDate: 'Date à vérifier dans le planning.',
    alertAddTripName: 'Ajoute au moins le nom du voyage.', alertCreateTripImpossible: 'Impossible de créer le voyage.',
    confirmDeleteTrip: 'Supprimer le voyage', confirmDeleteDocument: 'Supprimer', confirmDeletePhoto: 'Supprimer cette photo ?', resetConfirm: 'Réinitialiser ce voyage ? Les valises, achats, planning, budget, lieux, documents et photos de ce voyage seront effacés.',
    uploadFileImpossible: "Impossible d'envoyer le fichier.", saveDocumentImpossible: "Impossible d'enregistrer le document.", openDocumentImpossible: "Impossible d'ouvrir le document.", openPhotoImpossible: "Impossible d'ouvrir la photo.", notImage: 'Le fichier sélectionné n’est pas une image.', compressionImpossible: 'Impossible de compresser la photo.', jpgTry: 'Format photo non compatible. Essaie avec une photo JPG.', compressionUploadImpossible: 'Impossible de compresser ou d’envoyer la photo.', noPhotoSelected: 'Aucune photo sélectionnée.',
    adviceDepartureIn: '✈️ Départ dans', adviceDepartureTomorrow: '✈️ Départ demain ! Dernière vérification des valises.', adviceDepartureToday: '✈️ C’est le jour du départ ! Vérifie documents, valises et trajet.', adviceTripStarted: '🌴 Le voyage a déjà commencé. Profite bien !', adviceShoppingLeft: '🛒 Il reste', adviceShoppingLeftEnd: 'achat(s) à faire avant le départ.', adviceShoppingDone: '🛒 Tous les achats avant départ sont faits.', adviceDocs: '📁 Coffre-fort :', adviceDocsEnd: 'document(s) enregistré(s).', adviceDocsEmpty: '📁 Pense à ajouter les documents importants dans le coffre-fort.', advicePhotos: '📸 Galerie :', advicePhotosEnd: 'photo(s) enregistrée(s) pour ce voyage.', advicePhotosEmpty: '📸 Tu pourras ajouter les photos souvenirs dans la galerie du voyage.', adviceGoodWeather: '☀️ Temps idéal pour prévoir une activité extérieure ou une sortie plage.', adviceBadWeather: '🌧️ Météo moins favorable : une activité intérieure serait plus confortable.', adviceOkWeather: '🌤️ Météo correcte : garde une activité flexible selon l’énergie de la famille.', advicePackingLeft: '🧳 Il reste', advicePackingLeftEnd: 'objet(s) non cochés dans les valises.', advicePackingReady: '✅ Toutes les valises sont prêtes. Nickel pour partir tranquille.', adviceBudgetOver: '⚠️ Le budget est dépassé de', adviceBudgetWatch: '💰 Il reste', adviceBudgetWatchEnd: '€. Budget à surveiller.', adviceBudgetLeft: '💰 Budget restant :', adviceBudgetLeftEnd: '€. Tu as encore une bonne marge.', adviceNextActivity: '📅 Prochaine activité prévue :', adviceNoPlanning: '📅 Aucun planning prévu pour le moment. Tu peux ajouter une activité simple.'
  },
  en: {
    appTagline: 'Organize all your family trips in one place.', preparingSpace: 'Preparing your travel space...', home: 'Home', trips: 'My trips', newTrip: 'New trip', addNewTrip: 'Add a new trip', seeSavedTrips: 'View saved trips', createDestination: 'Create a destination, dates and organization', account: 'Account', connectedEmail: 'Connected email', unavailable: 'Unavailable', signOut: 'Sign out', savedTrips: 'saved trip(s)', noTrip: 'No trip yet.', addFirstTrip: 'Add your first trip to start organizing.', open: 'Open', delete: 'Delete', cancel: 'Cancel', createTrip: 'Create trip', destination: 'Destination', icon: 'Icon', departureDate: 'Departure date', returnDate: 'Return date', destinationPlaceholder: 'E.g. Maspalomas 2026, Paris, Tenerife...', iconPlaceholder: 'E.g. 🌴 ✈️ 🏖️ 🏔️', backTrips: 'My trips', holidays: 'Holiday', datesToDefine: '📅 Dates to define', departureOn: '📅 Departure on', returnOn: '📅 Return on', fromTo: '📅 From', to: 'to', weatherTitle: 'Destination weather', loadingWeather: 'Loading weather...', refreshWeather: 'Refresh weather', feelsLike: 'feels like', wind: 'Wind', humidity: 'Humidity', weatherNotFound: 'Destination not found for weather', weatherImpossible: 'Unable to load weather', assistant: 'Travel assistant', nextActivity: 'Next activity', seePlanning: 'View planning', addActivity: 'Add activity', noActivityYet: 'No activity planned yet.', noActivityPlanned: 'No activity planned.', packing: 'Packing', preparation: 'Preparation', remaining: 'Remaining', addPersonPlaceholder: 'Add a person: e.g. Eva', addPerson: 'Add person', deletePerson: 'Delete', takeFor: 'To pack for', add: 'Add', noObjectFor: 'No item for', shopping: 'Shopping', shoppingTitle: 'Pre-departure shopping', bought: 'Bought', shoppingPlaceholder: 'E.g. Sunscreen, armbands, sunglasses...', noShopping: 'No shopping planned yet.', planning: 'Planning', datePlaceholder: 'Date: e.g. June 29', activityPlaceholder: 'Activity: e.g. Restaurant', budget: 'Budget', plannedBudget: 'Planned budget', spent: 'Spent', expensePlaceholder: 'E.g. Restaurant', amount: 'Amount', noExpense: 'No expense recorded.', documents: 'Documents', vault: 'Travel vault', documentNamePlaceholder: 'Document name: e.g. Jeremy passport', documentTypePlaceholder: 'Type: e.g. Passport, Hotel, Insurance...', fileSelected: '✅ File selected', chooseFile: '📎 Choose a photo or PDF', uploading: 'Uploading...', addDocument: 'Add document', noDocumentFor: 'No document for', gallery: 'Gallery', galleryTitle: 'Photo gallery', tripMemories: 'Trip memories', photos: 'photos', photo: 'photo', photoSelected: '✅ Photo selected', choosePhoto: '📷 Choose a photo', captionPlaceholder: 'Small memory: e.g. Beach, restaurant, aquarium...', addGallery: 'Add to gallery', noPhotoTrip: 'No photo for this trip.', addMemoriesHere: 'Add your memories here; they will stay organized in this trip.', enlarge: 'Enlarge', memoryPhoto: 'Travel memory', openNewTab: 'Open in a new tab', places: 'Places', favoritePlaces: 'Favorite places', placeNamePlaceholder: 'Name: e.g. Hotel, Aquarium...', placeTypePlaceholder: 'Type: Hotel, Restaurant, Beach...', addressPlaceholder: 'Address or Google Maps link', addPlace: 'Add place', noPlace: 'No saved place.', openMaps: 'Open Maps', system: 'Settings', openTrip: 'Open trip', status: 'Status', connected: 'Connected', application: 'Application', appName: 'Application name', version: 'Version', installMode: 'Installation mode', iphoneCompatible: 'iPhone / PWA compatible', save: 'Backup', cloudSave: 'Cloud backup', enabledSupabase: 'Enabled with Supabase', syncedData: 'Synced data', syncedDataText: 'Trip, budget, packing, shopping, places, documents and photos', data: 'Data', resetTrip: 'Reset this trip', session: 'Session', language: 'Language', chooseLanguage: 'Choose the app language', french: 'Français', english: 'English', spanish: 'Español', returnToTrips: 'Back to my trips', today: 'Today', tomorrow: 'Tomorrow', daysIn: 'In', days: 'days', pastActivity: 'Activity already passed', checkDate: 'Date to check in planning.', alertAddTripName: 'Add at least the trip name.', alertCreateTripImpossible: 'Unable to create trip.', confirmDeleteTrip: 'Delete trip', confirmDeleteDocument: 'Delete', confirmDeletePhoto: 'Delete this photo?', resetConfirm: 'Reset this trip? Packing lists, shopping, planning, budget, places, documents and photos for this trip will be deleted.', uploadFileImpossible: 'Unable to upload the file.', saveDocumentImpossible: 'Unable to save the document.', openDocumentImpossible: 'Unable to open the document.', openPhotoImpossible: 'Unable to open the photo.', notImage: 'The selected file is not an image.', compressionImpossible: 'Unable to compress the photo.', jpgTry: 'Photo format not compatible. Try with a JPG photo.', compressionUploadImpossible: 'Unable to compress or upload the photo.', noPhotoSelected: 'No photo selected.', adviceDepartureIn: '✈️ Departure in', adviceDepartureTomorrow: '✈️ Departure tomorrow! Last check for packing.', adviceDepartureToday: '✈️ Today is departure day! Check documents, bags and route.', adviceTripStarted: '🌴 The trip has already started. Enjoy!', adviceShoppingLeft: '🛒', adviceShoppingLeftEnd: 'shopping item(s) left before departure.', adviceShoppingDone: '🛒 All pre-departure shopping is done.', adviceDocs: '📁 Vault:', adviceDocsEnd: 'document(s) saved.', adviceDocsEmpty: '📁 Remember to add important documents to the vault.', advicePhotos: '📸 Gallery:', advicePhotosEnd: 'photo(s) saved for this trip.', advicePhotosEmpty: '📸 You can add travel memories to the trip gallery.', adviceGoodWeather: '☀️ Great weather for an outdoor activity or beach outing.', adviceBadWeather: '🌧️ Less favorable weather: an indoor activity would be more comfortable.', adviceOkWeather: '🌤️ Decent weather: keep the activity flexible depending on the family’s energy.', advicePackingLeft: '🧳', advicePackingLeftEnd: 'unchecked item(s) left in the packing lists.', advicePackingReady: '✅ All bags are ready. Perfect for a stress-free departure.', adviceBudgetOver: '⚠️ Budget exceeded by', adviceBudgetWatch: '💰', adviceBudgetWatchEnd: '€ left. Keep an eye on the budget.', adviceBudgetLeft: '💰 Remaining budget:', adviceBudgetLeftEnd: '€. You still have a good margin.', adviceNextActivity: '📅 Next planned activity:', adviceNoPlanning: '📅 No planning yet. You can add a simple activity.'
  },
  es: {
    appTagline: 'Organiza todos tus viajes familiares en un solo lugar.', preparingSpace: 'Preparando tu espacio de viaje...', home: 'Inicio', trips: 'Mis viajes', newTrip: 'Nuevo viaje', addNewTrip: 'Añadir un nuevo viaje', seeSavedTrips: 'Ver viajes guardados', createDestination: 'Crear un destino, fechas y organización', account: 'Cuenta', connectedEmail: 'Correo conectado', unavailable: 'No disponible', signOut: 'Cerrar sesión', savedTrips: 'viaje(s) guardado(s)', noTrip: 'No hay viajes por ahora.', addFirstTrip: 'Añade tu primer viaje para empezar la organización.', open: 'Abrir', delete: 'Eliminar', cancel: 'Cancelar', createTrip: 'Crear viaje', destination: 'Destino', icon: 'Icono', departureDate: 'Fecha de salida', returnDate: 'Fecha de regreso', destinationPlaceholder: 'Ej.: Maspalomas 2026, París, Tenerife...', iconPlaceholder: 'Ej.: 🌴 ✈️ 🏖️ 🏔️', backTrips: 'Mis viajes', holidays: 'Vacaciones', datesToDefine: '📅 Fechas por definir', departureOn: '📅 Salida el', returnOn: '📅 Regreso el', fromTo: '📅 Del', to: 'al', weatherTitle: 'Tiempo del destino', loadingWeather: 'Cargando el tiempo...', refreshWeather: 'Actualizar tiempo', feelsLike: 'sensación', wind: 'Viento', humidity: 'Humedad', weatherNotFound: 'Destino no encontrado para el tiempo', weatherImpossible: 'No se puede cargar el tiempo', assistant: 'Asistente de viaje', nextActivity: 'Próxima actividad', seePlanning: 'Ver planificación', addActivity: 'Añadir actividad', noActivityYet: 'No hay actividad prevista por ahora.', noActivityPlanned: 'No hay actividad prevista.', packing: 'Maletas', preparation: 'Preparación', remaining: 'Restante', addPersonPlaceholder: 'Añadir una persona: ej. Eva', addPerson: 'Añadir persona', deletePerson: 'Eliminar', takeFor: 'Para llevar para', add: 'Añadir', noObjectFor: 'Ningún objeto para', shopping: 'Compras', shoppingTitle: 'Compras antes de salir', bought: 'Comprado', shoppingPlaceholder: 'Ej.: Protector solar, manguitos, gafas...', noShopping: 'No hay compras previstas por ahora.', planning: 'Planificación', datePlaceholder: 'Fecha: ej. 29 de junio', activityPlaceholder: 'Actividad: ej. Restaurante', budget: 'Presupuesto', plannedBudget: 'Presupuesto previsto', spent: 'Gastado', expensePlaceholder: 'Ej.: Restaurante', amount: 'Importe', noExpense: 'No hay gastos registrados.', documents: 'Documentos', vault: 'Caja fuerte de viaje', documentNamePlaceholder: 'Nombre del documento: ej. Pasaporte Jeremy', documentTypePlaceholder: 'Tipo: ej. Pasaporte, Hotel, Seguro...', fileSelected: '✅ Archivo seleccionado', chooseFile: '📎 Elegir una foto o PDF', uploading: 'Enviando...', addDocument: 'Añadir documento', noDocumentFor: 'Ningún documento para', gallery: 'Galería', galleryTitle: 'Galería de fotos', tripMemories: 'Recuerdos del viaje', photos: 'fotos', photo: 'foto', photoSelected: '✅ Foto seleccionada', choosePhoto: '📷 Elegir una foto', captionPlaceholder: 'Pequeño recuerdo: ej. Playa, restaurante, acuario...', addGallery: 'Añadir a la galería', noPhotoTrip: 'No hay fotos para este viaje.', addMemoriesHere: 'Añade tus recuerdos aquí; quedarán guardados en este viaje.', enlarge: 'Ampliar', memoryPhoto: 'Foto recuerdo', openNewTab: 'Abrir en una nueva pestaña', places: 'Lugares', favoritePlaces: 'Lugares favoritos', placeNamePlaceholder: 'Nombre: ej. Hotel, Acuario...', placeTypePlaceholder: 'Tipo: Hotel, Restaurante, Playa...', addressPlaceholder: 'Dirección o enlace de Google Maps', addPlace: 'Añadir lugar', noPlace: 'Ningún lugar guardado.', openMaps: 'Abrir Maps', system: 'Sistema', openTrip: 'Viaje abierto', status: 'Estado', connected: 'Conectado', application: 'Aplicación', appName: 'Nombre de la aplicación', version: 'Versión', installMode: 'Modo de instalación', iphoneCompatible: 'Compatible iPhone / PWA', save: 'Copia de seguridad', cloudSave: 'Copia en la nube', enabledSupabase: 'Activada con Supabase', syncedData: 'Datos sincronizados', syncedDataText: 'Viaje, presupuesto, maletas, compras, lugares, documentos y fotos', data: 'Datos', resetTrip: 'Reiniciar este viaje', session: 'Sesión', language: 'Idioma', chooseLanguage: 'Elige el idioma de la aplicación', french: 'Français', english: 'English', spanish: 'Español', returnToTrips: 'Volver a mis viajes', today: 'Hoy', tomorrow: 'Mañana', daysIn: 'En', days: 'días', pastActivity: 'Actividad ya pasada', checkDate: 'Fecha a revisar en la planificación.', alertAddTripName: 'Añade al menos el nombre del viaje.', alertCreateTripImpossible: 'No se puede crear el viaje.', confirmDeleteTrip: 'Eliminar el viaje', confirmDeleteDocument: 'Eliminar', confirmDeletePhoto: '¿Eliminar esta foto?', resetConfirm: '¿Reiniciar este viaje? Se borrarán maletas, compras, planificación, presupuesto, lugares, documentos y fotos de este viaje.', uploadFileImpossible: 'No se puede enviar el archivo.', saveDocumentImpossible: 'No se puede guardar el documento.', openDocumentImpossible: 'No se puede abrir el documento.', openPhotoImpossible: 'No se puede abrir la foto.', notImage: 'El archivo seleccionado no es una imagen.', compressionImpossible: 'No se puede comprimir la foto.', jpgTry: 'Formato de foto no compatible. Prueba con una foto JPG.', compressionUploadImpossible: 'No se puede comprimir o enviar la foto.', noPhotoSelected: 'No hay foto seleccionada.', adviceDepartureIn: '✈️ Salida en', adviceDepartureTomorrow: '✈️ ¡Salida mañana! Última revisión de maletas.', adviceDepartureToday: '✈️ ¡Hoy es el día de salida! Revisa documentos, maletas y trayecto.', adviceTripStarted: '🌴 El viaje ya ha comenzado. ¡Disfruta!', adviceShoppingLeft: '🛒 Quedan', adviceShoppingLeftEnd: 'compra(s) antes de salir.', adviceShoppingDone: '🛒 Todas las compras antes de salir están hechas.', adviceDocs: '📁 Caja fuerte:', adviceDocsEnd: 'documento(s) guardado(s).', adviceDocsEmpty: '📁 Piensa en añadir los documentos importantes a la caja fuerte.', advicePhotos: '📸 Galería:', advicePhotosEnd: 'foto(s) guardada(s) para este viaje.', advicePhotosEmpty: '📸 Podrás añadir recuerdos en la galería del viaje.', adviceGoodWeather: '☀️ Tiempo ideal para una actividad exterior o playa.', adviceBadWeather: '🌧️ Tiempo menos favorable: una actividad interior sería más cómoda.', adviceOkWeather: '🌤️ Tiempo correcto: mantén una actividad flexible según la energía de la familia.', advicePackingLeft: '🧳 Quedan', advicePackingLeftEnd: 'objeto(s) sin marcar en las maletas.', advicePackingReady: '✅ Todas las maletas están listas. Perfecto para salir tranquilo.', adviceBudgetOver: '⚠️ Presupuesto superado por', adviceBudgetWatch: '💰 Quedan', adviceBudgetWatchEnd: '€. Hay que vigilar el presupuesto.', adviceBudgetLeft: '💰 Presupuesto restante:', adviceBudgetLeftEnd: '€. Todavía tienes buen margen.', adviceNextActivity: '📅 Próxima actividad prevista:', adviceNoPlanning: '📅 No hay planificación por ahora. Puedes añadir una actividad simple.'
  },
}

function getSavedLanguage() {
  if (typeof window === 'undefined') return 'fr'
  return localStorage.getItem('travel-family-language') || 'fr'
}


function getSavedAppearance() {
  if (typeof window === 'undefined') return 'tropical'
  return localStorage.getItem('travel-family-appearance') || 'tropical'
}

const appearanceLabels = {
  fr: {
    title: 'Apparence',
    description: 'Choisis le style visuel de l’application',
    current: 'Style actuel',
    tropical: 'Classique tropical',
    premium: 'Premium sable',
    ocean: 'Bleu océan',
    dark: 'Mode sombre',
    minimal: 'Minimal clair',
  },
  en: {
    title: 'Appearance',
    description: 'Choose the visual style of the app',
    current: 'Current style',
    tropical: 'Classic tropical',
    premium: 'Premium sand',
    ocean: 'Ocean blue',
    dark: 'Dark mode',
    minimal: 'Light minimal',
  },
  es: {
    title: 'Apariencia',
    description: 'Elige el estilo visual de la aplicación',
    current: 'Estilo actual',
    tropical: 'Tropical clásico',
    premium: 'Arena premium',
    ocean: 'Azul océano',
    dark: 'Modo oscuro',
    minimal: 'Minimal claro',
  },
}

const appearanceOptions = ['tropical', 'premium', 'ocean', 'dark', 'minimal']

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [mainView, setMainView] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [language, setLanguage] = useState(getSavedLanguage)
  const [appearance, setAppearance] = useState(getSavedAppearance)
  const t = translations[language] || translations.fr
  const appearanceText = appearanceLabels[language] || appearanceLabels.fr

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
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoUploadProgress, setPhotoUploadProgress] = useState('')
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
    localStorage.setItem('travel-family-language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('travel-family-appearance', appearance)

    if (typeof document !== 'undefined') {
      document.body.classList.remove(
        'theme-tropical',
        'theme-premium',
        'theme-ocean',
        'theme-dark',
        'theme-minimal'
      )
      document.body.classList.add(`theme-${appearance}`)
    }
  }, [appearance])

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
    setPhotoFiles([])
    setPhotoUploadProgress('')

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
    setPhotoFiles([])
    setPhotoUploadProgress('')
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
    return new Date(dateValue).toLocaleDateString(language === 'en' ? 'en-GB' : language === 'es' ? 'es-ES' : 'fr-BE')
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

    if (tripStart && tripEnd) return `${t.fromTo} ${formatDate(tripStart)} ${t.to} ${formatDate(tripEnd)}`
    if (tripStart) return `${t.departureOn} ${formatDate(tripStart)}`
    if (tripEnd) return `${t.returnOn} ${formatDate(tripEnd)}`
    return t.datesToDefine
  }

  function getActivityCountdownText(activity) {
    if (!activity) return ''

    const activityTime = parseActivityDate(activity.date)
    if (activityTime === Number.MAX_SAFE_INTEGER) return t.checkDate

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days = Math.ceil((activityTime - today.getTime()) / (1000 * 60 * 60 * 24))

    if (days > 1) return `${t.daysIn} ${days} ${t.days}`
    if (days === 1) return t.tomorrow
    if (days === 0) return t.today
    return t.pastActivity
  }

  function getAssistantAdvice() {
    const advice = []
    const daysUntilStart = getDaysUntilStart()

    if (daysUntilStart !== null) {
      if (daysUntilStart > 1) advice.push(`${t.adviceDepartureIn} ${daysUntilStart} ${t.days}.`)
      else if (daysUntilStart === 1) advice.push(t.adviceDepartureTomorrow)
      else if (daysUntilStart === 0) advice.push(t.adviceDepartureToday)
      else advice.push(t.adviceTripStarted)
    }

    if (missingShoppingItems.length > 0) {
      advice.push(`${t.adviceShoppingLeft} ${missingShoppingItems.length} ${t.adviceShoppingLeftEnd}`)
    } else if (shoppingList.length > 0) {
      advice.push(t.adviceShoppingDone)
    }

    if (documents.length > 0) {
      advice.push(`${t.adviceDocs} ${documents.length} ${t.adviceDocsEnd}`)
    } else {
      advice.push(t.adviceDocsEmpty)
    }

    if (photos.length > 0) {
      advice.push(`${t.advicePhotos} ${photos.length} ${t.advicePhotosEnd}`)
    } else {
      advice.push(t.advicePhotosEmpty)
    }

    if (weather) {
      if (weather.temperature >= 27 && weather.wind <= 25) {
        advice.push(t.adviceGoodWeather)
      } else if (weather.temperature <= 20 || weather.code >= 51) {
        advice.push(t.adviceBadWeather)
      } else {
        advice.push(t.adviceOkWeather)
      }
    }

    if (uncheckedPackingItems.length > 0) {
      advice.push(`${t.advicePackingLeft} ${uncheckedPackingItems.length} ${t.advicePackingLeftEnd}`)
    } else if (allPackingItems.length > 0) {
      advice.push(t.advicePackingReady)
    }

    if (budget > 0) {
      if (remaining < 0) advice.push(`${t.adviceBudgetOver} ${Math.abs(remaining)} €.`)
      else if (remaining <= budget * 0.2) advice.push(`${t.adviceBudgetWatch} ${remaining} ${t.adviceBudgetWatchEnd}`)
      else advice.push(`${t.adviceBudgetLeft} ${remaining} ${t.adviceBudgetLeftEnd}`)
    }

    if (nextActivity) {
      advice.push(`${t.adviceNextActivity} ${nextActivity.name} (${nextActivity.date}).`)
    } else {
      advice.push(t.adviceNoPlanning)
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
      alert(t.alertAddTripName)
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
      alert(t.alertCreateTripImpossible)
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
    const confirmDelete = confirm(`${t.confirmDeleteTrip} "${trip.trip_name}" ?`)
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
    const confirmDelete = confirm(`${t.confirmDeleteDocument} ${document.document_name} ?`)
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

  async function compressPhoto(file, maxWidth = 1000, quality = 0.55) {
  if (!file) throw new Error('Aucune photo sélectionnée.')

  let imageFile = file

  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')

  if (isHeic) {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality,
    })

    imageFile = new File(
      [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
      `${Date.now()}-photo-converted.jpg`,
      { type: 'image/jpeg' }
    )
  }

  return new Promise((resolve, reject) => {
    if (!imageFile.type?.startsWith('image/')) {
      reject(new Error('Le fichier sélectionné n’est pas une image.'))
      return
    }

    const image = new Image()
    const objectUrl = URL.createObjectURL(imageFile)

    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width)
      const width = Math.round(image.width * scale)
      const height = Math.round(image.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl)

          if (!blob) {
            reject(new Error('Impossible de compresser la photo.'))
            return
          }

          resolve(
            new File([blob], `${Date.now()}-photo-voyage.jpg`, {
              type: 'image/jpeg',
            })
          )
        },
        'image/jpeg',
        quality
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Format photo non compatible. Essaie avec une photo JPG.'))
    }

    image.src = objectUrl
  })
}

  async function addPhoto() {
    const filesToUpload = photoFiles.length > 0 ? photoFiles : photoFile ? [photoFile] : []
    if (!selectedTripId || filesToUpload.length === 0) return

    try {
      setPhotoUploading(true)

      for (let index = 0; index < filesToUpload.length; index += 1) {
        const file = filesToUpload[index]
        setPhotoUploadProgress(`${index + 1}/${filesToUpload.length}`)

        const compressedPhoto = await compressPhoto(file)
        const cleanFileName = compressedPhoto.name.replaceAll(' ', '-')
        const filePath = `${session.user.id}/${selectedTripId}/${Date.now()}-${index}-${cleanFileName}`

        const { error: uploadError } = await supabase.storage
          .from('travel-photos')
          .upload(filePath, compressedPhoto, {
            contentType: compressedPhoto.type || 'image/jpeg',
            upsert: false,
          })

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
      }

      setPhotoCaption('')
      resetPhotoFileInput()
      await loadPhotos()
      resetPhotoFileInput()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Impossible de compresser ou d’envoyer la photo.')
    } finally {
      setPhotoUploading(false)
      setPhotoUploadProgress('')
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
    const confirmDelete = confirm(t.confirmDeletePhoto)
    if (!confirmDelete) return

    await supabase.storage.from('travel-photos').remove([photo.photo_url])
    await supabase.from('travel_photos').delete().eq('id', photo.id)

    await loadPhotos()
  }

  async function resetCurrentTripData() {
    const confirmReset = confirm(
      t.resetConfirm
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
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=${language}&format=json`
      )

      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        setWeather(null)
        setWeatherError(t.weatherNotFound)
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
      setWeatherError(t.weatherImpossible)
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
      <main className={`app theme-${appearance} loading-screen`}>
        <section className="hero-card">
          <h1>✈️ Travel Family</h1>
          <p>{t.preparingSpace}</p>
        </section>
      </main>
    )
  }

  if (!session) return <Auth />

  if (mainView === 'dashboard') {
    return (
      <main className={`app theme-${appearance}`}>
        <section className="hero-card">
          <h1>✈️ Travel Family</h1>
          <p>{t.appTagline}</p>
        </section>

        <section className="card dashboard-card">
          <h2>🌴 {t.home}</h2>

          <div className="dashboard-actions">
            <button onClick={() => setMainView('trips')}>
              <span>🌍</span>
              <strong>{t.trips}</strong>
              <small>{t.seeSavedTrips}</small>
            </button>

            <button onClick={() => setMainView('newTrip')}>
              <span>➕</span>
              <strong>{t.addNewTrip}</strong>
              <small>{t.createDestination}</small>
            </button>
          </div>
        </section>

        <section className="card system-card">
          <h2>⚙️ {t.account}</h2>
          <div className="system-row">
            <strong>{t.connectedEmail}</strong>
            <span>{session?.user?.email || t.unavailable}</span>
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
      <main className={`app theme-${appearance}`}>
        <section className="hero-card">
          <button className="menu-button" onClick={() => setMainView('dashboard')}>
            ←
          </button>
          <h1>🌍 {t.trips}</h1>
          <p>{trips.length} {t.savedTrips}</p>
        </section>

        <section className="card">
          <div className="document-actions">
            <button className="open-document" onClick={() => setMainView('newTrip')}>
              ➕ {t.addNewTrip}
            </button>
          </div>

          <div className="trip-list">
            {trips.length === 0 && (
              <div className="empty-state">
                <strong>{t.noTrip}</strong>
                <p>{t.addFirstTrip}</p>
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
                    {t.delete}
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
      <main className={`app theme-${appearance}`}>
        <section className="hero-card">
          <button className="menu-button" onClick={() => setMainView('dashboard')}>
            ←
          </button>
          <h1>➕ {t.newTrip}</h1>
          <p>{t.createDestination}</p>
        </section>

        <section className="card">
          <h2>✈️ {t.addNewTrip}</h2>

          <label className="field">
            {t.destination}
            <input
              type="text"
              placeholder={t.destinationPlaceholder}
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
            />
          </label>

          <label className="field">
            {t.icon}
            <input
              type="text"
              placeholder={t.iconPlaceholder}
              value={newTripIcon}
              onChange={(e) => setNewTripIcon(e.target.value)}
            />
          </label>

          <label className="field">
            {t.departureDate}
            <input
              type="date"
              value={newTripStartDate}
              onChange={(e) => setNewTripStartDate(e.target.value)}
            />
          </label>

          <label className="field">
            {t.returnDate}
            <input
              type="date"
              value={newTripEndDate}
              onChange={(e) => setNewTripEndDate(e.target.value)}
            />
          </label>

          <div className="document-actions">
            <button className="open-document" onClick={createTrip}>
              {t.createTrip}
            </button>
            <button className="delete-document" onClick={() => setMainView('dashboard')}>
              {t.cancel}
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={`app theme-${appearance}`}>
      <section className="hero-card">
        <button className="menu-button" onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        <button className="back-trip-button" onClick={closeTrip}>
          ← {t.backTrips}
        </button>

        <h1>{tripIcon} Travel Family</h1>
        <p>{t.holidays} {tripName}</p>
        {getTripDatesText() && <p>{getTripDatesText()}</p>}
      </section>

      {activeTab === 'home' && (
        <>
          <section className="card weather-card">
            <h2>🌤️ {t.weatherTitle}</h2>

            {weatherLoading && <p>{t.loadingWeather}</p>}
            {weatherError && <p>{weatherError}</p>}

            {weather && (
              <div className="weather-box">
                <div className="weather-main">
                  <span className="weather-icon">{getWeatherIcon(weather.code)}</span>
                  <div>
                    <strong>{weather.city}, {weather.country}</strong>
                    <p>{weather.temperature}°C — {t.feelsLike} {weather.feelsLike}°C</p>
                  </div>
                </div>

                <div className="weather-details">
                  <p>💨 {t.wind} : <strong>{weather.wind} km/h</strong></p>
                  <p>💧 {t.humidity} : <strong>{weather.humidity}%</strong></p>
                </div>
              </div>
            )}

            <button onClick={fetchWeather}>{t.refreshWeather}</button>
          </section>

          <section className="card next-activity-card">
            <h2>🤖 {t.assistant}</h2>

            <div className="next-activity-box">
              {getAssistantAdvice().slice(0, 6).map((advice, index) => (
                <p key={index}>{advice}</p>
              ))}
            </div>
          </section>

          <section className="card next-activity-card">
            <h2>📅 {t.nextActivity}</h2>

            {nextActivity ? (
              <div className="next-activity-box">
                <strong>{nextActivity.name}</strong>
                <p>📅 {nextActivity.date}</p>
                <p>⏳ {getActivityCountdownText(nextActivity)}</p>
                <button onClick={() => setActiveTab('planning')}>
                  {t.seePlanning}
                </button>
              </div>
            ) : (
              <div className="next-activity-box">
                <p>{t.noActivityYet}</p>
                <button onClick={() => setActiveTab('planning')}>
                  {t.addActivity}
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'packing' && (
        <section className="card">
          <h2>🧳 {t.packing}</h2>

          <div className="budget-summary">
            <p>{t.preparation} : <strong>{packingProgress}%</strong></p>
            <p>{t.remaining} : <strong>{uncheckedPackingItems.length}</strong></p>
          </div>

          <div className="expense-form">
            <input
              type="text"
              placeholder={t.addPersonPlaceholder}
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
            />
            <button onClick={addPerson}>{t.addPerson}</button>
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
              {t.delete} {selectedPerson}
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
            {currentPackingList.length === 0 && <p>{t.noObjectFor} {selectedPerson}.</p>}

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
          <h2>🛒 {t.shoppingTitle}</h2>

          <div className="budget-summary">
            <p>{t.bought} : <strong>{boughtShoppingItems.length}</strong></p>
            <p>{t.remaining} : <strong>{missingShoppingItems.length}</strong></p>
          </div>

          <div className="expense-form">
            <input
              type="text"
              placeholder={t.shoppingPlaceholder}
              value={shoppingItem}
              onChange={(e) => setShoppingItem(e.target.value)}
            />

            <button onClick={addShoppingItem}>Ajouter</button>
          </div>

          <div className="packing-list">
            {shoppingList.length === 0 && <p>{t.noShopping}</p>}

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
          <h2>📅 {t.planning}</h2>

          <div className="expense-form">
            <input
              type="text"
              placeholder={t.datePlaceholder}
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
            />
            <input
              type="text"
              placeholder={t.activityPlaceholder}
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
            />
            <button onClick={addActivity}>{t.addActivity}</button>
          </div>

          <ul className="expenses-list">
            {activities.length === 0 && <p>{t.noActivityPlanned}</p>}

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
          <h2>💰 {t.budget}</h2>

          <label className="field">
            {t.plannedBudget}
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>

          <div className="budget-summary">
            <p>{t.spent} : <strong>{totalSpent} €</strong></p>
            <p>{t.remaining} : <strong>{remaining} €</strong></p>
          </div>

          <div className="expense-form">
            <input
              type="text"
              placeholder={t.expensePlaceholder}
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
            />
            <input
              type="number"
              placeholder={t.amount}
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
            />
            <button onClick={addExpense}>Ajouter</button>
          </div>

          <ul className="expenses-list">
            {expenses.length === 0 && <p>{t.noExpense}</p>}

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
          <h2>📁 {t.vault}</h2>

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
              placeholder={t.documentNamePlaceholder}
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />

            <input
              type="text"
              placeholder={t.documentTypePlaceholder}
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            />

            <label className="file-picker-button" htmlFor="document-file-input">
              {documentFile ? t.fileSelected : t.chooseFile}
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
              {documentUploading ? t.uploading : t.addDocument}
            </button>
          </div>

          <div className="document-list">
            {filteredDocuments.length === 0 && <p>{t.noDocumentFor} {documentPerson}.</p>}

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
                    {t.delete}
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
              <h2>📸 {t.galleryTitle}</h2>
              <p className="muted-text">{t.tripMemories} : <strong>{tripName}</strong></p>
            </div>

            <div className="gallery-counter">
              <strong>{photos.length}</strong>
              <span>{photos.length > 1 ? t.photos : t.photo}</span>
            </div>
          </div>

          <div className="gallery-upload-box">
            <label className="file-picker-button" htmlFor="photo-file-input">
              {photoFiles.length > 0
                ? `✅ ${photoFiles.length} ${photoFiles.length > 1 ? t.photos : t.photo} sélectionnée${photoFiles.length > 1 ? 's' : ''}`
                : t.choosePhoto}
            </label>

            <input
              id="photo-file-input"
              key={photoFileInputKey}
              ref={photoFileInputRef}
              className="file-input"
              type="file"
              accept="image/*,.heic,.heif,.jpg,.jpeg,.png"
              multiple
              onClick={(e) => {
                e.target.value = ''
              }}
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || [])
                const imageFiles = selectedFiles.filter((file) =>
                  file.type?.startsWith('image/') ||
                  file.name.toLowerCase().endsWith('.heic') ||
                  file.name.toLowerCase().endsWith('.heif')
                )

                if (imageFiles.length > 20) {
                  alert('Maximum 20 photos à la fois. Les 20 premières ont été sélectionnées.')
                }

                const limitedFiles = imageFiles.slice(0, 20)
                setPhotoFiles(limitedFiles)
                setPhotoFile(limitedFiles[0] || null)

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
              placeholder={t.captionPlaceholder}
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
            />

            <button onClick={addPhoto} disabled={photoUploading}>
              {photoUploading
                ? `${t.uploading}${photoUploadProgress ? ` ${photoUploadProgress}` : ''}`
                : photoFiles.length > 1
                  ? `Ajouter les ${photoFiles.length} photos`
                  : t.addGallery}
            </button>
          </div>

          {photos.length === 0 && (
            <div className="empty-state">
              <strong>{t.noPhotoTrip}</strong>
              <p>{t.addMemoriesHere}</p>
            </div>
          )}

          {photos.length > 0 && (
            <div className="photo-grid premium-photo-grid">
              {photos.map((photo) => (
                <article className="photo-card premium-photo-card" key={photo.id}>
                  <button className="photo-preview-button" onClick={() => setSelectedPhoto(photo)}>
                    <img
                      className="gallery-thumbnail"
                      src={getPhotoUrl(photo.photo_url)}
                      alt={photo.caption || t.memoryPhoto}
                    />
                    <span className="photo-open-hint">{t.enlarge}</span>
                  </button>

                  <div className="photo-card-info">
                    <strong>{photo.caption || t.memoryPhoto}</strong>
                    <small>{getPhotoDate(photo)}</small>
                  </div>

                  <button className="delete-photo-button" onClick={() => deletePhoto(photo)}>
                    {t.delete}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'places' && (
        <section className="card places-card">
          <h2>📍 {t.favoritePlaces}</h2>

          <div className="expense-form">
            <input
              type="text"
              placeholder={t.placeNamePlaceholder}
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
            />

            <input
              type="text"
              placeholder={t.placeTypePlaceholder}
              value={placeType}
              onChange={(e) => setPlaceType(e.target.value)}
            />

            <input
              type="text"
              placeholder={t.addressPlaceholder}
              value={placeAddress}
              onChange={(e) => setPlaceAddress(e.target.value)}
            />

            <button onClick={addPlace}>{t.addPlace}</button>
          </div>

          <div className="document-list">
            {places.length === 0 && <p>{t.noPlace}</p>}

            {places.map((place) => (
              <div className="document-row" key={place.id}>
                <strong>📍 {place.name}</strong>
                <span>{place.type}</span>
                <p>{place.address}</p>

                <div className="document-actions">
                  <button className="open-document" onClick={() => openPlace(place)}>
                    {t.openMaps}
                  </button>

                  <button className="delete-document" onClick={() => deletePlace(place.id)}>
                    {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'system' && (
        <section className="card system-card">
          <h2>⚙️ {t.system}</h2>

          <div className="system-section">
            <h3>✈️ {t.openTrip}</h3>
            <div className="system-row">
              <strong>{selectedTrip?.trip_name || tripName}</strong>
              <span>{getTripDatesText()}</span>
            </div>
          </div>

          <div className="system-section">
            <h3>👤 {t.account}</h3>
            <div className="system-row">
              <strong>{t.connectedEmail}</strong>
              <span>{session?.user?.email || t.unavailable}</span>
            </div>
            <div className="system-row">
              <strong>{t.status}</strong>
              <span>{t.connected}</span>
            </div>
          </div>


          <div className="system-section">
            <h3>🌍 {t.language}</h3>
            <div className="system-row">
              <strong>{t.chooseLanguage}</strong>
              <span>{language.toUpperCase()}</span>
            </div>
            <div className="document-actions language-actions">
              <button
                className={language === 'fr' ? 'open-document' : ''}
                onClick={() => setLanguage('fr')}
              >
                🇫🇷 {t.french}
              </button>
              <button
                className={language === 'en' ? 'open-document' : ''}
                onClick={() => setLanguage('en')}
              >
                🇬🇧 {t.english}
              </button>
              <button
                className={language === 'es' ? 'open-document' : ''}
                onClick={() => setLanguage('es')}
              >
                🇪🇸 {t.spanish}
              </button>
            </div>
          </div>

          <div className="system-section">
            <h3>🎨 {appearanceText.title}</h3>
            <div className="system-row">
              <strong>{appearanceText.description}</strong>
              <span>{appearanceText.current} : {appearanceText[appearance]}</span>
            </div>

            <label className="field appearance-field">
              {appearanceText.title}
              <select
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
              >
                {appearanceOptions.map((option) => (
                  <option key={option} value={option}>
                    {appearanceText[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="system-section">
            <h3>📱 {t.application}</h3>
            <div className="system-row">
              <strong>{t.appName}</strong>
              <span>Travel Family</span>
            </div>
            <div className="system-row">
              <strong>{t.version}</strong>
              <span>2.0.0 - Multi-voyages</span>
            </div>
            <div className="system-row">
              <strong>{t.installMode}</strong>
              <span>{t.iphoneCompatible}</span>
            </div>
          </div>

          <div className="system-section">
            <h3>🗑️ {t.data}</h3>
            <button className="delete-person-button" onClick={resetCurrentTripData}>
              {t.resetTrip}
            </button>
          </div>

          <div className="system-section">
            <h3>🚪 {t.session}</h3>
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
            <img src={getPhotoUrl(selectedPhoto.photo_url)} alt={selectedPhoto.caption || t.memoryPhoto} />
            <div className="photo-modal-info">
              <strong>{selectedPhoto.caption || t.memoryPhoto}</strong>
              <span>{getPhotoDate(selectedPhoto)}</span>
            </div>
            <div className="document-actions">
              <button className="open-document" onClick={() => openPhoto(selectedPhoto.photo_url)}>
                {t.openNewTab}
              </button>
              <button className="delete-document" onClick={() => {
                deletePhoto(selectedPhoto)
                setSelectedPhoto(null)
              }}>
                {t.delete}
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
              ['home', '🏠', t.home],
              ['packing', '🧳', t.packing],
              ['shopping', '🛒', t.shopping],
              ['planning', '📅', t.planning],
              ['budget', '💰', t.budget],
              ['documents', '📁', t.documents],
              ['gallery', '📸', t.gallery],
              ['places', '📍', t.places],
              ['system', '⚙️', t.system],
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
              {t.returnToTrips}
            </button>
          </aside>
        </div>
      )}
    </main>
  )
}

export default App
