# 🔐 Admin Guide - Car Rental Platform

## 📋 Table of Contents
1. [Admin Credentials](#admin-credentials)
2. [Admin Dashboard](#admin-dashboard)
3. [Admin Panels](#admin-panels)
4. [Features & Permissions](#features--permissions)
5. [User Management](#user-management)
6. [Car Management](#car-management)
7. [Booking Management](#booking-management)
8. [Best Practices](#best-practices)

---

## 🔑 Admin Credentials

### Primary Admin Account
```
Email:     admin@apnaride.com
Password:  Admin@123
Role:      Administrator
```

### How to Login
1. Go to http://localhost:3000/ (or your frontend URL)
2. Click **"Login"** button from the navbar
3. Enter email: `admin@apnaride.com`
4. Enter password: `Admin@123`
5. Click **"Sign In"**
6. You will be redirected to the **Admin Dashboard**

---

## 📊 Admin Dashboard

### Dashboard Overview
The Admin Dashboard displays:

- **Total Statistics**
  - Total Users on the platform
  - Total Cars listed
  - Total Bookings made
  - Total Revenue (placeholder for payment integration)

- **Quick Stats Cards**
  - User count and growth
  - Car inventory status
  - Booking volume
  - Platform health indicators

### Dashboard Features
✅ Real-time statistics  
✅ User management quick access  
✅ Car approval queue  
✅ Recent bookings overview  
✅ System health monitoring  

---

## 🛠️ Admin Panels

### 1. Dashboard
**Route:** `/dashboard`
- Overview of platform statistics
- Quick action buttons to manage users, cars, and bookings
- Visual analytics and metrics

### 2. Manage Users
**Route:** `/manage-users`
- View all registered users
- See user details (name, email, phone, role)
- Update user roles (change user to owner, etc.)
- Delete user accounts
- View user's booking history

### 3. Manage Cars
**Route:** `/manage-cars`
- View all cars on the platform
- Approve/Reject car listings
- See car details and specifications
- Delete cars from the platform
- View car approval status
- Filter by approval status

### 4. Manage Bookings
**Route:** `/manage-bookings`
- View all bookings on the platform
- See booking details (user, car, dates, price)
- Update booking status (Confirmed, Completed, Cancelled)
- View revenue from bookings
- Manage dispute resolution

---

## 📌 Features & Permissions

### Admin-Only Features
✅ **User Management**
- View all users
- Change user roles
- Delete users
- View user activity

✅ **Car Approval**
- Approve new car listings
- Reject cars not meeting standards
- View pending approval queue
- Manage car inventory

✅ **Booking Oversight**
- View all bookings system-wide
- Update booking status
- Handle cancellations
- Manage refunds (when payment integrated)

✅ **Platform Control**
- Access admin analytics
- View system statistics
- Monitor platform health
- Generate reports

### Normal User Features (vs Admin)
❌ Dashboard access (BLOCKED)
❌ Car approval access (BLOCKED)
❌ User management (BLOCKED)
❌ Booking management (BLOCKED)

✅ Can view their own bookings
✅ Can list their own cars (as owner)
✅ Can rate and review cars
✅ Can manage profile

---

## 👥 User Management

### View All Users
1. Login as admin
2. Click **"Dashboard"** → **"Manage Users"**
3. Or navigate to `/manage-users`

### See User Details
- **Name:** User's full name
- **Email:** User's email address
- **Phone:** User's phone number
- **Role:** Current role (User, Owner, Admin)
- **Created:** Account creation date
- **Last Login:** Last login timestamp

### Update User Role
1. Go to Users Management page
2. Find the user in the table
3. Click the role dropdown
4. Select new role:
   - **user:** Regular customer (can book cars)
   - **owner:** Can list and manage cars
   - **admin:** Admin access (use with caution!)
5. Changes are saved immediately

### Delete a User
1. Go to Users Management page
2. Find the user
3. Click the **"Delete"** button
4. Confirm the deletion

⚠️ **Warning:** Deleting a user will also delete their bookings and listings. This action cannot be undone.

---

## 🚗 Car Management

### View All Cars
1. Go to Dashboard
2. Click **"Manage Cars"** or navigate to `/manage-cars`
3. View all cars with their status

### Car Status Types
- **✅ Available:** Car is approved and can be booked
- **⏳ Pending Approval:** New car waiting for admin review
- **❌ Unavailable:** Car currently has active bookings

### Approve a Car
1. Go to Manage Cars page
2. Look for cars with status "Pending Approval"
3. Click **"Approve"** button
4. Car immediately becomes available for booking

### Reject a Car
1. Go to Manage Cars page
2. Find the car you want to reject
3. Click **"Reject"** button
4. Car is removed from the platform
5. Owner is notified (notification ready for email integration)

### Delete a Car
1. Go to Manage Cars page
2. Find the car
3. Click **"Delete"** button
4. Car is permanently removed
5. All associated bookings are cancelled

### View Car Details
1. Go to Manage Cars page
2. Click on the car name or "View Details"
3. See full specifications:
   - Brand, Model, Year
   - Seats, Fuel Type, Transmission
   - Location, Price per day
   - Features, Description
   - Owner information
   - Number of bookings

---

## 📅 Booking Management

### View All Bookings
1. Go to Dashboard
2. Click **"Manage Bookings"** or navigate to `/manage-bookings`
3. See all bookings on the platform

### Booking Information Shown
- **User:** Customer who made the booking
- **Car:** Vehicle booked
- **Dates:** Pickup and return dates
- **Total Price:** Amount to be paid
- **Status:** Current booking status
- **Created:** When booking was made

### Update Booking Status
1. Go to Manage Bookings
2. Find the booking
3. Click the status dropdown
4. Select new status:
   - **Confirmed:** Booking is confirmed
   - **Completed:** Rental period ended
   - **Cancelled:** Booking cancelled
5. Status updates immediately

### Cancel a Booking
1. Go to Manage Bookings
2. Find the booking to cancel
3. Change status to "Cancelled"
4. User is notified (email integration ready)

---

## 🎯 Best Practices

### For Car Approval
✅ Check car photos (must be clear)  
✅ Verify car specifications  
✅ Ensure price is reasonable  
✅ Confirm owner is legitimate  
✅ Review owner's previous listings  
✅ Reject cars with poor images  
✅ Reject incomplete information  

### For User Management
✅ Review user profiles regularly  
✅ Monitor suspicious activity  
✅ Keep admin accounts secure  
✅ Use strong passwords  
✅ Change default credentials immediately  
✅ Never share admin credentials  
✅ Email: Don't use shared emails for admin  

### For Platform Management
✅ Monitor system performance  
✅ Check for duplicate listings  
✅ Review user complaints  
✅ Keep records of actions taken  
✅ Follow up on rejected cars  
✅ Promote legitimate listings  
✅ Maintain platform quality  

### Security Recommendations
🔒 Change admin password regularly  
🔒 Enable two-factor authentication (when available)  
🔒 Monitor admin login activity  
🔒 Don't leave admin account logged in  
🔒 Use VPN for remote access  
🔒 Backup admin credentials securely  

---

## 🚀 Workflow Examples

### Example 1: Approve a New Car Listing
```
1. New car owner lists car
2. Admin sees "Pending Approval" status
3. Admin clicks "View Details"
4. Admin verifies:
   - Images are clear
   - Information is complete
   - Price is reasonable
5. Admin clicks "Approve"
6. Status changes to "Available"
7. Car shows up in search for customers
8. Bookings can now be made
```

### Example 2: Handle a Problem Booking
```
1. Customer reports booking issue
2. Admin goes to Manage Bookings
3. Admin finds the booking
4. Admin reviews details
5. Admin changes status to "Cancelled" if needed
6. Admin can delete/refund if necessary
7. Send notification to user
8. Document the issue
```

### Example 3: Manage Problematic User
```
1. Multiple complaints about user
2. Admin goes to Manage Users
3. Admin finds the user
4. Reviews their booking history
5. Admin can either:
   - Warn user (future feature)
   - Suspend account (future feature)
   - Delete account if necessary
6. Document the action taken
```

---

## 📞 Support & Troubleshooting

### Can't Login as Admin?
- ✅ Verify email: `admin@apnaride.com` (case-sensitive)
- ✅ Verify password: `Admin@123` (case-sensitive)
- ✅ Clear browser cache and try again
- ✅ Check if admin account exists in database
- ✅ Ensure JWT_SECRET is correct in backend .env

### Dashboard Not Loading?
- ✅ Check internet connection
- ✅ Verify backend API is running on port 5000
- ✅ Check browser console for errors (F12)
- ✅ Clear browser cache
- ✅ Try in incognito mode

### Can't Approve Cars?
- ✅ Verify you are logged in as admin
- ✅ Check if car is in pending status
- ✅ Refresh the page
- ✅ Check backend logs for errors
- ✅ Ensure user role is set to "admin" in database

### Bookings Not Showing?
- ✅ Refresh the page
- ✅ Check backend API connection
- ✅ Verify bookings exist in database
- ✅ Check MongoDB connection status

---

## 🔗 Quick Links

- **Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Manage Users:** [http://localhost:3000/manage-users](http://localhost:3000/manage-users)
- **Manage Cars:** [http://localhost:3000/manage-cars](http://localhost:3000/manage-cars)
- **Manage Bookings:** [http://localhost:3000/manage-bookings](http://localhost:3000/manage-bookings)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 📝 Version Info
- **Document Version:** 1.0
- **Last Updated:** March 26, 2026
- **Platform:** Car Rental - MERN Stack
- **Admin Dashboard Version:** 2.0

---

**For more information, contact the development team or refer to the main README.md**
