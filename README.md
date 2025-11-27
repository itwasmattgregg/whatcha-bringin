# Watcha Bringin 🎉

A React Native app for planning potluck-style gatherings with friends. Coordinate who's bringing what, send invites via text, and make every gathering a delicious success!

## Project Structure

```
whatcha-bringin/
├── mobile/          # React Native app (Expo)
├── api/             # Next.js API backend
├── website/         # Marketing website (Next.js)
└── app-store-assets/ # App store listing materials
```

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Twilio account (for SMS)
- Cloudinary account (for image storage)
- Expo CLI (for mobile development)

### Development Testing Tips

Need to log in as multiple users but only have one physical phone number? In development mode you can bypass Twilio by using *test* phone numbers:

1. Back-end must run with `NODE_ENV=development`.
2. Use any phone number that starts with `+1550` (for example `+15501234567` or `+15509876543`).
   - Note: We use `+1550` instead of `+1555` because iOS rejects 555 numbers as invalid.
3. When prompted for the 6-digit code, enter `123456`. The server will accept it and create a separate account for each unique test number.

This works only in development; production requires real SMS verification unless you configure a production test account (see below).

### Production Test Account (for App Store Reviewers)

To allow app store reviewers to test the app without SMS verification, configure a test account in production:

1. Set `TEST_PHONE_NUMBER` in your API environment variables (e.g., `+15501234567`).
   - Note: Use `+1550` prefix instead of `+1555` to avoid iOS validation issues.
2. Set `TEST_VERIFICATION_CODE` in your API environment variables (e.g., `123456`).
3. The configured phone number will bypass Twilio and accept the configured verification code.

**Important:** Include these test credentials in your App Store Connect submission notes for reviewers.

### Setup

#### 1. API Backend

```bash
cd api
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

The API will run on `http://localhost:3000`

#### 2. Mobile App

```bash
cd mobile
npm install
cp .env.example .env
# Edit .env with your API URL
npm start
```

#### 3. Marketing Website

```bash
cd website
npm install
npm run dev
```

The website will run on `http://localhost:3000` (or next available port)

## Environment Variables

### API (.env.local)

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT tokens
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `APP_URL` - Your app URL (for invite links)

### Mobile (.env)

- `EXPO_PUBLIC_API_URL` - API backend URL

## Deployment

### API & Website (Vercel)

1. Push code to GitHub
2. Import projects in Vercel:
   - Import `api` directory
   - Import `website` directory
3. Add environment variables in Vercel dashboard
4. Deploy!

### Mobile App

#### Setup EAS CLI

1. Install EAS CLI globally (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. Login to your Expo account:
   ```bash
   eas login
   ```
   (Create an account at https://expo.dev if you don't have one)

3. Configure EAS in your project:
   ```bash
   cd mobile
   eas build:configure
   ```
   This creates an `eas.json` configuration file.

#### iOS
1. Build with EAS: `eas build --platform ios`
2. Submit to App Store: `eas submit --platform ios`

#### Android
1. Build with EAS: `eas build --platform android`
2. Submit to Play Store: `eas submit --platform android`

**Note:** Before building, make sure you have:
- An Expo account (free tier works)
- iOS: Apple Developer account ($99/year) for App Store submission
- Android: Google Play Developer account ($25 one-time) for Play Store submission

## Features

- 📱 Phone number authentication with magic codes
- 🎉 Create custom gatherings with images, dates, and locations
- 🍽️ Coordinate food and drink items
- ✨ Claim items with custom descriptions
- 📨 Send invites via SMS
- ☕ Support the developer (Buy Me a Coffee)

## Tech Stack

- **Mobile**: React Native (Expo), React Navigation, TanStack Query
- **Backend**: Next.js API Routes, MongoDB, Twilio, Cloudinary
- **Website**: Next.js, Tailwind CSS
- **Deployment**: Vercel

## License

MIT

## Support

For support, visit https://whatcha-bringin.app/support

