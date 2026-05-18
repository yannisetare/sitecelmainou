export const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  ro: { name: 'Romana', flag: '🇷🇴' },
} as const

export type Language = keyof typeof languages

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.signIn': 'Sign In',
    'nav.getStarted': 'Get Started',
    'nav.signOut': 'Sign Out',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    
    // Hero
    'hero.badge.new': 'New',
    'hero.badge.text': 'Interactive 3D knowledge graphs',
    'hero.title': 'Master any subject through',
    'hero.titleHighlight': 'visual learning',
    'hero.description': 'EduWeb transforms complex topics into interconnected knowledge graphs. Navigate concepts, unlock new paths, and learn at your own pace with adaptive guidance.',
    'hero.cta.primary': 'Start Learning Free',
    'hero.cta.secondary': 'Create a Course',
    
    // Features
    'features.title': 'A new way to learn',
    'features.description': 'EduWeb combines visual knowledge graphs with adaptive learning to create personalized educational experiences.',
    'features.graphs.title': 'Visual Knowledge Graphs',
    'features.graphs.description': 'See how concepts connect. Navigate through topics in 2D or 3D, discovering relationships that traditional learning hides.',
    'features.adaptive.title': 'Adaptive Learning Paths',
    'features.adaptive.description': 'Smart pathfinding suggests your optimal route. Complete prerequisites to unlock new content as you build expertise.',
    'features.social.title': 'Social Learning',
    'features.social.description': "See who's learning alongside you. Real-time presence shows classmates exploring the same topics.",
    
    // For Teachers
    'teachers.badge': 'For Teachers',
    'teachers.title': 'Build courses that engage',
    'teachers.description': 'Architect Mode gives you powerful tools to create interactive knowledge graphs. Add lessons, quizzes, videos, and code playgrounds - then connect them into meaningful learning paths.',
    'teachers.feature1': 'Drag-and-drop graph builder',
    'teachers.feature2': 'Rich content: Markdown, video, quizzes, code',
    'teachers.feature3': 'Student progress analytics',
    'teachers.cta': 'Start Creating',
    'teachers.placeholder': 'Create your first course in minutes',
    
    // CTA
    'cta.title': 'Ready to transform how you learn?',
    'cta.description': 'Join thousands of students and teachers building knowledge together.',
    'cta.button': 'Get Started for Free',
    
    // Footer
    'footer.tagline': 'EduWeb - Interactive Learning Platform',
    'footer.builtWith': 'Built with Next.js and Supabase',
    
    // Dashboard
    'dashboard.graphs': 'Knowledge Graphs',
    'dashboard.noGraphs': 'No graphs available',
    'dashboard.createGraph': 'Create New Graph',
    'dashboard.selectGraph': 'Select a Knowledge Graph',
    'dashboard.selectGraphDesc': 'Choose a graph from the sidebar to start exploring and learning. Each node represents a concept you can master.',
    'dashboard.createFirst': 'Create Your First Graph',
    
    // Auth
    'auth.login': 'Sign In',
    'auth.signup': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.displayName': 'Display Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.continueWith': 'Or continue with',
    'auth.welcomeBack': 'Welcome back! Sign in to continue your learning journey.',
    'auth.createJourney': 'Create your account and start your learning journey.',
    'auth.enterCredentials': 'Enter your credentials to access your account',
    'auth.exploreGraphs': 'Sign up to explore interactive knowledge graphs',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.checkEmail': 'Check Your Email',
    'auth.confirmationSent': "We've sent a confirmation link to",
    'auth.checkInbox': 'Please check your inbox and click the link to activate your account.',
    'auth.backToSignIn': 'Back to Sign In',
    'auth.iAmA': 'I am a...',
    'auth.student': 'Student',
    'auth.teacher': 'Teacher',
    'auth.createClassrooms': 'Create and manage your classes',
    
    // Graph labels
    'graph.fundamentals': 'Fundamentals',
    'graph.coreConcepts': 'Core Concepts',
    'graph.advanced': 'Advanced',
    'graph.practice': 'Practice',
    'graph.projects': 'Projects',
    
    // Language selector
    'language.select': 'Select Language',
    
    // Errors
    'error.rateLimitExceeded': 'Too many requests. Please wait a few minutes before trying again.',
    'error.emailRateLimit': 'Email rate limit exceeded. Please wait a few minutes before requesting another email.',
    
    // Profile
    'profile.title': 'Profile',
    'profile.description': 'View and manage your profile information',
    'profile.personalInfo': 'Personal Information',
    'profile.fullName': 'Full Name',
    'profile.displayName': 'Display Name',
    'profile.displayNamePlaceholder': 'Choose a nickname',
    'profile.email': 'Email Address',
    'profile.role': 'Role',
    'profile.bio': 'Bio',
    'profile.bioPlaceholder': 'Tell us a bit about yourself...',
    'profile.memberSince': 'Member Since',
    'profile.save': 'Save Changes',
    'profile.saving': 'Saving...',
    'profile.saved': 'Profile saved successfully!',
    'profile.error': 'Failed to save profile',
    
    // Settings
    'settings.title': 'Settings',
    'settings.description': 'Manage your account settings and preferences',
    'settings.appearance': 'Appearance',
    'settings.appearanceDesc': 'Customize how the app looks',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeSystem': 'System',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Manage your notification preferences',
    'settings.emailNotifications': 'Email Notifications',
    'settings.emailNotificationsDesc': 'Receive email updates about your progress',
    'settings.dangerZone': 'Danger Zone',
    'settings.dangerZoneDesc': 'Irreversible actions for your account',
    'settings.deleteAccount': 'Delete Account',
    'settings.deleteAccountDesc': 'Permanently delete your account and all associated data',
    'settings.deleteConfirm': 'Are you sure you want to delete your account? This action cannot be undone.',
    'settings.deleting': 'Deleting...',
    'settings.cancel': 'Cancel',
    'settings.confirm': 'Yes, Delete My Account',
    'settings.clearData': 'Clear Data',
    'settings.clearDataDesc': 'Clear all your progress and learning data',
    'settings.clearDataConfirm': 'Are you sure you want to clear all data? This cannot be undone.',
    'settings.clearing': 'Clearing...',
    'settings.clearConfirm': 'Yes, Clear All Data',
    
    // Sidebar
    'sidebar.searchGraphs': 'Search graphs...',
    'sidebar.myGraphs': 'My Graphs',
    'sidebar.noGraphFound': 'No graph found',
    'sidebar.legend': 'Status Legend',
    'sidebar.completed': 'Completed',
    'sidebar.inProgress': 'In Progress',
    'sidebar.unlocked': 'Unlocked',
    'sidebar.locked': 'Locked',
    'sidebar.nodes': 'nodes',
  },
  
  ro: {
    // Navigation
    'nav.signIn': 'Autentificare',
    'nav.getStarted': 'Incepe',
    'nav.signOut': 'Deconectare',
    'nav.profile': 'Profil',
    'nav.settings': 'Setari',
    
    // Hero
    'hero.badge.new': 'Nou',
    'hero.badge.text': 'Grafuri de cunostinte 3D interactive',
    'hero.title': 'Stapaneste orice subiect prin',
    'hero.titleHighlight': 'invatare vizuala',
    'hero.description': 'EduWeb transforma subiectele complexe in grafuri de cunostinte interconectate. Navigheaza conceptele, deblocheaza cai noi si invata in ritmul tau cu ghidare adaptiva.',
    'hero.cta.primary': 'Incepe Gratuit',
    'hero.cta.secondary': 'Creeaza un Curs',
    
    // Features
    'features.title': 'Un nou mod de a invata',
    'features.description': 'EduWeb combina grafurile de cunostinte vizuale cu invatarea adaptiva pentru a crea experiente educationale personalizate.',
    'features.graphs.title': 'Grafuri de Cunostinte Vizuale',
    'features.graphs.description': 'Vezi cum se conecteaza conceptele. Navigheaza prin subiecte in 2D sau 3D, descoperind relatii pe care invatarea traditionala le ascunde.',
    'features.adaptive.title': 'Cai de Invatare Adaptive',
    'features.adaptive.description': 'Algoritmi inteligenti sugereaza ruta optima. Completeaza cerintele preliminare pentru a debloca continut nou pe masura ce iti dezvolti expertiza.',
    'features.social.title': 'Invatare Sociala',
    'features.social.description': 'Vezi cine invata alaturi de tine. Prezenta in timp real arata colegii care exploreaza aceleasi subiecte.',
    
    // For Teachers
    'teachers.badge': 'Pentru Profesori',
    'teachers.title': 'Construieste cursuri care captiveaza',
    'teachers.description': 'Modul Arhitect iti ofera instrumente puternice pentru a crea grafuri de cunostinte interactive. Adauga lectii, teste, videoclipuri si medii de cod - apoi conecteaza-le in cai de invatare semnificative.',
    'teachers.feature1': 'Constructor drag-and-drop',
    'teachers.feature2': 'Continut bogat: Markdown, video, teste, cod',
    'teachers.feature3': 'Analiza progres studenti',
    'teachers.cta': 'Incepe sa Creezi',
    'teachers.placeholder': 'Creeaza primul tau curs in cateva minute',
    
    // CTA
    'cta.title': 'Esti pregatit sa transformi modul in care inveti?',
    'cta.description': 'Alatura-te miilor de studenti si profesori care construiesc cunostinte impreuna.',
    'cta.button': 'Incepe Gratuit',
    
    // Footer
    'footer.tagline': 'EduWeb - Platforma de Invatare Interactiva',
    'footer.builtWith': 'Construit cu Next.js si Supabase',
    
    // Dashboard
    'dashboard.graphs': 'Grafuri de Cunostinte',
    'dashboard.noGraphs': 'Niciun graf disponibil',
    'dashboard.createGraph': 'Creeaza Graf Nou',
    'dashboard.selectGraph': 'Selecteaza un Graf de Cunostinte',
    'dashboard.selectGraphDesc': 'Alege un graf din bara laterala pentru a incepe sa explorezi si sa inveti. Fiecare nod reprezinta un concept pe care il poti stapani.',
    'dashboard.createFirst': 'Creeaza Primul Tau Graf',
    
    // Auth
    'auth.login': 'Autentificare',
    'auth.signup': 'Creeaza Cont',
    'auth.email': 'Email',
    'auth.password': 'Parola',
    'auth.displayName': 'Nume Afisat',
    'auth.forgotPassword': 'Ai uitat parola?',
    'auth.noAccount': 'Nu ai cont?',
    'auth.hasAccount': 'Ai deja cont?',
    'auth.continueWith': 'Sau continua cu',
    'auth.welcomeBack': 'Bine ai revenit! Autentifica-te pentru a continua calatoria ta de invatare.',
    'auth.createJourney': 'Creeaza-ti contul si incepe calatoria ta de invatare.',
    'auth.enterCredentials': 'Introdu datele de autentificare pentru a accesa contul',
    'auth.exploreGraphs': 'Inregistreaza-te pentru a explora grafuri de cunostinte interactive',
    'auth.signingIn': 'Se autentifica...',
    'auth.creatingAccount': 'Se creeaza contul...',
    'auth.checkEmail': 'Verifica-ti Email-ul',
    'auth.confirmationSent': 'Am trimis un link de confirmare la',
    'auth.checkInbox': 'Te rugam sa verifici inbox-ul si sa dai click pe link pentru a activa contul.',
    'auth.backToSignIn': 'Inapoi la Autentificare',
    'auth.iAmA': 'Eu sunt...',
    'auth.student': 'Elev',
    'auth.teacher': 'Profesor',
    'auth.createClassrooms': 'Creeaza si gestioneaza clasele tale',
    
    // Graph labels
    'graph.fundamentals': 'Fundamente',
    'graph.coreConcepts': 'Concepte de Baza',
    'graph.advanced': 'Avansat',
    'graph.practice': 'Practica',
    'graph.projects': 'Proiecte',
    
    // Language selector
    'language.select': 'Selecteaza Limba',
    
    // Errors
    'error.rateLimitExceeded': 'Prea multe cereri. Te rugam sa astepti cateva minute inainte de a incerca din nou.',
    'error.emailRateLimit': 'Limita de email-uri depasita. Te rugam sa astepti cateva minute inainte de a solicita un alt email.',
    
    // Profile
    'profile.title': 'Profil',
    'profile.description': 'Vizualizeaza si gestioneaza informatiile profilului tau',
    'profile.personalInfo': 'Informatii Personale',
    'profile.fullName': 'Nume Complet',
    'profile.displayName': 'Nume Afisat',
    'profile.displayNamePlaceholder': 'Alege o porecla',
    'profile.email': 'Adresa de Email',
    'profile.role': 'Rol',
    'profile.bio': 'Biografie',
    'profile.bioPlaceholder': 'Spune-ne ceva despre tine...',
    'profile.memberSince': 'Membru Din',
    'profile.save': 'Salveaza Modificarile',
    'profile.saving': 'Se salveaza...',
    'profile.saved': 'Profilul a fost salvat cu succes!',
    'profile.error': 'Nu s-a putut salva profilul',
    
    // Settings
    'settings.title': 'Setari',
    'settings.description': 'Gestioneaza setarile si preferintele contului tau',
    'settings.appearance': 'Aspect',
    'settings.appearanceDesc': 'Personalizeaza cum arata aplicatia',
    'settings.theme': 'Tema',
    'settings.themeLight': 'Luminos',
    'settings.themeDark': 'Intunecat',
    'settings.themeSystem': 'Sistem',
    'settings.notifications': 'Notificari',
    'settings.notificationsDesc': 'Gestioneaza preferintele de notificari',
    'settings.emailNotifications': 'Notificari Email',
    'settings.emailNotificationsDesc': 'Primeste actualizari prin email despre progresul tau',
    'settings.dangerZone': 'Zona Periculoasa',
    'settings.dangerZoneDesc': 'Actiuni ireversibile pentru contul tau',
    'settings.deleteAccount': 'Sterge Contul',
    'settings.deleteAccountDesc': 'Sterge permanent contul tau si toate datele asociate',
    'settings.deleteConfirm': 'Esti sigur ca vrei sa stergi contul? Aceasta actiune nu poate fi anulata.',
    'settings.deleting': 'Se sterge...',
    'settings.cancel': 'Anuleaza',
    'settings.confirm': 'Da, Sterge Contul Meu',
    'settings.clearData': 'Sterge Datele',
    'settings.clearDataDesc': 'Sterge tot progresul si datele de invatare',
    'settings.clearDataConfirm': 'Esti sigur ca vrei sa stergi toate datele? Aceasta actiune nu poate fi anulata.',
    'settings.clearing': 'Se sterge...',
    'settings.clearConfirm': 'Da, Sterge Toate Datele',
    
    // Sidebar
    'sidebar.searchGraphs': 'Cauta grafuri...',
    'sidebar.myGraphs': 'Grafurile Mele',
    'sidebar.noGraphFound': 'Niciun graf gasit',
    'sidebar.legend': 'Legenda Status',
    'sidebar.completed': 'Completat',
    'sidebar.inProgress': 'In Progres',
    'sidebar.unlocked': 'Deblocat',
    'sidebar.locked': 'Blocat',
    'sidebar.nodes': 'noduri',
  },
}
