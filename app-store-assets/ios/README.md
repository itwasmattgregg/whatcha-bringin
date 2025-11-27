# iOS App Store Assets

## Required Assets

### App Icon
- **Size**: 1024x1024 pixels
- **Format**: PNG (no transparency)
- **File**: `app-icon.png`

### Screenshots
Required for different device sizes:

#### iPhone 6.7" Display (iPhone 14 Pro Max, iPhone 13 Pro Max, etc.)
- **Size**: 1290x2796 pixels
- **Required**: At least 3 screenshots
- **Files**: `screenshot-6.7-1.png`, `screenshot-6.7-2.png`, `screenshot-6.7-3.png`

#### iPhone 6.5" Display (iPhone 11 Pro Max, iPhone XS Max)
- **Size**: 1242x2688 pixels
- **Required**: At least 3 screenshots
- **Files**: `screenshot-6.5-1.png`, `screenshot-6.5-2.png`, `screenshot-6.5-3.png`

#### iPhone 5.5" Display (iPhone 8 Plus, iPhone 7 Plus)
- **Size**: 1242x2208 pixels
- **Required**: At least 3 screenshots
- **Files**: `screenshot-5.5-1.png`, `screenshot-5.5-2.png`, `screenshot-5.5-3.png`

## App Store Listing

### App Name
**Watcha Bringin**

### Subtitle
**Plan Perfect Potluck Gatherings**

### Description
```
Whatcha Bringin keeps potluck planning stress-free, from the first invite to the final dish. Host a gathering in seconds, text your friends the link, and watch every slot fill without endless group chats.

✨ HIGHLIGHTS
• Phone-number sign-in—no passwords to remember
• One-tap text invites with smart deep links
• Live roster of dishes, drinks, and supplies so nothing gets duplicated
• Claim or add custom items with personal notes (“Grandma’s peach cobbler!”)
• Custom gatherings with names, cover images, dates, locations, and reminders
• Works on iPhone and the web at whatchabringin.com

🎉 PERFECT FOR
• Potlucks, BBQs, and tailgates
• Friendsgiving and holiday dinners
• Birthday parties and showers
• Neighborhood or office events

Plan together, eat better, and share the workload—Whatcha Bringin makes every guest part of the fun.
```

### Promotional Text
Plan potlucks in seconds—invite friends, assign dishes, and see every contribution at whatchabringin.com so nothing gets duplicated.

### Keywords
potluck, gathering, party planning, coordination, event planning, friends, social, bbq, dinner party

### Support URL
https://whatcha-bringin.app/support

### Marketing URL
https://whatcha-bringin.app

### Privacy Policy URL
https://whatcha-bringin.app/privacy

## Test Account for App Review

For App Store reviewers to test the app without SMS verification:

**Test Phone Number:** `+15501234567` (or as configured in `TEST_PHONE_NUMBER`)  
**Verification Code:** `123456` (or as configured in `TEST_VERIFICATION_CODE`)

**Note:** We use `+1550` instead of `+1555` because iOS rejects 555 numbers as invalid.

This test account bypasses Twilio SMS verification and works in production. The credentials are configured via environment variables in the API backend.

**Note:** Include these credentials in the "App Review Information" section of App Store Connect when submitting for review.

## Submission Checklist

- [ ] App icon (1024x1024)
- [ ] Screenshots for required device sizes
- [ ] App description
- [ ] Keywords
- [ ] Support URL
- [ ] Privacy Policy URL
- [ ] Test account credentials documented for reviewers
- [ ] App Store Connect account setup
- [ ] App ID and Bundle ID configured
- [ ] TestFlight beta testing (optional)

