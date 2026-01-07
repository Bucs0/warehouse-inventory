// ===================================================================
// COMPONENT: src/components/Login.jsx
// CHANGES: Updated to use MySQL database for user authentication
// - Removed localStorage user management
// - Added database authentication via usersAPI
// - Pending users now stored in MySQL
// ===================================================================

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { usersAPI } from '../lib/api'

// Admin account (hardcoded for initial setup)
const ADMIN_ACCOUNT = {
  id: 1,
  username: 'admin',
  email: 'markjadebucao10@gmail.com',
  password: 'q110978123',
  role: 'Admin',
  name: 'Mark Jade Bucao',
  status: 'approved'
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [loginData, setLoginData] = useState({ usernameOrEmail: '', password: '' })
  const [signupData, setSignupData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    name: '' 
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setIsLoading(true)

    try {
      const input = loginData.usernameOrEmail.toLowerCase().trim()

      // Check admin account first
      if ((input === ADMIN_ACCOUNT.username || input === ADMIN_ACCOUNT.email.toLowerCase()) 
          && loginData.password === ADMIN_ACCOUNT.password) {
        onLogin(ADMIN_ACCOUNT)
        return
      }

      // Check database for staff users
      const result = await usersAPI.getByCredentials(input, loginData.password)
      
      if (result.success && result.data) {
        onLogin({
          id: result.data.id,
          username: result.data.username,
          email: result.data.email,
          name: result.data.name,
          role: result.data.role,
          status: result.data.status
        })
      } else {
        // Check if user is pending
        const pendingResult = await usersAPI.getPending()
        if (pendingResult.success) {
          const pendingUser = pendingResult.data.find(u => 
            u.username.toLowerCase() === input || u.email.toLowerCase() === input
          )
          
          if (pendingUser) {
            setError('Your account is pending admin approval. Please wait for approval.')
          } else {
            setError('Invalid username/email or password')
          }
        } else {
          setError('Invalid username/email or password')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    setError('')

    // Validation
    if (!signupData.username || !signupData.email || !signupData.password || !signupData.name) {
      setError('Please fill in all fields')
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!signupData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    // Check if username/email is admin
    if (signupData.username === ADMIN_ACCOUNT.username || 
        signupData.email === ADMIN_ACCOUNT.email) {
      setError('This username or email is reserved')
      return
    }

    setIsLoading(true)

    try {
      // Add user to database with pending status
      const result = await usersAPI.add({
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        role: 'Staff'
      })

      if (result.success) {
        setMode('pendingApproval')
        setSignupData({ username: '', email: '', password: '', confirmPassword: '', name: '' })
      } else {
        setError(result.error || 'Signup failed. Username or email may already exist.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  // Pending Approval View
  if (mode === 'pendingApproval') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle>Account Pending Approval</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Your account has been created successfully!
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm">
                Please wait for the admin to approve your account. You will be able to login once your account is approved.
              </p>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode('login')}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Signup View
  if (mode === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-center">Staff Sign Up</CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Create your staff account
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Button onClick={handleSignup} className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  Already have an account? Login
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login View
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-center">Warehouse Inventory System</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Login to access the system
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Username or Email</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter username or email"
                value={loginData.usernameOrEmail}
                onChange={(e) => setLoginData({ ...loginData, usernameOrEmail: e.target.value })}
                disabled={isLoading}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                disabled={isLoading}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setMode('signup')
                setError('')
              }}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Sign Up as Staff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


// ===================================================================
// COMPONENT: src/components/Dashboard.jsx
// CHANGES: Updated to use MySQL database for user approvals
// - Fetch pending/approved users from database
// - User approval/rejection updates database
// - Activity logs synced to database
// ===================================================================

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { usersAPI, activityLogsAPI } from '../lib/api'

export default function Dashboard({ user, inventoryData, activityLogs, onNavigate }) {
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [pendingUsers, setPendingUsers] = useState([])
  const [approvedUsers, setApprovedUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load users from database
  useEffect(() => {
    const loadUsers = async () => {
      if (user.role !== 'Admin') return
      
      setIsLoading(true)
      try {
        const [pendingResult, approvedResult] = await Promise.all([
          usersAPI.getPending(),
          usersAPI.getApproved()
        ])

        if (pendingResult.success) {
          setPendingUsers(pendingResult.data.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            role: u.role,
            signupDate: new Date(u.created_at).toLocaleDateString('en-PH')
          })))
        }

        if (approvedResult.success) {
          setApprovedUsers(approvedResult.data.filter(u => u.role !== 'Admin').map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            role: u.role,
            status: u.status
          })))
        }
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUsers()
    
    // Poll for changes every 10 seconds
    const interval = setInterval(loadUsers, 10000)
    return () => clearInterval(interval)
  }, [user.role])

  const handleApproveUser = async (userId) => {
    const userToApprove = pendingUsers.find(u => u.id === userId)
    if (!userToApprove) return

    setIsLoading(true)
    try {
      const result = await usersAPI.approve(userId)
      
      if (result.success) {
        // Reload users
        const [pendingResult, approvedResult] = await Promise.all([
          usersAPI.getPending(),
          usersAPI.getApproved()
        ])

        if (pendingResult.success) {
          setPendingUsers(pendingResult.data.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            role: u.role,
            signupDate: new Date(u.created_at).toLocaleDateString('en-PH')
          })))
        }

        if (approvedResult.success) {
          setApprovedUsers(approvedResult.data.filter(u => u.role !== 'Admin').map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            role: u.role,
            status: u.status
          })))
        }

        // Log activity
        await activityLogsAPI.add({
          itemName: `User Account: ${userToApprove.name}`,
          action: 'Added',
          details: `Approved staff account for ${userToApprove.name} (@${userToApprove.username})`
        }, user.id)

        alert(`✅ ${userToApprove.name} has been approved!`)
      }
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectUser = async (userId) => {
    const userToReject = pendingUsers.find(u => u.id === userId)
    if (!userToReject) return

    if (!window.confirm(`Are you sure you want to reject ${userToReject.name}'s signup request?`)) {
      return
    }

    setIsLoading(true)
    try {
      const result = await usersAPI.reject(userId)
      
      if (result.success) {
        // Reload pending users
        const pendingResult = await usersAPI.getPending()
        
        if (pendingResult.success) {
          setPendingUsers(pendingResult.data.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            role: u.role,
            signupDate: new Date(u.created_at).toLocaleDateString('en-PH')
          })))
        }

        // Log activity
        await activityLogsAPI.add({
          itemName: `User Account: ${userToReject.name}`,
          action: 'Deleted',
          details: `Rejected staff signup request from ${userToReject.name} (@${userToReject.username})`
        }, user.id)

        alert(`${userToReject.name}'s request has been rejected`)
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject user')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const totalItems = inventoryData.length
  const lowStockItems = inventoryData.filter(item => item.quantity <= item.reorderLevel).length
  const damagedItems = inventoryData.filter(item => item.damagedStatus === 'Damaged').length
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0)

  const recentActivities = activityLogs.slice(-5).reverse()

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}! 
            <Badge variant="outline" className="ml-2">{user.role}</Badge>
          </p>
        </div>
        
        <div className="flex gap-2">
          {user.role === 'Admin' && (
            <Button 
              variant="outline"
              onClick={() => setIsApprovalDialogOpen(true)}
              className="relative"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Approvals
              {pendingUsers.length > 0 && (
                <Badge variant="warning" className="ml-2">{pendingUsers.length}</Badge>
              )}
            </Button>
          )}
          
          {user.role === 'Admin' && (
            <Button variant="outline" onClick={() => onNavigate('inventory')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              View Full Inventory
            </Button>
          )}
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-3xl font-bold mt-2">{totalItems}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <h3 className="text-3xl font-bold mt-2 text-orange-600">{lowStockItems}</h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Damaged Items</p>
                <h3 className="text-3xl font-bold mt-2 text-red-600">{damagedItems}</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <h3 className="text-3xl font-bold mt-2 text-green-600">
                  ₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('logs')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activities
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    log.action === 'Added' ? 'bg-green-100' :
                    log.action === 'Edited' ? 'bg-blue-100' :
                    'bg-red-100'
                  }`}>
                    {log.action === 'Added' && (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {log.action === 'Edited' && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002KS