# 🧪 API Testing Guide - Postman/Thunder Client Collection

## Base URL
```
http://localhost:5000
```

## 📋 Authentication Flow Tests

### 1. Register New User
```http
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "role": "user",
      "isVerified": false,
      "authProvider": "local"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Login with Email/Password
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Request OTP
```http
POST {{baseUrl}}/api/auth/otp/request
Content-Type: application/json

{
  "phone": "+1234567890",
  "method": "sms"
}
```

**Check backend console for OTP code if Twilio not configured**

### 4. Verify OTP
```http
POST {{baseUrl}}/api/auth/otp/verify
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456"
}
```

### 5. Refresh Access Token
```http
POST {{baseUrl}}/api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

### 6. Get User Profile (Protected)
```http
GET {{baseUrl}}/api/auth/profile
Authorization: Bearer {{accessToken}}
```

### 7. Update Profile
```http
PUT {{baseUrl}}/api/auth/profile
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1987654321",
  "licenseNumber": "DL123456"
}
```

### 8. Forgot Password
```http
POST {{baseUrl}}/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Check email or backend console for reset link**

### 9. Reset Password
```http
PUT {{baseUrl}}/api/auth/reset-password/{{resetToken}}
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### 10. Change Password (Authenticated)
```http
PUT {{baseUrl}}/api/auth/change-password
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

### 11. Resend Verification Email
```http
POST {{baseUrl}}/api/auth/resend-verification
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 12. Verify Email
```http
GET {{baseUrl}}/api/auth/verify-email/{{verificationToken}}
```

### 13. Get Active Sessions
```http
GET {{baseUrl}}/api/auth/sessions
Authorization: Bearer {{accessToken}}
```

### 14. Logout (Current Session)
```http
POST {{baseUrl}}/api/auth/logout
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

### 15. Logout All Devices
```http
POST {{baseUrl}}/api/auth/logout-all
Authorization: Bearer {{accessToken}}
```

---

## 🔐 OAuth Testing

### Google OAuth
1. Open browser to: `http://localhost:5000/api/auth/google`
2. Authorize with Google
3. Get redirected to: `http://localhost:5173/auth/callback?accessToken=...&refreshToken=...`

### GitHub OAuth
1. Open browser to: `http://localhost:5000/api/auth/github`
2. Authorize with GitHub
3. Get redirected to callback with tokens

### Facebook OAuth
1. Open browser to: `http://localhost:5000/api/auth/facebook`
2. Authorize with Facebook
3. Get redirected to callback with tokens

---

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey
1. **Register** → Get verification email
2. **Verify Email** → Account active
3. **Login** → Get tokens
4. **Update Profile** → Save changes
5. **Logout** → Clear session

### Scenario 2: Phone/OTP Login
1. **Request OTP** → Get code via SMS
2. **Verify OTP** → Login successful
3. **View Profile** → Check user data

### Scenario 3: Password Reset
1. **Forgot Password** → Get reset email
2. **Reset Password** → Set new password
3. **Login** → Use new password

### Scenario 4: Social Login
1. **Google OAuth** → Authorize
2. **Auto Login** → Get tokens
3. **View Profile** → See Google account linked

### Scenario 5: Session Management
1. **Login on Device 1** → Get tokens
2. **Login on Device 2** → Get different tokens
3. **View Sessions** → See 2 active sessions
4. **Logout All Devices** → All sessions cleared

### Scenario 6: Account Locking
1. **Login with wrong password** (5 times)
2. **Account locked** → 2-hour lockout
3. **Try login again** → Error message with time remaining

### Scenario 7: Token Refresh
1. **Login** → Get access token (15 min expiry)
2. **Wait 16 minutes** → Access token expired
3. **Use refresh token** → Get new access token
4. **Continue using API** → Success

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Please verify your email to access this feature"
}
```

### 423 Locked
```json
{
  "success": false,
  "message": "Account locked due to multiple failed login attempts. Please try again in 120 minutes."
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again after 15 minutes."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📊 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 requests | 15 minutes |
| `/api/auth/register` | 5 requests | 15 minutes |
| `/api/auth/otp/request` | 3 requests | 1 hour |
| `/api/auth/forgot-password` | 3 requests | 1 hour |
| `/api/auth/resend-verification` | 5 requests | 1 hour |
| All other `/api/*` | 100 requests | 15 minutes |

---

## 🔧 Postman Collection Variables

Create environment with these variables:

```
baseUrl = http://localhost:5000
accessToken = [set after login]
refreshToken = [set after login]
resetToken = [get from email/console]
verificationToken = [get from email/console]
```

### Auto-Save Tokens Script

Add to Tests tab in Login/Register requests:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.data.accessToken);
    pm.environment.set("refreshToken", response.data.refreshToken);
}
```

---

## 🎯 Testing Checklist

### ✅ Authentication
- [ ] Register new user
- [ ] Login with email/password
- [ ] Login with phone/OTP
- [ ] Login with Google
- [ ] Login with GitHub
- [ ] Login with Facebook

### ✅ Email Verification
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Resend verification email

### ✅ Password Management
- [ ] Forgot password flow
- [ ] Reset password with token
- [ ] Change password (authenticated)

### ✅ Token Management
- [ ] Access token expires after 15 min
- [ ] Refresh token works
- [ ] Refresh token rotation
- [ ] Invalid token rejected

### ✅ Profile & Sessions
- [ ] Get user profile
- [ ] Update profile
- [ ] View active sessions
- [ ] Logout current session
- [ ] Logout all devices

### ✅ Security
- [ ] Rate limiting works
- [ ] Account locks after 5 failed attempts
- [ ] XSS/NoSQL injection prevented
- [ ] CORS configured correctly

---

## 💡 Pro Tips

1. **Save time**: Use Postman environment variables
2. **Auto-refresh**: Add pre-request script to auto-refresh expired tokens
3. **Bulk testing**: Create test suites with newman CLI
4. **Monitor**: Use Postman monitors for uptime checks

```bash
# Install newman
npm install -g newman

# Run tests
newman run collection.json -e environment.json
```

---

## 🐛 Debug Mode

Add to requests for detailed error info:

```http
X-Debug: true
```

Set in backend:
```env
NODE_ENV=development
```

This shows stack traces in error responses.

---

Happy Testing! 🚀
