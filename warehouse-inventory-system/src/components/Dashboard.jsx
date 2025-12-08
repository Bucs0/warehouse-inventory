// Updated Dashboard component - removed redundant navigation buttons
// No "View Full Inventory" button for Staff
// Removed "Manage Inventory" and "Activity Logs" quick action cards

import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export default function Dashboard({ user, inventoryData, activityLogs, onNavigate }) {
  // Calculate statistics from inventory data
  const totalItems = inventoryData.length
  const lowStockItems = inventoryData.filter(item => item.quantity <= item.reorderLevel).length
  const damagedItems = inventoryData.filter(item => item.damagedStatus === 'Damaged').length
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0)

  // Get recent activities (last 5)
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
        {/* Only show "View Full Inventory" button for Admin */}
        {user.role === 'Admin' && (
          <Button variant="outline" onClick={() => onNavigate('inventory')}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            View Full Inventory
          </Button>
        )}
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items Card */}
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

        {/* Low Stock Card */}
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

        {/* Damaged Items Card */}
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

        {/* Total Value Card */}
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

      {/* Recent Activities Section */}
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
                  {/* Icon based on action */}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                    {log.action === 'Deleted' && (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </div>

                  {/* Activity details */}
                  <div className="flex-1">
                    <p className="font-medium">{log.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.action} by {log.userName} • {log.timestamp}
                    </p>
                  </div>

                  {/* Action badge */}
                  <Badge variant={
                    log.action === 'Added' ? 'success' :
                    log.action === 'Edited' ? 'default' :
                    'destructive'
                  }>
                    {log.action}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Only show "Generate Reports" for now */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Generate Reports</h3>
              <p className="text-sm text-muted-foreground">Coming Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}