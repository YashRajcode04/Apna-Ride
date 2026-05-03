$ErrorActionPreference = 'Stop'

$base = 'http://localhost:5000/api'

function Post-Json([string]$url, $body, [string]$token = $null) {
  $headers = @{}
  if ($token) { $headers.Authorization = "Bearer $token" }
  return Invoke-RestMethod -Uri $url -Method Post -Headers $headers -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 10)
}

function Put-Json([string]$url, $body, [string]$token = $null) {
  $headers = @{}
  if ($token) { $headers.Authorization = "Bearer $token" }
  return Invoke-RestMethod -Uri $url -Method Put -Headers $headers -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 10)
}

function Get-Json([string]$url, [string]$token = $null) {
  $headers = @{}
  if ($token) { $headers.Authorization = "Bearer $token" }
  return Invoke-RestMethod -Uri $url -Method Get -Headers $headers
}

function Delete-Req([string]$url, [string]$token = $null) {
  $headers = @{}
  if ($token) { $headers.Authorization = "Bearer $token" }
  return Invoke-RestMethod -Uri $url -Method Delete -Headers $headers
}

$adminToken = $null
$tempToken = $null
$tempUserId = $null
$carId = $null
$bookingId = $null
$tempEmail = $null
$step = 'init'

function Get-HttpErrorDetails($err) {
  try {
    $resp = $err.Exception.Response
    if (-not $resp) { return $err.Exception.Message }
    $stream = $resp.GetResponseStream()
    if (-not $stream) { return $err.Exception.Message }
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    if ($body) { return $body }
    return $err.Exception.Message
  } catch {
    return $err.Exception.Message
  }
}

$results = [ordered]@{
  adminLogin = 'pending'
  userCrud = 'pending'
  carCrud = 'pending'
  bookingCrud = 'pending'
  stats = 'pending'
  tempEmail = $null
  tempUserId = $null
  carId = $null
  bookingId = $null
}

try {
  # Admin login
  $step = 'admin_login'
  $adminLogin = Post-Json "$base/auth/login" @{ email = 'admin@apnaride.com'; password = 'Admin@123' }
  $adminToken = $adminLogin.data.accessToken
  if (-not $adminToken) { throw 'Admin login failed: missing accessToken' }
  $results.adminLogin = 'ok'

  # Create a temporary user
  $step = 'temp_register'
  $rand = Get-Random -Maximum 999999
  $tempEmail = "tempuser_$rand@test.com"
  $tempPwd = 'Temp@12345'

  Post-Json "$base/auth/register" @{ name = 'Temp User'; email = $tempEmail; password = $tempPwd; phone = "+100000$rand" } | Out-Null

  $step = 'temp_login'
  $tempLogin = Post-Json "$base/auth/login" @{ email = $tempEmail; password = $tempPwd }
  $tempToken = $tempLogin.data.accessToken
  $tempUserId = $tempLogin.data.user._id
  if (-not $tempToken -or -not $tempUserId) { throw 'Temp user login failed' }

  $results.tempEmail = $tempEmail
  $results.tempUserId = $tempUserId

  # USER CRUD (admin)
  $step = 'admin_users_list'
  $usersList = Get-Json "$base/admin/users?limit=200" $adminToken
  if (-not ($usersList.data | Where-Object { $_._id -eq $tempUserId })) {
    throw 'Temp user not visible in admin users list'
  }

  $step = 'admin_user_get'
  Get-Json "$base/admin/users/$tempUserId" $adminToken | Out-Null
  $step = 'admin_user_role_owner'
  Put-Json "$base/admin/users/$tempUserId/role" @{ role = 'owner' } $adminToken | Out-Null
  $step = 'admin_user_role_user'
  Put-Json "$base/admin/users/$tempUserId/role" @{ role = 'user' } $adminToken | Out-Null

  $results.userCrud = 'ok'

  # CAR CRUD (admin)
  $step = 'admin_car_create'
  $carPayload = @{ 
    name = 'Admin Test Car'
    brand = 'TestBrand'
    model = 'ModelX'
    year = 2024
    type = 'SUV'
    category = 'Indian'
    seats = 5
    fuelType = 'Petrol'
    transmission = 'Manual'
    pricePerDay = 999
    location = 'TestCity'
    description = 'Admin CRUD test'
    features = @('AC')
    images = @(@{ url = 'https://example.com/car.jpg' })
  }

  $carCreated = Post-Json "$base/cars" $carPayload $adminToken
  $carId = $carCreated.data._id
  if (-not $carId) { throw 'Car create failed: missing _id' }
  $results.carId = $carId

  $step = 'admin_cars_all'
  $carsAdminAll = Get-Json "$base/cars/admin/all?limit=500" $adminToken
  if (-not ($carsAdminAll.data | Where-Object { $_._id -eq $carId })) {
    throw 'Created car not visible in /cars/admin/all'
  }

  $step = 'admin_car_update'
  Put-Json "$base/cars/$carId" @{ pricePerDay = 1234; location = 'TestCity2' } $adminToken | Out-Null
  $step = 'admin_car_approve'
  Put-Json "$base/cars/$carId/approve" @{ isApproved = $true } $adminToken | Out-Null

  $results.carCrud = 'ok'

  # BOOKING create (temp user) + admin update/delete
  $step = 'temp_booking_create'
  $today = (Get-Date).ToUniversalTime().Date
  $pickup = $today.AddDays(1).ToString('o')
  $return = $today.AddDays(3).ToString('o')

  $bookingCreated = Post-Json "$base/bookings" @{ car = $carId; pickupDate = $pickup; returnDate = $return; notes = 'Admin CRUD booking test' } $tempToken
  $bookingId = $bookingCreated.data._id
  if (-not $bookingId) { throw 'Booking create failed: missing _id' }
  $results.bookingId = $bookingId

  $step = 'admin_bookings_list'
  $bookingsAdmin = Get-Json "$base/admin/bookings?limit=200" $adminToken
  if (-not ($bookingsAdmin.data | Where-Object { $_._id -eq $bookingId })) {
    throw 'Created booking not visible in admin bookings list'
  }

  $step = 'admin_booking_confirm'
  Put-Json "$base/admin/bookings/$bookingId/status" @{ status = 'confirmed' } $adminToken | Out-Null
  $step = 'admin_booking_complete'
  Put-Json "$base/admin/bookings/$bookingId/status" @{ status = 'completed' } $adminToken | Out-Null

  $results.bookingCrud = 'ok'

  # STATS
  $step = 'admin_stats'
  Get-Json "$base/admin/stats" $adminToken | Out-Null
  $results.stats = 'ok'
}
catch {
  $results.step = $step
  $results.error = $_.Exception.Message
  $results.errorDetails = Get-HttpErrorDetails($_)
  if ($results.adminLogin -eq 'pending') { $results.adminLogin = 'fail' }
  if ($results.userCrud -eq 'pending') { $results.userCrud = 'fail' }
  if ($results.carCrud -eq 'pending') { $results.carCrud = 'fail' }
  if ($results.bookingCrud -eq 'pending') { $results.bookingCrud = 'fail' }
  if ($results.stats -eq 'pending') { $results.stats = 'fail' }
}
finally {
  # Cleanup best-effort (don’t throw from here)
  $ErrorActionPreference = 'SilentlyContinue'

  if ($adminToken -and $bookingId) { Delete-Req "$base/admin/bookings/$bookingId" $adminToken | Out-Null }
  if ($adminToken -and $carId) { Delete-Req "$base/cars/$carId" $adminToken | Out-Null }
  if ($adminToken -and $tempUserId) { Delete-Req "$base/admin/users/$tempUserId" $adminToken | Out-Null }

  if ($results.adminLogin -eq 'pending') { $results.adminLogin = 'skip' }
  if ($results.userCrud -eq 'pending') { $results.userCrud = 'skip' }
  if ($results.carCrud -eq 'pending') { $results.carCrud = 'skip' }
  if ($results.bookingCrud -eq 'pending') { $results.bookingCrud = 'skip' }
  if ($results.stats -eq 'pending') { $results.stats = 'skip' }

  $results | ConvertTo-Json -Depth 10
}
