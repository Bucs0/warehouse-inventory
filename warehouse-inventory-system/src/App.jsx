import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import InventoryTable from './components/InventoryTable'
import StockTransactions from './components/StockTransactions'
import SuppliersPage from './components/SuppliersPage'
import CategoriesPage from './components/CategoriesPage'
import AppointmentsPage from './components/AppointmentsPage'
import DamagedItemsPage from './components/DamagedItemsPage'
import ActivityLogs from './components/ActivityLogs'

// ============================================
// COMPLETE APP WITH ALL MODULES - UPDATED
// ============================================

export default function App() {
  // ========== STATE MANAGEMENT ==========
  
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  
  // Suppliers data
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      supplierName: 'Office Warehouse',
      contactPerson: 'Juan Dela Cruz',
      contactEmail: 'sales@officewarehouse.ph',
      contactPhone: '+63-912-345-6789',
      address: 'Quezon City, Metro Manila',
      isActive: true,
      dateAdded: '11/01/2025'
    },
    {
      id: 2,
      supplierName: 'COSCO SHIPPING',
      contactPerson: 'Maria Santos',
      contactEmail: 'contact@coscoshipping.ph',
      contactPhone: '+63-917-888-9999',
      address: 'Manila Port Area',
      isActive: true,
      dateAdded: '11/02/2025'
    },
    {
      id: 3,
      supplierName: 'Tech Supplies Inc.',
      contactPerson: 'Pedro Reyes',
      contactEmail: 'info@techsupplies.ph',
      contactPhone: '+63-918-111-2222',
      address: 'Makati City',
      isActive: true,
      dateAdded: '11/03/2025'
    }
  ])

  // Categories data
  const [categories, setCategories] = useState([
    {
      id: 1,
      categoryName: 'Office Supplies',
      description: 'Paper, pens, and general office items',
      dateAdded: '11/01/2025'
    },
    {
      id: 2,
      categoryName: 'Equipment',
      description: 'Printers, computers, and machinery',
      dateAdded: '11/01/2025'
    },
    {
      id: 3,
      categoryName: 'Furniture',
      description: 'Desks, chairs, and storage',
      dateAdded: '11/01/2025'
    },
    {
      id: 4,
      categoryName: 'Electronics',
      description: 'Gadgets and electronic accessories',
      dateAdded: '11/01/2025'
    },
    {
      id: 5,
      categoryName: 'Other',
      description: 'Miscellaneous items',
      dateAdded: '11/01/2025'
    }
  ])
  
  // Inventory data
  const [inventoryData, setInventoryData] = useState([
    {
      id: 1,
      itemName: 'A4 Bond Paper',
      category: 'Office Supplies',
      quantity: 50,
      location: 'Warehouse A, Shelf 1',
      reorderLevel: 20,
      price: 250.00,
      supplier: 'Office Warehouse',
      supplierId: 1,
      dateAdded: '11/15/2025'
    },
    {
      id: 2,
      itemName: 'HP Printer',
      category: 'Equipment',
      quantity: 5,
      location: 'Warehouse B, Section 2',
      reorderLevel: 10,
      price: 15000.00,
      supplier: 'Tech Supplies Inc.',
      supplierId: 3,
      dateAdded: '11/14/2025'
    },
    {
      id: 3,
      itemName: 'Office Desk',
      category: 'Furniture',
      quantity: 3,
      location: 'Warehouse C, Area 1',
      reorderLevel: 5,
      price: 8500.00,
      supplier: 'Office Warehouse',
      supplierId: 1,
      dateAdded: '11/10/2025'
    },
    {
      id: 4,
      itemName: 'Ballpen (Black)',
      category: 'Office Supplies',
      quantity: 200,
      location: 'Warehouse A, Shelf 3',
      reorderLevel: 50,
      price: 10.00,
      supplier: 'Office Warehouse',
      supplierId: 1,
      dateAdded: '11/16/2025'
    },
    {
      id: 5,
      itemName: 'Laptop Stand',
      category: 'Electronics',
      quantity: 8,
      location: 'Warehouse B, Section 4',
      reorderLevel: 15,
      price: 1200.00,
      supplier: 'Tech Supplies Inc.',
      supplierId: 3,
      dateAdded: '11/12/2025'
    }
  ])
  
  // Activity logs
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      itemName: 'A4 Bond Paper',
      action: 'Added',
      userName: 'Mark Jade Bucao',
      userRole: 'Admin',
      timestamp: '11/15/2025 10:30 AM',
      details: 'Initial stock entry'
    },
    {
      id: 2,
      itemName: 'HP Printer',
      action: 'Added',
      userName: 'Mark Jade Bucao',
      userRole: 'Admin',
      timestamp: '11/14/2025 2:15 PM',
      details: 'New equipment received'
    },
    {
      id: 3,
      itemName: 'Office Desk',
      action: 'Edited',
      userName: 'Chadrick Arsenal',
      userRole: 'Staff',
      timestamp: '11/16/2025 9:45 AM',
      details: 'Updated item information'
    }
  ])

  // Stock transaction history
  const [transactionHistory, setTransactionHistory] = useState([
    {
      id: 1,
      itemId: 1,
      itemName: 'A4 Bond Paper',
      transactionType: 'IN',
      quantity: 50,
      reason: 'Initial stock',
      userName: 'Mark Jade Bucao',
      userRole: 'Admin',
      timestamp: '11/15/2025 10:30 AM',
      stockBefore: 0,
      stockAfter: 50
    }
  ])

  // Appointments
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      supplierId: 1,
      supplierName: 'Office Warehouse',
      date: '2025-11-25',
      time: '10:00',
      status: 'pending',
      items: [
        { itemId: 1, itemName: 'A4 Bond Paper', quantity: 100 },
        { itemId: 4, itemName: 'Ballpen (Black)', quantity: 500 }
      ],
      notes: 'Deliver to main entrance',
      scheduledBy: 'Mark Jade Bucao',
      scheduledDate: '11/18/2025 2:30 PM',
      lastUpdated: '11/18/2025 2:30 PM'
    }
  ])

  // Damaged items
  const [damagedItems, setDamagedItems] = useState([])

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

  // Inventory handlers
  const handleAddItem = (newItem) => {
    setInventoryData(prev => [...prev, newItem])

    const newLog = {
      id: Date.now(),
      itemName: newItem.itemName,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Added ${newItem.quantity} units`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleEditItem = (updatedItem) => {
    setInventoryData(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    )

    const newLog = {
      id: Date.now(),
      itemName: updatedItem.itemName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Updated item information'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleDeleteItem = (itemId) => {
    const item = inventoryData.find(i => i.id === itemId)
    
    setInventoryData(prev => prev.filter(item => item.id !== itemId))

    if (item) {
      const newLog = {
        id: Date.now(),
        itemName: item.itemName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Item removed from inventory'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  // Transaction handler
  const handleTransaction = (transaction) => {
    setInventoryData(prev => 
      prev.map(item => {
        if (item.id === transaction.itemId) {
          let newQuantity = item.quantity
          if (transaction.transactionType === 'IN') {
            newQuantity += transaction.quantity
          } else {
            newQuantity -= transaction.quantity
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )

    setTransactionHistory(prev => [...prev, transaction])

    const action = transaction.transactionType === 'IN' 
      ? `Stock IN: +${transaction.quantity}` 
      : `Stock OUT: -${transaction.quantity}`
    
    const newLog = {
      id: Date.now(),
      itemName: transaction.itemName,
      action: 'Transaction',
      userName: transaction.userName,
      userRole: transaction.userRole,
      timestamp: transaction.timestamp,
      details: `${action} - ${transaction.reason}`
    }
    setActivityLogs(prev => [...prev, newLog])

    // If OUT transaction with "Damaged/Discarded" reason, add to damaged items
    if (transaction.transactionType === 'OUT' && transaction.reason === 'Damaged/Discarded') {
      const item = inventoryData.find(i => i.id === transaction.itemId)
      if (item) {
        const damagedItem = {
          id: Date.now(),
          itemId: item.id,
          itemName: item.itemName,
          quantity: transaction.quantity,
          location: item.location,
          reason: 'Damaged/Discarded',
          status: 'Standby',
          price: item.price || 0,
          dateDamaged: new Date().toLocaleDateString('en-PH'),
          notes: ''
        }
        setDamagedItems(prev => [...prev, damagedItem])
      }
    }
  }

  // Supplier handlers - UPDATED
  const handleAddSupplier = (newSupplier) => {
    setSuppliers(prev => [...prev, newSupplier])

    // ✅ FIX: Update inventory items to link them to this supplier
    if (newSupplier.suppliedItemIds && newSupplier.suppliedItemIds.length > 0) {
      setInventoryData(prev =>
        prev.map(item =>
          newSupplier.suppliedItemIds.includes(item.id)
            ? { ...item, supplierId: newSupplier.id, supplier: newSupplier.supplierName }
            : item
        )
      )
    }

    const newLog = {
      id: Date.now(),
      itemName: newSupplier.supplierName,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'New supplier added'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleEditSupplier = (updatedSupplier) => {
    setSuppliers(prev => 
      prev.map(supplier => supplier.id === updatedSupplier.id ? updatedSupplier : supplier)
    )

    const newLog = {
      id: Date.now(),
      itemName: updatedSupplier.supplierName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Supplier information updated'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleDeleteSupplier = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    
    setSuppliers(prev => prev.filter(s => s.id !== supplierId))

    if (supplier) {
      const newLog = {
        id: Date.now(),
        itemName: supplier.supplierName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Supplier removed'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  // Category handlers
  const handleAddCategory = (newCategory) => {
    setCategories(prev => [...prev, newCategory])

    const newLog = {
      id: Date.now(),
      itemName: newCategory.categoryName,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'New category added'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleEditCategory = (updatedCategory) => {
    const oldCategory = categories.find(c => c.id === updatedCategory.id)
    
    setCategories(prev => 
      prev.map(category => category.id === updatedCategory.id ? updatedCategory : category)
    )

    if (oldCategory && oldCategory.categoryName !== updatedCategory.categoryName) {
      setInventoryData(prev =>
        prev.map(item =>
          item.category === oldCategory.categoryName
            ? { ...item, category: updatedCategory.categoryName }
            : item
        )
      )
    }

    const newLog = {
      id: Date.now(),
      itemName: updatedCategory.categoryName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Category information updated'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleDeleteCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    
    setCategories(prev => prev.filter(c => c.id !== categoryId))

    if (category) {
      const newLog = {
        id: Date.now(),
        itemName: category.categoryName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Category removed'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  // Appointment handlers
  const handleScheduleAppointment = (appointment) => {
    setAppointments(prev => [...prev, appointment])

    const newLog = {
      id: Date.now(),
      itemName: `Appointment with ${appointment.supplierName}`,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Scheduled for ${appointment.date} at ${appointment.time}`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleEditAppointment = (updatedAppointment) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
    )

    const newLog = {
      id: Date.now(),
      itemName: `Appointment with ${updatedAppointment.supplierName}`,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Appointment details updated'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  // ✅ FIX: Update handleCompleteAppointment to assign supplier
  const handleCompleteAppointment = (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    
    if (!appointment) return

    // Update appointment status
    setAppointments(prev =>
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'completed', lastUpdated: new Date().toLocaleString('en-PH') } 
          : apt
      )
    )

    // ✅ FIX: Update inventory with supplier info
    setInventoryData(prev =>
      prev.map(item => {
        const appointmentItem = appointment.items.find(ai => ai.itemId === item.id)
        
        if (appointmentItem) {
          return {
            ...item,
            quantity: item.quantity + appointmentItem.quantity,
            supplierId: appointment.supplierId,      // ✅ ADD THIS
            supplier: appointment.supplierName       // ✅ ADD THIS
          }
        }
        
        return item
      })
    )

    // Add transaction history for each item
    appointment.items.forEach(appointmentItem => {
      const item = inventoryData.find(i => i.id === appointmentItem.itemId)
      if (item) {
        const transaction = {
          id: Date.now() + Math.random(),
          itemId: item.id,
          itemName: item.itemName,
          transactionType: 'IN',
          quantity: appointmentItem.quantity,
          reason: `Restock from appointment with ${appointment.supplierName}`,
          userName: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date().toLocaleString('en-PH', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          stockBefore: item.quantity,
          stockAfter: item.quantity + appointmentItem.quantity
        }
        
        setTransactionHistory(prev => [...prev, transaction])
      }
    })

    // Activity log
    const newLog = {
      id: Date.now(),
      itemName: `Appointment with ${appointment.supplierName}`,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Marked as completed - ${appointment.items.length} items restocked`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleCancelAppointment = (appointmentId) => {
    setAppointments(prev =>
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled', lastUpdated: new Date().toLocaleString('en-PH') } 
          : apt
      )
    )

    const appointment = appointments.find(a => a.id === appointmentId)
    if (appointment) {
      const newLog = {
        id: Date.now(),
        itemName: `Appointment with ${appointment.supplierName}`,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Appointment cancelled'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  // Damaged items handlers
  const handleUpdateDamagedItem = (updatedItem) => {
    setDamagedItems(prev =>
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    )

    const newLog = {
      id: Date.now(),
      itemName: updatedItem.itemName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Damaged item status updated to ${updatedItem.status}`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleRemoveDamagedItem = (itemId) => {
    const item = damagedItems.find(i => i.id === itemId)
    
    setDamagedItems(prev => prev.filter(i => i.id !== itemId))

    if (item) {
      const newLog = {
        id: Date.now(),
        itemName: item.itemName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Removed from damaged items list'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  // ========== RENDER ==========

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-6">
          {/* Logo/Brand */}
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

          {/* User Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
          </div>

          {/* Navigation Menu */}
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
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-medium text-left">Manage Inventory</span>
              </button>
            )}

            <button
              onClick={() => handleNavigate('suppliers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'suppliers' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Suppliers</span>
            </button>

            <button
              onClick={() => handleNavigate('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'categories' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium">Categories</span>
            </button>

            <button
              onClick={() => handleNavigate('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'appointments' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Appointments</span>
            </button>

            <button
              onClick={() => handleNavigate('damaged')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'damaged' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">Damaged Items</span>
            </button>

            <button
              onClick={() => handleNavigate('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'logs' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Activity Logs</span>
            </button>
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors mt-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        {currentPage === 'dashboard' && (
          <Dashboard
            user={currentUser}
            inventoryData={inventoryData}
            activityLogs={activityLogs}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'transactions' && (
          <StockTransactions
            user={currentUser}
            inventoryData={inventoryData}
            transactionHistory={transactionHistory}
            onTransaction={handleTransaction}
          />
        )}

        {/* ✅ UPDATED: Added suppliers and categories props */}
        {currentPage === 'inventory' && currentUser.role === 'Admin' && (
          <InventoryTable
            user={currentUser}
            inventoryData={inventoryData}
            suppliers={suppliers}
            categories={categories}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {/* ✅ UPDATED: Added categories and onAddItem props */}
        {currentPage === 'suppliers' && (
          <SuppliersPage
            user={currentUser}
            suppliers={suppliers}
            inventoryData={inventoryData}
            categories={categories}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onAddItem={handleAddItem}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage
            user={currentUser}
            categories={categories}
            inventoryData={inventoryData}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentPage === 'appointments' && (
          <AppointmentsPage
            user={currentUser}
            appointments={appointments}
            suppliers={suppliers}
            inventoryData={inventoryData}
            onScheduleAppointment={handleScheduleAppointment}
            onEditAppointment={handleEditAppointment}
            onCancelAppointment={handleCancelAppointment}
            onCompleteAppointment={handleCompleteAppointment}
          />
        )}

        {currentPage === 'damaged' && (
          <DamagedItemsPage
            user={currentUser}
            damagedItems={damagedItems}
            onUpdateDamagedItem={handleUpdateDamagedItem}
            onRemoveDamagedItem={handleRemoveDamagedItem}
          />
        )}

        {currentPage === 'logs' && (
          <ActivityLogs activityLogs={activityLogs} />
        )}
      </main>
    </div>
  )
}