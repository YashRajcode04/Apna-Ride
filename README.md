# CarRental Installation Guide

This is the single setup guide for the project.

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally or MongoDB Atlas URI

## 1) Clone and install dependencies

Run from the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 2) Configure backend environment

Create backend/.env with values like:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/car-rental

JWT_SECRET=replace_with_strong_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=replace_with_refresh_secret
JWT_REFRESH_EXPIRE=30d

# Optional (if using real image upload/payment)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Notes:

- In this project, backend usually runs on port 5001.
- Frontend uses /api proxy via Vite.

## 3) Start backend

From backend folder:

```bash
npm run dev
```

Expected: server starts on http://localhost:5001

## 4) Start frontend

From frontend folder:

```bash
npm run dev
```

Expected: app starts on http://localhost:3000

## 5) Admin setup (optional)

If admin login is missing, create it:

```bash
cd backend
node createAdmin.js
```

Default admin created by script:

- Email: admin@apnaride.com
- Password: Admin@123

## 6) Verify app

- Open http://localhost:3000
- Check Cars and Luxury Cars pages
- Login and test booking/payment flow
- For admin checks, open /manage-users and /manage-bookings

## Common fixes

- Too many requests from this IP:
    Restart backend to reset in-memory rate limiter.
- Port already in use:
    Stop existing node processes, then restart frontend/backend.
- API unauthorized after login:
    Clear browser session storage and login again.

1. **Register/Login**: Create an account or login
2. **Browse Cars**: View available cars on the home page or browse all cars
3. **Filter Cars**: Use filters to find cars by location, type, and price
4. **View Details**: Click on a car to see detailed information
5. **Book a Car**: Select dates and book your preferred car
6. **Manage Bookings**: View and manage your bookings in "My Bookings"

### For Owners

1. **Register/Login**: Create an account with owner role
2. **List a Car**: Go to "List cars" page and fill in car details
3. **Manage Cars**: View and edit your listed cars
4. **Track Bookings**: Monitor bookings for your cars

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized production files.

## Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Push your code to GitHub
2. Create a new app on your hosting platform
3. Connect your GitHub repository
4. Add environment variables
5. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Push your code to GitHub
2. Import your project on Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables if needed
6. Deploy

## Features to Add (Future Enhancements)

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Car availability calendar
- [ ] Advanced search with more filters
- [ ] User reviews with photos
- [ ] Car comparison feature
- [ ] Favorite/Wishlist functionality
- [ ] Multi-language support
- [ ] Dark mode

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access if using MongoDB Atlas

**2. Port Already in Use**
- Change port in `.env` file
- Kill process using the port

**3. CORS Errors**
- Verify CORS configuration in backend
- Check frontend API base URL

**4. Authentication Issues**
- Clear browser localStorage
- Verify JWT_SECRET is set
- Check token expiration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@carrental.com or open an issue in the repository.

## Acknowledgments

- Inspired by modern car rental platforms
- UI design based on contemporary web standards
- Built with love using the MERN stack

---

**Made with ❤️ by Your Name**
