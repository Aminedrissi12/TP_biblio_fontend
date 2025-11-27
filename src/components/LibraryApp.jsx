import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Users,
  LogOut,
  BarChart3,
  Calendar,
  Library,
  UserCog,
  Trash2,
} from 'lucide-react'

// --- MINIMALIST CSS ---
import '../App.css'

// --- FIX: REMOVE process.env AND USE DIRECT URL ---
// Pour éviter l'erreur "process is not defined" dans le navigateur
const API_BASE_URL = process.env.REACT_APP_API_URL

export default function LibraryApp() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  // States
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [books, setBooks] = useState([])
  const [clients, setClients] = useState([])
  const [loans, setLoans] = useState([])
  const [appUsers, setAppUsers] = useState([])

  // Form States
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    total: 1,
    category: '',
  })
  const [newLoan, setNewLoan] = useState({
    bookId: '',
    clientId: '',
    dateOut: new Date().toISOString().split('T')[0],
  })
  const [newClient, setNewClient] = useState({
    fullName: '',
    cin: '',
    phone: '',
  })
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STAFF',
  })
  const [editingUser, setEditingUser] = useState(null)

  // Fetch Function
  const fetchAllData = async () => {
    try {
      const booksRes = await fetch(`${API_BASE_URL}/books`)
      if (booksRes.ok) setBooks(await booksRes.json())
      const clientsRes = await fetch(`${API_BASE_URL}/clients`)
      if (clientsRes.ok) setClients(await clientsRes.json())
      const loansRes = await fetch(`${API_BASE_URL}/loans`)
      if (loansRes.ok) setLoans(await loansRes.json())
      if (currentUser && currentUser.role === 'ADMIN') {
        const usersRes = await fetch(`${API_BASE_URL}/users`)
        if (usersRes.ok) setAppUsers(await usersRes.json())
      }
    } catch (error) {
      console.error('Erreur API:', error)
    }
  }

  useEffect(() => {
    if (currentUser) fetchAllData()
  }, [currentUser])

  // Auth Actions
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    if (!loginData.email || !loginData.password) {
      setLoginError('Champs requis')
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
      const result = await res.json()
      if (result.success) {
        setCurrentUser(result.user)
        setActiveTab('dashboard')
      } else {
        setLoginError('user or password incorrect')
      }
    } catch (err) {
      setLoginError('Serveur non disponible')
    }
  }
  const handleLogout = () => {
    setCurrentUser(null)
    setLoginData({ email: '', password: '' })
  }

  // Data Actions
  const handleAddUser = async () => {
    if (!newUser.username) return
    try {
      const url = editingUser
        ? `${API_BASE_URL}/users/${editingUser.id}`
        : `${API_BASE_URL}/users`
      const method = editingUser ? 'PUT' : 'POST'
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      setNewUser({ username: '', email: '', password: '', role: 'STAFF' })
      setEditingUser(null)
      fetchAllData()
    } catch (e) {}
  }
  const handleDeleteUser = async (id) => {
    if (window.confirm('Supprimer?')) {
      await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' })
      fetchAllData()
    }
  }
  const handleAddBook = async () => {
    if (!newBook.title) return
    await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newBook,
        stock: newBook.total,
        totalQty: newBook.total,
      }),
    })
    setNewBook({ title: '', author: '', total: 1, category: '' })
    fetchAllData()
  }
  const handleAddClient = async () => {
    if (!newClient.fullName) return
    await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient),
    })
    setNewClient({ fullName: '', cin: '', phone: '' })
    fetchAllData()
  }
  const handleAddLoan = async () => {
    if (!newLoan.bookId) return
    await fetch(`${API_BASE_URL}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book: { id: newLoan.bookId },
        client: { id: newLoan.clientId },
      }),
    })
    setNewLoan({ ...newLoan, bookId: '' })
    fetchAllData()
  }
  const handleReturnBook = async (id) => {
    await fetch(`${API_BASE_URL}/loans/${id}/return`, { method: 'PUT' })
    fetchAllData()
  }

  // --- VIEWS ---

  if (!currentUser) {
    return (
      <>
        <div className='login-wrapper'>
          <div className='login-box'>
            <div style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
              <Library size={40} />
            </div>
            <h2 className='login-title'>Accès Bibliothèque</h2>
            {loginError && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                }}
              >
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className='input-group'>
                <input
                  className='input-clean'
                  placeholder='Email'
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
              </div>
              <div className='input-group'>
                <input
                  type='password'
                  className='input-clean'
                  placeholder='Mot de passe'
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
              </div>
              <button
                className='btn btn-primary'
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Connexion
              </button>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className='app-container'>
        {/* SIDEBAR */}
        <aside className='sidebar'>
          <div className='brand'>
            <Library size={20} /> BIBLIO.SYSTEM
          </div>

          <div style={{ flex: 1 }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <BarChart3 size={18} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`nav-btn ${activeTab === 'books' ? 'active' : ''}`}
            >
              <BookOpen size={18} /> Livres
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`nav-btn ${activeTab === 'loans' ? 'active' : ''}`}
            >
              <Calendar size={18} /> Emprunts
            </button>

            <div
              style={{
                margin: '1.5rem 0 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: '#94a3b8',
                paddingLeft: '12px',
              }}
            >
              ADMIN
            </div>
            <button
              onClick={() => setActiveTab('clients')}
              className={`nav-btn ${activeTab === 'clients' ? 'active' : ''}`}
            >
              <Users size={18} /> Clients
            </button>
            {currentUser.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
              >
                <UserCog size={18} /> Utilisateurs
              </button>
            )}
          </div>

          <button
            onClick={handleLogout}
            className='nav-btn'
            style={{ color: 'var(--danger)' }}
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className='main'>
          <header className='header'>
            <h1 className='page-h1'>
              {activeTab === 'dashboard' && "Vue d'ensemble"}
              {activeTab === 'books' && 'Catalogue'}
              {activeTab === 'loans' && 'Gestion des Prêts'}
              {activeTab === 'clients' && 'Liste des Clients'}
              {activeTab === 'users' && 'Accès Staff'}
            </h1>
            <div className='user-info'>
              {currentUser.username} ({currentUser.role})
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <div className='stats-grid'>
              <div className='stat-box'>
                <div className='stat-label'>LIVRES EN STOCK</div>
                <div className='stat-num'>
                  {books.reduce((acc, b) => acc + (b.totalQty || 0), 0)}
                </div>
              </div>
              <div className='stat-box'>
                <div className='stat-label'>EMPRUNTS ACTIFS</div>
                <div className='stat-num' style={{ color: 'var(--accent)' }}>
                  {loans.filter((l) => l.status === 'ACTIVE').length}
                </div>
              </div>
              <div className='stat-box'>
                <div className='stat-label'>CLIENTS</div>
                <div className='stat-num'>{clients.length}</div>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className='card'>
              <div
                style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}
              >
                <input
                  placeholder='Titre'
                  className='input-clean'
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                />
                <input
                  placeholder='Auteur'
                  className='input-clean'
                  value={newBook.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                />
                <input
                  placeholder='Qté'
                  type='number'
                  className='input-clean'
                  style={{ width: '80px' }}
                  value={newBook.total}
                  onChange={(e) =>
                    setNewBook({ ...newBook, total: parseInt(e.target.value) })
                  }
                />
                <button onClick={handleAddBook} className='btn btn-primary'>
                  Ajouter
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Auteur</th>
                    <th>Dispo</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id}>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>
                        {b.stock} / {b.totalQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className='card'>
              <div
                style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}
              >
                <select
                  className='input-clean'
                  value={newLoan.clientId}
                  onChange={(e) =>
                    setNewLoan({ ...newLoan, clientId: e.target.value })
                  }
                >
                  <option value=''>Choisir Client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.score <= 50}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
                <select
                  className='input-clean'
                  value={newLoan.bookId}
                  onChange={(e) =>
                    setNewLoan({ ...newLoan, bookId: e.target.value })
                  }
                >
                  <option value=''>Choisir Livre...</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.stock === 0}>
                      {b.title}
                    </option>
                  ))}
                </select>
                <button onClick={handleAddLoan} className='btn btn-primary'>
                  Valider
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Livre</th>
                    <th>Client</th>
                    <th>Sortie</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((l) => (
                    <tr key={l.id}>
                      <td>{l.book?.title}</td>
                      <td>{l.client?.fullName}</td>
                      <td>{l.dateOut}</td>
                      <td>
                        {l.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleReturnBook(l.id)}
                            className='btn btn-outline'
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            Retour
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className='card'>
              <div
                style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}
              >
                <input
                  placeholder='Nom Complet'
                  className='input-clean'
                  value={newClient.fullName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, fullName: e.target.value })
                  }
                />
                <input
                  placeholder='CIN'
                  className='input-clean'
                  value={newClient.cin}
                  onChange={(e) =>
                    setNewClient({ ...newClient, cin: e.target.value })
                  }
                />
                <button onClick={handleAddClient} className='btn btn-primary'>
                  Nouveau
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>CIN</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td>{c.fullName}</td>
                      <td>{c.cin}</td>
                      <td
                        style={{
                          fontWeight: 'bold',
                          color: c.score <= 50 ? '#ef4444' : '#10b981',
                        }}
                      >
                        {c.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className='card'>
              <div
                style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}
              >
                <input
                  placeholder='User'
                  className='input-clean'
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />
                <input
                  placeholder='Email'
                  className='input-clean'
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <input
                  type='password'
                  placeholder='Pass'
                  className='input-clean'
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                <select
                  className='input-clean'
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option>STAFF</option>
                  <option>ADMIN</option>
                </select>
                <button onClick={handleAddUser} className='btn btn-primary'>
                  {editingUser ? 'Edit' : 'Add'}
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className='btn-danger'
                          style={{
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
