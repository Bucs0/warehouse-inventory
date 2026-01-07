// ===================================================================
// COMPONENT: AddItemDialog.jsx
// STATUS: ✅ UPDATED for MySQL database
// CHANGES: 
// - Updated to work with category/location IDs from database
// - Simplified data structure for API compatibility
// ===================================================================

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'

export default function AddItemDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  suppliers = [],
  categories = [],
  locations = [] 
}) {
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    quantity: '',
    locationId: '',
    reorderLevel: '10',
    price: '',
    supplierId: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.itemName || !formData.quantity || !formData.locationId || !formData.categoryId) {
      alert('Please fill in all required fields (Item Name, Category, Quantity, Location)')
      return
    }

    // Get the actual names for display
    const category = categories.find(c => c.id === parseInt(formData.categoryId))
    const location = locations.find(l => l.id === parseInt(formData.locationId))
    const supplier = suppliers.find(s => s.id === parseInt(formData.supplierId))

    const newItem = {
      itemName: formData.itemName,
      categoryId: parseInt(formData.categoryId),
      quantity: parseInt(formData.quantity) || 0,
      locationId: parseInt(formData.locationId),
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      price: parseFloat(formData.price) || 0,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
      // Include display names for immediate UI update (will be overwritten by server response)
      category: category?.categoryName || 'Other',
      location: location?.locationName || 'Unknown',
      supplier: supplier?.supplierName || null
    }

    onAdd(newItem)

    // Reset form
    setFormData({
      itemName: '',
      categoryId: '',
      quantity: '',
      locationId: '',
      reorderLevel: '10',
      price: '',
      supplierId: ''
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">
              Item Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="itemName"
              placeholder="e.g., A4 Bond Paper"
              value={formData.itemName}
              onChange={(e) => handleChange('itemName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              id="category"
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

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select
              id="supplier"
              value={formData.supplierId}
              onChange={(e) => handleChange('supplierId', e.target.value)}
            >
              <option value="">Select Supplier (Optional)...</option>
              {suppliers
                .filter(s => s.isActive)
                .map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplierName}
                  </option>
                ))
              }
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="e.g., 100"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                min="0"
                placeholder="e.g., 10"
                value={formData.reorderLevel}
                onChange={(e) => handleChange('reorderLevel', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            {locations && locations.length > 0 ? (
              <Select
                id="location"
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
                No locations available. Please add locations first in Manage Locations.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₱)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 250.00"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}