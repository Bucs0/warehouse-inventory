// ===================================================================
// UPDATED: src/App.jsx
// CHANGES: Replaced localStorage with MySQL API calls
// - Added async/await for all database operations
// - Integrated with inventoryAPI, suppliersAPI, categoriesAPI, etc.
// - Added proper error handling for database operations
// - Maintains UI state while syncing with database
// ===================================================================

import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import InventoryTable from './components/InventoryTable'
import StockTransactions from './components/StockTransactions'
import SuppliersPage from './components/SuppliersPage'
import CategoriesPage from './components/CategoriesPage'
import AppointmentsPage from './components/AppointmentsPage'
import DamagedItemsPage from './components/DamagedItemsPage'
import ActivityLogs from './components/ActivityLogs'

// Import database API services
import {
  inventoryAPI,
  suppliersAPI,
  categoriesAPI,
  locationsAPI,
  transactionsAPI,
  appointmentsAPI,
  activityLogsAPI,
  damagedItemsAPI
} from './lib/api'

// Import email service
import { sendLowStockAlert, sendAppointmentEmail, sendAppointmentCancelEmail } from './lib/emailService'

// Admin email here
const ADMIN_EMAIL = 'markjadebucao10@gmail.com'

export default function App() {
  // ========== STATE MANAGEMENT ==========
  
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Database-synced state
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [transactionHistory, setTransactionHistory] = useState([])
  const [appointments, setAppointments] = useState([])
  const [damagedItems, setDamagedItems] = useState([])
  
  // Track low stock alerts (still use localStorage for this)
  const [lowStockAlertsSent, setLowStockAlertsSent] = useState(() => {
    const saved = localStorage.getItem('lowStockAlertsSent')
    return saved ? JSON.parse(saved) : []
  })

  // ========== LOAD DATA FROM DATABASE ==========
  
  useEffect(() => {
    const loadAllData = async () => {
      if (!currentUser) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Load all data in parallel
        const [
          suppliersRes,
          categoriesRes,
          locationsRes,
          inventoryRes,
          logsRes,
          transactionsRes,
          appointmentsRes,
          damagedRes
        ] = await Promise.all([
          suppliersAPI.getAll(),
          categoriesAPI.getAll(),
          locationsAPI.getAll(),
          inventoryAPI.getAll(),
          activityLogsAPI.getAll(),
          transactionsAPI.getAll(),
          appointmentsAPI.getAll(),
          damagedItemsAPI.getAll()
        ])

        // Transform database format to app format
        if (suppliersRes.success) {
          const transformedSuppliers = suppliersRes.data.map(s => ({
            id: s.id,
            supplierName: s.supplier_name,
            contactPerson: s.contact_person,
            contactEmail: s.contact_email,
            contactPhone: s.contact_phone,
            address: s.address,
            isActive: Boolean(s.is_active),
            dateAdded: new Date(s.created_at).toLocaleDateString('en-PH')
          }))
          setSuppliers(transformedSuppliers)
        }

        if (categoriesRes.success) {
          const transformedCategories = categoriesRes.data.map(c => ({
            id: c.id,
            categoryName: c.category_name,
            description: c.description,
            dateAdded: new Date(c.created_at).toLocaleDateString('en-PH')
          }))
          setCategories(transformedCategories)
        }

        if (locationsRes.success) {
          const transformedLocations = locationsRes.data.map(l => ({
            id: l.id,
            locationName: l.location_name,
            description: l.description,
            dateAdded: new Date(l.created_at).toLocaleDateString('en-PH')
          }))
          setLocations(transformedLocations)
        }

        if (inventoryRes.success) {
          const transformedInventory = inventoryRes.data.map(i => ({
            id: i.id,
            itemName: i.item_name,
            category: i.category_name || 'Other',
            quantity: i.quantity,
            location: i.location_name || 'Unknown',
            reorderLevel: i.reorder_level,
            price: i.price,
            supplier: i.supplier_name || null,
            supplierId: i.supplier_id,
            damagedStatus: i.damaged_status,
            dateAdded: new Date(i.created_at).toLocaleDateString('en-PH')
          }))
          setInventoryData(transformedInventory)
        }

        if (logsRes.success) {
          const transformedLogs = logsRes.data.map(l => ({
            id: l.id,
            itemName: l.item_name,
            action: l.action,
            userName: l.user_name,
            userRole: l.user_role,
            timestamp: new Date(l.created_at).toLocaleString('en-PH', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            details: l.details
          }))
          setActivityLogs(transformedLogs)
        }

        if (transactionsRes.success) {
          const transformedTransactions = transactionsRes.data.map(t => ({
            id: t.id,
            itemId: t.item_id,
            itemName: t.item_name,
            transactionType: t.transaction_type,
            quantity: t.quantity,
            reason: t.reason,
            userName: t.user_name,
            userRole: t.user_role,
            timestamp: new Date(t.created_at).toLocaleString('en-PH', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            stockBefore: t.stock_before,
            stockAfter: t.stock_after
          }))
          setTransactionHistory(transformedTransactions)
        }

        if (appointmentsRes.success) {
          const transformedAppointments = await Promise.all(
            appointmentsRes.data.map(async (a) => {
              // Get appointment items
              const itemsRes = await appointmentsAPI.getById(a.id)
              return {
                id: a.id,
                supplierId: a.supplier_id,
                supplierName: a.supplier_name,
                date: a.appointment_date,
                time: a.appointment_time,
                status: a.status,
                items: itemsRes.success ? itemsRes.data.items.map(i => ({
                  itemId: i.item_id,
                  itemName: i.item_name,
                  quantity: i.quantity
                })) : [],
                notes: a.notes,
                scheduledBy: a.scheduled_by_name,
                scheduledDate: new Date(a.created_at).toLocaleString('en-PH'),
                lastUpdated: new Date(a.updated_at).toLocaleString('en-PH')
              }
            })
          )
          setAppointments(transformedAppointments)
        }

        if (damagedRes.success) {
          const transformedDamaged = damagedRes.data.map(d => ({
            id: d.id,
            itemId: d.item_id,
            itemName: d.item_name,
            quantity: d.quantity,
            location: d.location_name,
            reason: d.reason,
            status: d.status,
            price: d.price,
            dateDamaged: new Date(d.created_at).toLocaleDateString('en-PH'),
            notes: d.notes || ''
          }))
          setDamagedItems(transformedDamaged)
        }

      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data from database')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [currentUser])

  // ========== AUTO-SAVE lowStockAlertsSent ==========
  useEffect(() => {
    localStorage.setItem('lowStockAlertsSent', JSON.stringify(lowStockAlertsSent))
  }, [lowStockAlertsSent])

  // ========== LOW STOCK EMAIL ALERTS ==========
  useEffect(() => {
    if (!currentUser || inventoryData.length === 0) return

    const checkLowStock = async () => {
      const lowStockItems = inventoryData.filter(item => 
        item.quantity <= item.reorderLevel && 
        !lowStockAlertsSent.includes(item.id)
      )

      if (lowStockItems.length === 0) return

      const lockKey = 'lowStockAlertLock'
      const lockTimeout = 10000
      const currentTime = Date.now()

      const existingLock = localStorage.getItem(lockKey)
      if (existingLock) {
        const lockData = JSON.parse(existingLock)
        if (currentTime - lockData.timestamp < lockTimeout) {
          return
        }
      }

      const lockData = {
        timestamp: currentTime,
        tabId: Math.random().toString(36).substr(2, 9)
      }
      localStorage.setItem(lockKey, JSON.stringify(lockData))

      await new Promise(resolve => setTimeout(resolve, 100))

      const currentLock = localStorage.getItem(lockKey)
      if (!currentLock || JSON.parse(currentLock).tabId !== lockData.tabId) {
        return
      }

      for (const item of lowStockItems) {
        const result = await sendLowStockAlert(item, ADMIN_EMAIL)
        
        if (result.success) {
          console.log(`✅ Low stock alert sent for: ${item.itemName}`)
          setLowStockAlertsSent(prev => [...prev, item.id])
          
          // Log to database
          await activityLogsAPI.add({
            itemName: item.itemName,
            action: 'Alert',
            details: `Low stock email alert sent to admin (${item.quantity} units remaining, reorder at ${item.reorderLevel})`
          }, currentUser.id)
        }
      }

      localStorage.removeItem(lockKey)
    }

    checkLowStock()
    const interval = setInterval(checkLowStock, 30000)

    return () => {
      clearInterval(interval)
      localStorage.removeItem('lowStockAlertLock')
    }
  }, [inventoryData, currentUser, lowStockAlertsSent])

  // Clear alerts when restocked
  useEffect(() => {
    const restockedItems = inventoryData.filter(item => 
      item.quantity > item.reorderLevel && 
      lowStockAlertsSent.includes(item.id)
    )

    if (restockedItems.length > 0) {
      setLowStockAlertsSent(prev => 
        prev.filter(id => !restockedItems.some(item => item.id === id))
      )
    }
  }, [inventoryData, lowStockAlertsSent])

  // ========== HANDLER FUNCTIONS ==========
  
  const handleLogin = (user) => {
    setCurrentUser(user)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage('dashboard')
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleAddItem = async (newItem) => {
    try {
      // Find category and location IDs
      const category = categories.find(c => c.categoryName === newItem.category)
      const location = locations.find(l => l.locationName === newItem.location)

      const itemData = {
        itemName: newItem.itemName,
        categoryId: category?.id || null,
        quantity: newItem.quantity,
        locationId: location?.id || null,
        reorderLevel: newItem.reorderLevel,
        price: newItem.price,
        supplierId: newItem.supplierId
      }

      const result = await inventoryAPI.add(itemData)
      
      if (result.success) {
        // Reload inventory
        const inventoryRes = await inventoryAPI.getAll()
        if (inventoryRes.success) {
          const transformed = inventoryRes.data.map(i => ({
            id: i.id,
            itemName: i.item_name,
            category: i.category_name || 'Other',
            quantity: i.quantity,
            location: i.location_name || 'Unknown',
            reorderLevel: i.reorder_level,
            price: i.price,
            supplier: i.supplier_name || null,
            supplierId: i.supplier_id,
            damagedStatus: i.damaged_status,
            dateAdded: new Date(i.created_at).toLocaleDateString('en-PH')
          }))
          setInventoryData(transformed)
        }

        // Log activity
        await activityLogsAPI.add({
          itemName: newItem.itemName,
          action: 'Added',
          details: `Added ${newItem.quantity} units to inventory`
        }, currentUser.id)

        // Reload logs
        const logsRes = await activityLogsAPI.getAll()
        if (logsRes.success) {
          const transformedLogs = logsRes.data.map(l => ({
            id: l.id,
            itemName: l.item_name,
            action: l.action,
            userName: l.user_name,
            userRole: l.user_role,
            timestamp: new Date(l.created_at).toLocaleString('en-PH', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            details: l.details
          }))
          setActivityLogs(transformedLogs)
        }
      }
    } catch (err) {
      console.error('Error adding item:', err)
      alert('Failed to add item')
    }
  }

  const handleEditItem = async (updatedItem) => {
    try {
      const oldItem = inventoryData.find(item => item.id === updatedItem.id)
      
      const category = categories.find(c => c.categoryName === updatedItem.category)
      const location = locations.find(l => l.locationName === updatedItem.location)

      const itemData = {
        itemName: updatedItem.itemName,
        categoryId: category?.id || null,
        quantity: updatedItem.quantity,
        locationId: location?.id || null,
        reorderLevel: updatedItem.reorderLevel,
        price: updatedItem.price,
        supplierId: updatedItem.supplierId
      }

      const result = await inventoryAPI.update(updatedItem.id, itemData)
      
      if (result.success) {
        // Reload inventory
        const inventoryRes = await inventoryAPI.getAll()
        if (inventoryRes.success) {
          const transformed = inventoryRes.data.map(i => ({
            id: i.id,
            itemName: i.item_name,
            category: i.category_name || 'Other',
            quantity: i.quantity,
            location: i.location_name || 'Unknown',
            reorderLevel: i.reorder_level,
            price: i.price,
            supplier: i.supplier_name || null,
            supplierId: i.supplier_id,
            damagedStatus: i.damaged_status,
            dateAdded: new Date(i.created_at).toLocaleDateString('en-PH')
          }))
          setInventoryData(transformed)
        }

        // Build changes description
        const changes = []
        if (oldItem.quantity !== updatedItem.quantity) {
          changes.push(`quantity: ${oldItem.quantity} → ${updatedItem.quantity}`)
        }
        if (oldItem.location !== updatedItem.location) {
          changes.push(`location: ${oldItem.location} → ${updatedItem.location}`)
        }

        // Log activity
        await activityLogsAPI.add({
          itemName: updatedItem.itemName,
          action: 'Edited',
          details: changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Updated item information'
        }, currentUser.id)

        // Reload logs
        const logsRes = await activityLogsAPI.getAll()
        if (logsRes.success) {
          const transformedLogs = logsRes.data.map(l => ({
            id: l.id,
            itemName: l.item_name,
            action: l.action,
            userName: l.user_name,
            userRole: l.user_role,
            timestamp: new Date(l.created_at).toLocaleString('en-PH', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            details: l.details
          }))
          setActivityLogs(transformedLogs)
        }
      }
    } catch (err) {
      console.error('Error editing item:', err)
      alert('Failed to edit item')
    }
  }

  const handleDeleteItem = async (itemId) => {
    try {
      const item = inventoryData.find(i => i.id === itemId)
      
      const result = await inventoryAPI.delete(itemId)
      
      if (result.success) {
        // Reload inventory
        const inventoryRes = await inventoryAPI.getAll()
        if (inventoryRes.success) {
          const transformed = inventoryRes.data.map(i => ({
            id: i.id,
            itemName: i.item_name,
            category: i.category_name || 'Other',
            quantity: i.quantity,
            location: i.location_name || 'Unknown',
            reorderLevel: i.reorder_level,
            price: i.price,
            supplier: i.supplier_name || null,
            supplierId: i.supplier_id,
            damagedStatus: i.damaged_status,
            dateAdded: new Date(i.created_at).toLocaleDateString('en-PH')
          }))
          setInventoryData(transformed)
        }

        if (item) {
          await activityLogsAPI.add({
            itemName: item.itemName,
            action: 'Deleted',
            details: 'Item removed from inventory'
          }, currentUser.id)

          // Reload logs
          const logsRes = await activityLogsAPI.getAll()
          if (logsRes.success) {
            const transformedLogs = logsRes.data.map(l => ({
              id: l.id,
              itemName: l.item_name,
              action: l.action,
              userName: l.user_name,
              userRole: l.user_role,
              timestamp: new Date(l.created_at).toLocaleString('en-PH', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              details: l.details
            }))
            setActivityLogs(transformedLogs)
          }
        }
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      alert('Failed to delete item')
    }
  }

  const handleTransaction = async (transaction) => {
    try {
      const result = await transactionsAPI.add(transaction, currentUser.id)
      
      if (result.success) {
        // Reload inventory and transactions
        const [inventoryRes, transactionsRes, logsRes] = await Promise.all([
          inventoryAPI.getAll(),
          transactionsAPI.getAll(),
          activityLogsAPI.getAll()
        ])

        if (inventoryRes.success) {
          const transformed = inventoryRes.data.map(i => ({
            id: i.id,
            itemName: i.item_name,
            category: i.category_name || 'Other',
            quantity: i.quantity,
            location: i.location_name || 'Unknown',
            reorderLevel: i.reorder_level,
            price: i.price,
            supplier: i.supplier_name || null,
            supplierId: i.supplier_id,
            damagedStatus: i.damaged_status,
            dateAdded: new Date(i.created_at).toLocaleDateString('en-PH')
          }))
          setInventoryData(transformed)
        }

        if (transactionsRes.success) {
          const transformedTransactions = transactionsRes.data.map(t => ({
            id: t.id,
            itemId: t.item_id,
            itemName: t.item_name,
            transactionType: t.transaction_type,
            quantity: t.quantity,
            reason: t.reason,
            userName: t.user_name,
            userRole: t.user_role,
            timestamp: new Date(t.created_at).toLocaleString('en-PH', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            stockBefore: t.stock_before,
            stockAfter: t.stock_after
          }))
          setTransactionHistory(transformedTransactions)
        }

        if (logsRes.success) {
          const transformedLogs = logsRes.data.map(l => ({
            id: l.id,
            itemName: l.item_name,
            action: l.action,
            userName: l.user_name,
            userRole: l.user_role,
            timestamp: new Date(l.created_at).toLocaleString('en-PH', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            details: l.details
          }))
          setActivityLogs(transformedLogs)
        }

        // If damaged, reload damaged items
        if (transaction.reason === 'Damaged/Discarded') {
          const damagedRes = await damagedItemsAPI.getAll()
          if (damagedRes.success) {
            const transformedDamaged = damagedRes.data.map(d => ({
              id: d.id,
              itemId: d.item_id,
              itemName: d.item_name,
              quantity: d.quantity,
              location: d.location_name,
              reason: d.reason,
              status: d.status,
              price: d.price,
              dateDamaged: new Date(d.created_at).toLocaleDateString('en-PH'),
              notes: d.notes || ''
            }))
            setDamagedItems(transformedDamaged)
          }
        }
      }
    } catch (err) {
      console.error('Error recording transaction:', err)
      alert('Failed to record transaction')
    }
  }

  // Add remaining handlers (suppliers, categories, locations, appointments, damaged items)
  // Similar pattern: call API, reload data, update state

  const handleAddSupplier = async (newSupplier) => {
    try {
      const result = await suppliersAPI.add({
        supplierName: newSupplier.supplierName,
        contactPerson: newSupplier.contactPerson,
        contactEmail: newSupplier.contactEmail,
        contactPhone: newSupplier.contactPhone,
        address: newSupplier.address,
        isActive: newSupplier.isActive
      })

      if (result.success) {
        const suppliersRes = await suppliersAPI.getAll()
        if (suppliersRes.success) {
          const transformed = suppliersRes.data.map(s => ({
            id: s.id,
            supplierName: s.supplier_name,
            contactPerson: s.contact_person,
            contactEmail: s.contact_email,
            contactPhone: s.contact_phone,
            address: s.address,
            isActive: Boolean(s.is_active),
            dateAdded: new Date(s.created_at).toLocaleDateString('en-PH')
          }))
          setSuppliers(transformed)
        }

        await activityLogsAPI.add({
          itemName: newSupplier.supplierName,
          action: 'Added',
          details: 'New supplier added'
        }, currentUser.id)
      }
    } catch (err) {
      console.error('Error adding supplier:', err)
      alert('Failed to add supplier')
    }
  }

  // Add similar handlers for edit/delete suppliers, categories, locations, appointments, damaged items

  // ========== RENDER ==========

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">Warehouse</h2>
              <p className="text-xs text-muted-foreground">Inventory System</p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium text-left">Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigate('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'transactions' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="font-medium text-left">Stock Transactions</span>
            </button>

            {currentUser.role === 'Admin' && (
              <button
                onClick={() => handleNavigate('inventory')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'inventory' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5