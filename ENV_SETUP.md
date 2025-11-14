# Environment Variables Setup

## API Backend

Create a `.env.local` file in the `api/` directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/whatcha-bringin
MONGODB_DB_NAME=whatcha-bringin

# JWT
JWT_SECRET=your-secret-key-here-change-in-production

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# App URL (for invite links)
APP_URL=https://whatcha-bringin.app

# reCAPTCHA (for feedback form spam protection)
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Email (for feedback notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
FEEDBACK_EMAIL_TO=your-email@gmail.com
```

## Mobile App

Create a `.env` file in the `mobile/` directory:

```env
# API URL
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For production, use your deployed API URL
# EXPO_PUBLIC_API_URL=https://api.whatcha-bringin.app/api

# reCAPTCHA Site Key (for feedback form)
EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

## Website

Create a `.env.local` file in the `website/` directory:

```env
# API URL (for fetching invite data)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# For production, use your deployed API URL
# NEXT_PUBLIC_API_URL=https://api.whatcha-bringin.app/api
```

## Getting API Keys

### MongoDB
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string from the "Connect" button
4. Replace `<password>` with your database password

### Twilio
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the dashboard
3. Create a Verify Service:
   - Go to Twilio Console → Verify → Services
   - Click "Create new Verify Service"
   - Copy the Service SID (starts with `VA...`)
   - This is your `TWILIO_VERIFY_SERVICE_SID`
4. Purchase a phone number for sending SMS invites (optional, only needed for gathering invites)

### Cloudinary
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard

### JWT Secret
Generate a random secret key for JWT tokens. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Google reCAPTCHA
1. Sign up at [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create a new site with reCAPTCHA v3
3. Add your domain(s)
4. Copy the Site Key (for mobile app: `EXPO_PUBLIC_RECAPTCHA_SITE_KEY`)
5. Copy the Secret Key (for API: `RECAPTCHA_SECRET_KEY`)

### Email Setup (for feedback notifications)
You can use Gmail, SendGrid, or any SMTP provider:

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASS=your-app-password` (16-character app password)
   - `SMTP_FROM=your-email@gmail.com`
   - `FEEDBACK_EMAIL_TO=your-email@gmail.com`

**For SendGrid or other providers:**
Use their SMTP settings accordingly.

