# Zonnecto Mobile App
### React Native + Expo

Zonnecto ka mobile app — same backend, same WebSocket, same database.
Theme exactly matches the website (dark purple/cyan palette).

---

## 📁 Folder Structure

```
mobile/
├── app/                     ← Expo Router pages
│   ├── _layout.js           ← Root layout (providers, navigation)
│   ├── index.js             ← Entry redirect
│   ├── chat.js              ← Real-time chat screen
│   ├── premium.js           ← Premium plans screen
│   ├── profile-edit.js      ← Edit profile screen
│   ├── (auth)/
│   │   ├── login.js
│   │   ├── register.js
│   │   └── forgot-password.js
│   └── (tabs)/
│       ├── _layout.js       ← Bottom tab navigator
│       ├── index.js         ← Home screen
│       ├── match.js         ← Random matching screen
│       ├── friends.js       ← Friends management
│       └── profile.js       ← User profile screen
├── src/
│   ├── components/
│   │   └── ZnComponents.js  ← All reusable components
│   ├── constants/
│   │   ├── theme.js         ← Colors, fonts, spacing
│   │   └── api.js           ← API URLs and endpoints
│   ├── context/
│   │   ├── AuthContext.js   ← Authentication state
│   │   └── WebSocketContext.js ← WebSocket/STOMP
│   └── utils/
│       └── toastConfig.js   ← Toast notification config
├── assets/                  ← App icons, splash screen
├── app.json                 ← Expo config
├── package.json
└── README.md
```

---

## 🚀 Setup & Run

### Step 1 — Prerequisites

```bash
# Node.js 18+ required
node --version

# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Install dependencies
cd mobile
npm install
```

### Step 2 — Configure API URL

Open `src/constants/api.js` and set your backend URL:

```js
// For local development (use your PC's IP, NOT localhost)
export const API_BASE_URL = 'http://192.168.1.x:8080/api';

// For production
export const API_BASE_URL = 'https://your-backend.onrender.com/api';
```

> **Important:** On Android emulator use `10.0.2.2:8080` instead of `localhost:8080`.
> On physical device use your PC's actual local IP (e.g. `192.168.1.5`).

### Step 3 — Run the app

```bash
# Start Expo dev server
npm start
# OR
npx expo start

# Open on Android (with emulator running)
npm run android

# Open on iOS (Mac only)
npm run ios

# Open in browser (web)
npm run web
```

### Step 4 — Scan QR Code

After `npm start`, scan the QR code with:
- **Android:** Expo Go app (from Play Store)
- **iOS:** Camera app or Expo Go (from App Store)

---

## 📱 Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Home | `/(tabs)` | Online count, features, CTA |
| Match | `/(tabs)/match` | Random matching with queue |
| Friends | `/(tabs)/friends` | Friends, requests, blocked, search |
| Profile | `/(tabs)/profile` | User profile with settings |
| Chat | `/chat` | Real-time WebSocket chat |
| Premium | `/premium` | Premium plans & payment |
| Profile Edit | `/profile-edit` | Edit profile & preferences |
| Login | `/(auth)/login` | Sign in |
| Register | `/(auth)/register` | 3-step registration with OTP |
| Forgot Password | `/(auth)/forgot-password` | Password reset |

---

## 🏗️ Production Build

### Android APK / AAB

```bash
# Setup EAS (first time only)
eas login
eas build:configure

# Build APK (for testing)
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

### iOS IPA

```bash
# Build for TestFlight / App Store
eas build --platform ios --profile production
```

### eas.json (create this file)

```json
{
  "cli": { "version": ">= 5.9.1" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔧 Razorpay Integration (Production)

For real payment on mobile, install Razorpay RN SDK:

```bash
npm install react-native-razorpay
```

Then in `app/premium.js`, replace the TODO comment:

```js
import RazorpayCheckout from 'react-native-razorpay';

// After getting orderId from backend:
const options = {
  description: `${plan.name} Plan`,
  currency: 'INR',
  key: orderData.keyId,
  amount: plan.amountPaise,
  order_id: orderData.orderId,
  name: 'Zonnecto',
  prefill: { email: user.email, contact: '' },
  theme: { color: '#7c3aed' },
};

RazorpayCheckout.open(options)
  .then(async (data) => {
    // Verify on backend
    await axios.post(`${API_BASE_URL}/payment/verify`, {
      razorpayOrderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
      razorpaySignature: data.razorpay_signature,
      planId: plan.id,
      durationDays: plan.durationDays,
    }, { headers: { Authorization: `Bearer ${token}` } });
    setSuccess(true);
  })
  .catch(e => setError('Payment cancelled'));
```

---

## 🎨 Theme

All colors match the website exactly:

```js
bg: '#070710'           // dark background
purple: '#7c3aed'       // primary purple
purplePale: '#c084fc'   // light purple
cyan: '#06b6d4'         // accent cyan
green: '#4ade80'        // success green
red: '#ef4444'          // error red
gold: '#f59e0b'         // premium gold
```

---

## 🐛 Common Issues

**"Network request failed" on device:**
→ Make sure your PC and phone are on the same WiFi
→ Use your PC's local IP in `api.js`, not `localhost`

**Android emulator can't connect:**
→ Use `10.0.2.2:8080` instead of `localhost:8080`

**SockJS/WebSocket not connecting:**
→ WebSocket also needs the same IP fix
→ Check `src/constants/api.js` — `WS_URL` auto-derives from `API_BASE_URL`

**Expo Go "Something went wrong":**
→ Run `npx expo start --clear` to clear cache
→ Delete `node_modules` and run `npm install` again
