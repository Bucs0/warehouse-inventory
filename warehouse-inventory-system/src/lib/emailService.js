// ============================================
// FILE: src/lib/emailService.js (UPDATED)
// ============================================
// Email notification service using EmailJS

// ✅ STEP 1: Replace these with your EmailJS credentials
// Get them from: https://www.emailjs.com/
const EMAILJS_SERVICE_ID = 'service_an2ngeg' // e.g., 'service_abc123'
const EMAILJS_TEMPLATE_ID_LOW_STOCK = 'template_l3vz6al' // e.g., 'template_lowstock'
const EMAILJS_TEMPLATE_ID_APPOINTMENT = 'template_x3a2ecb' // e.g., 'template_appointment'
const EMAILJS_PUBLIC_KEY = 'Lk9FwnFHIYBdz8d-d' // e.g., 'abcdef123456'

// Load EmailJS library
const loadEmailJS = () => {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      resolve(window.emailjs)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY)
      resolve(window.emailjs)
    }
    script.onerror = () => reject(new Error('Failed to load EmailJS'))
    document.head.appendChild(script)
  })
}

/**
 * Send low stock alert email to admin
 */
export const sendLowStockAlert = async (item, adminEmail) => {
  try {
    const emailjs = await loadEmailJS()

    const templateParams = {
      to_email: adminEmail,
      to_name: 'Admin',
      item_name: item.itemName,
      current_quantity: item.quantity,
      reorder_level: item.reorderLevel,
      location: item.location,
      category: item.category,
      supplier: item.supplier || 'No supplier assigned',
      alert_date: new Date().toLocaleString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_LOW_STOCK,
      templateParams
    )

    console.log('✅ Low stock alert email sent:', response)
    return { success: true, response }
  } catch (error) {
    console.error('❌ Failed to send low stock alert:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send appointment confirmation email to supplier
 */
export const sendAppointmentEmail = async (appointment, supplier) => {
  try {
    const emailjs = await loadEmailJS()

    // Format items list
    const itemsList = appointment.items
      .map(item => `• ${item.itemName} - ${item.quantity} units`)
      .join('\n')

    const appointmentDate = new Date(appointment.date)
    const formattedDate = appointmentDate.toLocaleDateString('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    const templateParams = {
      to_email: supplier.contactEmail,
      to_name: supplier.contactPerson,
      supplier_name: supplier.supplierName,
      appointment_date: formattedDate,
      appointment_time: appointment.time,
      items_list: itemsList,
      total_items: appointment.items.length,
      notes: appointment.notes || 'No additional notes',
      scheduled_by: appointment.scheduledBy,
      status: appointment.status,
      contact_phone: supplier.contactPhone || 'Not provided'
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_APPOINTMENT,
      templateParams
    )

    console.log('✅ Appointment confirmation email sent:', response)
    return { success: true, response }
  } catch (error) {
    console.error('❌ Failed to send appointment email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if EmailJS is properly configured
 */
export const isEmailConfigured = () => {
  return EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
         EMAILJS_TEMPLATE_ID_LOW_STOCK !== 'YOUR_LOW_STOCK_TEMPLATE_ID' &&
         EMAILJS_TEMPLATE_ID_APPOINTMENT !== 'YOUR_APPOINTMENT_TEMPLATE_ID' &&
         EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
}

/**
 * Send test email
 */
export const sendTestEmail = async (testEmail) => {
  try {
    const emailjs = await loadEmailJS()

    const templateParams = {
      to_email: testEmail,
      to_name: 'Test User',
      message: 'This is a test email from your Warehouse Inventory System. Email notifications are working correctly!',
      test_date: new Date().toLocaleString('en-PH')
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_LOW_STOCK,
      templateParams
    )

    return { success: true, response }
  } catch (error) {
    console.error('Test email failed:', error)
    return { success: false, error: error.message }
  }
}