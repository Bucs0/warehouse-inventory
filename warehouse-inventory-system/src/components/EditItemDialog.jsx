// ===================================================================
// COMPONENT: EditItemDialog.jsx
// STATUS: ✅ UPDATED for MySQL database
// CHANGES: 
// - Updated to work with category/location IDs
// - Properly handles ID-based relationships
// ===================================================================

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'

export default function EditItemDialog({ 
  open, 
  onOpenChange, 
  item, 
  onEdit, 
  suppliers, 
  categories,
  locations = []  
}) {
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    quantity: '',
    locationId: '',
    reorderLevel: '',
    price: '',
    supplierId: null
  })

  useEffect(() => {
    if (item) {
      // Find IDs from names if item has names instead of IDs
      const category = categories.find(c => c.categoryName === item.category)
      const location = locations.find(l => l.locationName === item.location)
      
      setFormData({
        itemName: item.itemName || '',
        categoryId: item.categoryId || category?.id || '',
        quantity: item.quantity?.toString() || '',
        locationId: item.locationId || location?.id || '',
        reorderLevel: item.reorderLevel?.toString() || '',
        price: item.price?.toString() || '',
        supplierId: item.supplierId || null
      })
    }
  }, [item, categories, locations])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.itemName || !formData.quantity || !formData.locationId || !formData.categoryId) {
      alert('Please fill in all required fields')
      return
    }

    // Get names for display
    const category = categories.find(c => c.id === parseInt(formData.categoryId))
    const location = locations.find(l => l.id === parseInt(formData.locationId))
    const supplier = suppliers.find(s => s.id === parseInt(formData.supplierId))

    const updatedItem = {
      ...item,
      itemName: formData.itemName,
      categoryId: parseInt(formData.categoryId),
      quantity: parseInt(formData.quantity) || 0,
      locationId: parseInt(formData.locationId),
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      price: parseFloat(formData.price) || 0,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
      // Include display names for immediate UI update
      category: category?.categoryName || 'Other',
      location: location?.locationName || 'Unknown',
      supplier: supplier?.supplierName || null
    }

    onEdit(updatedItem)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-itemName">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-itemName"
                placeholder="e.g., A4 Bond Paper"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                id="edit-category"
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                required
              >
                <option value="">Select Category...</option>
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))
                ) : (
                  <option disabled>No categories available</option>
                )}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Select
                id="edit-supplier"
                value={formData.supplierId || ''}
                onChange={(e) => handleChange('supplierId', e.target.value || null)}
              >
                <option value="">Select Supplier...</option>
                {suppliers && suppliers
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
                <Label htmlFor="edit-quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                <Input
                  id="edit-reorderLevel"
                  type="number"
                  min="0"
                  placeholder="e.g., 10"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange('reorderLevel', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">
                Location <span className="text-red-500">*</span>
              </Label>
              {locations && locations.length > 0 ? (
                <Select
                  id="edit-location"
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
                  No locations available. Current location cannot be changed.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₱)</Label>
              <Input
                id="edit-price"
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}