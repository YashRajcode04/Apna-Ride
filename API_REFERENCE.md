# Car Rental API Reference Guide

**Base URL**: `http://localhost:5000`

**Authentication**: All protected endpoints require `Authorization: Bearer {accessToken}` header

---

## 🔐 Authentication Endpoints

### 1. Register New User
```
POST /api/auth/register
Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "+919876543210"
}

Response (201):
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Login User
```
POST /api/auth/login
Body:
{
  "email": "john@example.com",
  "password": "Password@123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": { ...user details },
    "accessToken": "...",
    "refreshToken": "..."
  }
}

Errors:
- 400: Invalid credentials
- 423: Account locked (multiple failed attempts)
```

### 3. Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
Body:
{
  "refreshToken": "..."
}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. Refresh Token
```
POST /api/auth/refresh-token
Body:
{
  "refreshToken": "..."
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 5. Forgot Password
```
POST /api/auth/forgot-password
Body:
{
  "email": "john@example.com"
}

Response (200):
{
  "success": true,
  "message": "Reset link sent to email"
}
```

### 6. Reset Password
```
PUT /api/auth/reset-password/{token}
Body:
{
  "password": "NewPassword@123"
}

Response (200):
{
  "success": true,
  "message": "Password reset successful"
}
```

### 7. Change Password (Authenticated)
```
PUT /api/auth/change-password
Headers: Authorization: Bearer {token}
Body:
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@123"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 8. Update Profile (Authenticated)
```
PUT /api/auth/profile
Headers: Authorization: Bearer {token}
Body:
{
  "name": "John Updated",
  "phone": "+919876543211"
}

Response (200):
{
  "success": true,
  "data": { ...updated user }
}
```

### 9. OTP Request
```
POST /api/auth/otp/request
Body:
{
  "phone": "+919876543210",
  "method": "sms"
}

Response (200):
{
  "success": true,
  "message": "OTP sent",
  "data": {
    "otpId": "...",
    "expiresIn": 600
  }
}
```

### 10. OTP Verify
```
POST /api/auth/otp/verify
Body:
{
  "phone": "+919876543210",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "data": {
    "user": { ...user details },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## 🚗 Car Endpoints

### 1. Get All Cars
```
GET /api/cars?page=1&limit=10&location=Mumbai&brand=Toyota
Query Params:
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)
  - location: Filter by location
  - brand: Filter by brand
  - isAvailable: true/false
  - isApproved: true/false

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Toyota Fortuner",
      "brand": "Toyota",
      "type": "SUV",
      "year": 2023,
      "seats": 7,
      "fuelType": "Diesel",
      "transmission": "Automatic",
      "pricePerDay": 5000,
      "location": "Mumbai",
      "images": [{ url: "...", public_id: "..." }],
      "isAvailable": true,
      "isApproved": true,
      "owner": { _id: "...", name: "..." }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### 2. Get Car Details
```
GET /api/cars/{carId}

Response (200):
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Toyota Fortuner",
    ...all car details,
    "reviews": [
      {
        "_id": "...",
        "rating": 5,
        "comment": "Great car!",
        "user": { name: "..." }
      }
    ]
  }
}
```

### 3. Create Car (Owner/Admin)
```
POST /api/cars
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Body:
{
  "name": "Toyota Fortuner",
  "brand": "Toyota",
  "type": "SUV",
  "year": 2023,
  "model": "Fortuner 4x4",
  "seats": 7,
  "fuelType": "Diesel",
  "transmission": "Automatic",
  "pricePerDay": 5000,
  "location": "Mumbai",
  "description": "Premium 7-seater SUV",
  "features": ["AC", "Power Steering"],
  "rules": ["No smoking"],
  "images": [File objects]
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "...",
    ...car details,
    "isApproved": false
  },
  "message": "Car added. Awaiting admin approval."
}
```

### 4. Update Car (Owner/Admin)
```
PUT /api/cars/{carId}
Headers: Authorization: Bearer {token}
Body:
{
  "name": "Updated Name",
  "pricePerDay": 5500,
  ...other updateable fields
}

Response (200):
{
  "success": true,
  "data": { ...updated car }
}
```

### 5. Delete Car (Owner/Admin)
```
DELETE /api/cars/{carId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Car deleted successfully"
}
```

### 6. Get My Cars (Owner)
```
GET /api/cars/my-cars
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    { ...car details with only owner's cars }
  ]
}
```

### 7. Approve Car (Admin)
```
PUT /api/cars/{carId}/approve
Headers: Authorization: Bearer {token}
Body:
{
  "isApproved": true
}

Response (200):
{
  "success": true,
  "message": "Car approved successfully"
}
```

### 8. Upload Car Images (Owner)
```
POST /api/cars/{carId}/images
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Body:
{
  "images": [File1, File2, ...]
}

Response (200):
{
  "success": true,
  "data": {
    "_id": "...",
    "images": [
      { url: "...", public_id: "..." }
    ]
  }
}
```

---

## 📋 Booking Endpoints

### 1. Create Booking
```
POST /api/bookings
Headers: Authorization: Bearer {token}
Body:
{
  "carId": "...",
  "pickupDate": "2024-03-25",
  "pickupTime": "10:00",
  "dropoffDate": "2024-03-27",
  "dropoffTime": "18:00",
  "notes": "Optional notes"
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "...",
    "car": { ...car details },
    "user": "...",
    "pickupDate": "2024-03-25T10:00:00Z",
    "dropoffDate": "2024-03-27T18:00:00Z",
    "numberOfDays": 2,
    "totalPrice": 10000,
    "status": "pending",
    "paymentStatus": "pending"
  }
}

Errors:
- 400: Car not available for dates
- 400: Invalid date range
```

### 2. Get My Bookings (User)
```
GET /api/bookings/my-bookings?status=confirmed&page=1
Headers: Authorization: Bearer {token}
Query Params:
  - status: pending/confirmed/completed/cancelled
  - page: Page number
  
Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "car": { ...car details },
      "pickupDate": "...",
      "dropoffDate": "...",
      "totalPrice": 10000,
      "status": "confirmed",
      "paymentStatus": "completed"
    }
  ]
}
```

### 3. Get All Bookings (Admin)
```
GET /api/bookings?limit=10&page=1
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [ ...all bookings with full details ]
}
```

### 4. Get Booking Details
```
GET /api/bookings/{bookingId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": { ...full booking details }
}
```

### 5. Update Booking
```
PUT /api/bookings/{bookingId}
Headers: Authorization: Bearer {token}
Body:
{
  "status": "confirmed",
  "paymentStatus": "completed"
}

Response (200):
{
  "success": true,
  "data": { ...updated booking }
}
```

### 6. Cancel Booking
```
DELETE /api/bookings/{bookingId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "...",
    "status": "cancelled"
  }
}
```

---

## ⭐ Review Endpoints

### 1. Create Review
```
POST /api/reviews
Headers: Authorization: Bearer {token}
Body:
{
  "carId": "...",
  "bookingId": "...",
  "rating": 5,
  "title": "Excellent Car",
  "comment": "Great experience"
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "...",
    "car": "...",
    "user": "...",
    "rating": 5,
    "title": "Excellent Car",
    "comment": "Great experience"
  }
}
```

### 2. Get Car Reviews
```
GET /api/reviews/car/{carId}

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Great!",
      "user": { name: "..." },
      "createdAt": "..."
    }
  ]
}
```

### 3. Get My Reviews
```
GET /api/reviews/my-reviews
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [ ...user's reviews ]
}
```

---

## 👥 User Management Endpoints (Admin)

### 1. Get All Users
```
GET /api/admin/users?search=john&role=user&page=1
Headers: Authorization: Bearer {token}
Query Params:
  - search: Search by name/email
  - role: user/owner/admin
  - page: Page number

Response (200):
{
  "success": true,
  "data": [ ...all users ]
}
```

### 2. Get User Details
```
GET /api/admin/users/{userId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "user",
    "createdAt": "..."
  }
}
```

### 3. Update User Role
```
PUT /api/admin/users/{userId}/role
Headers: Authorization: Bearer {token}
Body:
{
  "role": "admin"
}

Response (200):
{
  "success": true,
  "message": "User role updated"
}
```

### 4. Delete User
```
DELETE /api/admin/users/{userId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📊 Admin Statistics Endpoints

### 1. Get Dashboard Stats
```
GET /api/admin/stats
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalCars": 45,
    "totalBookings": 320,
    "totalRevenue": 850000,
    "pendingCars": 5,
    "pendingBookings": 12,
    "activeCars": 40,
    "completedBookings": 300
  }
}
```

### 2. Get Platform Revenue
```
GET /api/admin/revenue?month=03&year=2024
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "month": 3,
    "year": 2024,
    "totalRevenue": 250000,
    "totalBookings": 100,
    "averageRevenue": 2500
  }
}
```

---

## ✅ Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🔑 Authentication Headers

All authenticated requests must include:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

Example:
```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
};
```

---

## ⏱️ Rate Limiting

- **General APIs**: 100 requests per 15 minutes
- **Auth APIs**: 5 requests per 15 minutes
- **Error Response**: `429 Too Many Requests`

---

## 🔐 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 423 | Locked - Account locked |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error |

---

**Use this guide to integrate frontend with backend APIs!** 🚀

