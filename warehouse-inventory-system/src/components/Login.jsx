// Login component with role-based authentication
// May dalawang user roles: Admin at Staff

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

// Dummy users para sa demo (walang database pa)

const DEMO_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'Admin',
    name: 'Mark Jade Bucao'
  },
  {
    id: 2,
    username: 'staff',
    password: 'staff123',
    role: 'Staff',
    name: 'Chadrick Arsenal'
  }
]

export default function Login({ onLogin }) {
  // State para sa form inputs
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Function na nag-hahandle ng login
  const handleLogin = (e) => {
    e.preventDefault() // Prevent page reload
    setError('') // Clear previous errors
    setIsLoading(true)

    // Simulate loading time (para realistic)
    setTimeout(() => {
      // Check kung may matching user
      const user = DEMO_USERS.find(
        u => u.username === username && u.password === password
      )

      if (user) {
        // Success! Pass user data to parent component
        onLogin(user)
      } else {
        // Failed login
        setError('Wrong username or password')
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          {/* Logo/Title section */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                />
              </svg>
            </div>
            <CardTitle className="text-2xl text-center">
              Warehouse Inventory System
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Login to access the system
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Error message kung may mali */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Login button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loging-in...' : 'Login'}
            </Button>
          </form>


          {/*credentials info*/}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-3">
              
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600"></span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded"></code>
                  <Badge variant="destructive"></Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600"></span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded"></code>
                  <Badge variant="secondary"></Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}