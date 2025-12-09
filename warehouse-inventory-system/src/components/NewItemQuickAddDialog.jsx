
// Quick dialog for adding item info when creating supplier with new items

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
  onComplete 
}) {
  const [formData, setFormData] = useState({
    category: 'Office Supplies',
    quantity: '',
    location: '',
    reorderLevel: '10',
    price: ''
  })

  // Reset form when itemName changes
  useEffect(() => {
    if (itemName) {
      setFormData({
        category: 'Office Supplies',
        quantity: '',
        location: '',
        reorderLevel: '10',
        price: ''
      })
    }
  }, [itemName])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.quantity || !formData.location) {
      alert('Please fill in quantity and location')
      return
    }

    const itemData = {
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
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
            <Label htmlFor="quick-category">Category</Label>
            <Select
              id="quick-category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {categories && categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat.id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))
              ) : (
                <>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Other">Other</option>
                </>
              )}
            </Select>
          </div>

          {/* Quantity and Reorder Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quick-quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quick-quantity"
                type="number"
                min="0"
                placeholder="e.g., 100"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
              />
            </div>
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
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="quick-location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quick-location"
              placeholder="e.g., Warehouse A, Shelf 3"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
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
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}