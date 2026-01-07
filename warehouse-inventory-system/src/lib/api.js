// ===================================================================
// UPDATED FILE: src/lib/api.js
// PURPOSE: Frontend API service - makes HTTP requests to backend
// CHANGES: Replaced direct MySQL calls with fetch API calls
// ===================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    return { success: false, error: error.message };
  }
};

// ==================== INVENTORY API ====================

export const inventoryAPI = {
  getAll: async () => {
    return await apiCall('/inventory');
  },

  getById: async (id) => {
    return await apiCall(`/inventory/${id}`);
  },

  add: async (itemData) => {
    return await apiCall('/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  update: async (id, itemData) => {
    return await apiCall(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },

  delete: async (id) => {
    return await apiCall(`/inventory/${id}`, {
      method: 'DELETE',
    });
  },

  getLowStock: async () => {
    const result = await apiCall('/inventory');
    if (result.success) {
      const lowStock = result.data.filter(item => item.quantity <= item.reorder_level);
      return { success: true, data: lowStock };
    }
    return result;
  }
};

// ==================== SUPPLIERS API ====================

export const suppliersAPI = {
  getAll: async () => {
    return await apiCall('/suppliers');
  },

  getById: async (id) => {
    return await apiCall(`/suppliers/${id}`);
  },

  add: async (supplierData) => {
    return await apiCall('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  update: async (id, supplierData) => {
    return await apiCall(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },

  delete: async (id) => {
    return await apiCall(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }
};

// ==================== CATEGORIES API ====================

export const categoriesAPI = {
  getAll: async () => {
    return await apiCall('/categories');
  },

  add: async (categoryData) => {
    return await apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (id, categoryData) => {
    return await apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (id) => {
    return await apiCall(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
};

// ==================== LOCATIONS API ====================

export const locationsAPI = {
  getAll: async () => {
    return await apiCall('/locations');
  },

  add: async (locationData) => {
    return await apiCall('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },

  update: async (id, locationData) => {
    return await apiCall(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  },

  delete: async (id) => {
    return await apiCall(`/locations/${id}`, {
      method: 'DELETE',
    });
  }
};

// ==================== TRANSACTIONS API ====================

export const transactionsAPI = {
  getAll: async () => {
    return await apiCall('/transactions');
  },

  add: async (transactionData, userId) => {
    return await apiCall('/transactions', {
      method: 'POST',
      body: JSON.stringify({ ...transactionData, userId }),
    });
  }
};

// ==================== APPOINTMENTS API ====================

export const appointmentsAPI = {
  getAll: async () => {
    return await apiCall('/appointments');
  },

  getById: async (id) => {
    return await apiCall(`/appointments/${id}`);
  },

  add: async (appointmentData, userId) => {
    return await apiCall('/appointments', {
      method: 'POST',
      body: JSON.stringify({ ...appointmentData, userId }),
    });
  },

  update: async (id, appointmentData) => {
    return await apiCall(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  },

  complete: async (id, userId) => {
    return await apiCall(`/appointments/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  cancel: async (id) => {
    return await apiCall(`/appointments/${id}/cancel`, {
      method: 'PUT',
    });
  },

  delete: async (id) => {
    return await apiCall(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }
};

// ==================== ACTIVITY LOGS API ====================

export const activityLogsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.action) params.append('action', filters.action);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    
    const queryString = params.toString();
    return await apiCall(`/activity-logs${queryString ? `?${queryString}` : ''}`);
  },

  add: async (logData, userId) => {
    return await apiCall('/activity-logs', {
      method: 'POST',
      body: JSON.stringify({ ...logData, userId }),
    });
  }
};

// ==================== DAMAGED ITEMS API ====================

export const damagedItemsAPI = {
  getAll: async () => {
    return await apiCall('/damaged-items');
  },

  update: async (id, updateData) => {
    return await apiCall(`/damaged-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  delete: async (id) => {
    return await apiCall(`/damaged-items/${id}`, {
      method: 'DELETE',
    });
  }
};

// ==================== USERS API ====================

export const usersAPI = {
  getByCredentials: async (usernameOrEmail, password) => {
    return await apiCall('/users/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
  },

  getPending: async () => {
    return await apiCall('/users/pending');
  },

  getApproved: async () => {
    return await apiCall('/users/approved');
  },

  add: async (userData) => {
    return await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  approve: async (id) => {
    return await apiCall(`/users/${id}/approve`, {
      method: 'PUT',
    });
  },

  reject: async (id) => {
    return await apiCall(`/users/${id}/reject`, {
      method: 'DELETE',
    });
  }
};