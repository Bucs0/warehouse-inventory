// ===================================================================
// COMPONENT: NewItemQuickAddDialog.jsx
// STATUS: ✅ UPDATED for MySQL database
// CHANGES: 
// - Updated to use category/location IDs
// - Removed quantity field (set to 0 automatically)
// ===================================================================

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function NewItemQuickAddDialog({ 
  open, 
  onOpenChange, 
  itemName, 
  categories,
  locations = [],
  onComplete 
}) {
  const [formData, setFormData] = useState({
    categoryId: '',
    locationId: '',
    reorderLevel: '10',
    price: ''
  })

  // Reset form when itemName changes
  useEffect(() => {
    if (itemName) {
      setFormData({
        categoryId: categories.length > 0 ? categories[0].id.toString() : '',
        locationId: '',
        reorderLevel: '10',
        price: ''
      })
    }
  }, [itemName, categories])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.locationId || !formData.categoryId) {
      alert('Please select a category and location')
      return
    }

    const itemData = {
      categoryId: parseInt(formData.categoryId),
      locationId: parseInt(formData.locationId),
      quantity: 0, // Always 0 for new items
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      price: parseFloat(formData.price) || 0
    }

    onComplete(itemData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item Details</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Complete the information for: <Badge variant="outline">{itemName}</Badge>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="quick-category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              id="quick-category"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              required
            >
              <option value="">Select Category...</option>
              {categories && categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </Select>
          </div>

          {/* Reorder Level */}
          <div className="space-y-2">
            <Label htmlFor="quick-reorderLevel">Reorder Level</Label>
            <Input
              id="quick-reorderLevel"
              type="number"
              min="0"
              placeholder="e.g., 10"
              value={formData.reorderLevel}
              onChange={(e) => handleChange('reorderLevel', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Initial quantity will be set to 0. Use Stock Transactions to add inventory.
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="quick-location">
              Location <span className="text-red-500">*</span>
            </Label>
            {locations && locations.length > 0 ? (
              <Select
                id="quick-location"
                value={formData.locationId}
                onChange={(e) => handleChange('locationId', e.target.value)}
                required
              >
                <option value="">Select Location...</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.locationName}
                    {location.description && ` - ${location.description}`}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground border rounded-lg p-3 bg-yellow-50">
                ⚠️ No locations available. Please add locations first in Manage Locations.
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="quick-price">Price (₱)</Label>
            <Input
              id="quick-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 250.00"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>

          {/* Info message about quantity */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Initial Quantity</p>
                <p className="mt-1">This item will be created with 0 quantity. Add stock later using the Stock Transactions feature.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.locationId || !formData.categoryId}
          >
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}