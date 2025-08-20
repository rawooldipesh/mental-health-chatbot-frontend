// app/utils/config.ts
// Change this IP to your machine's LAN IP when testing on a physical device.
// Example: http://192.168.1.5:5000
const USE_LAN = true; // set false if testing on emulator

export const API_BASE_URL =
  __DEV__
    ? USE_LAN
      ? "http://192.168.0.101:5000/api"
      : "http://localhost:5000/api"
    : "https://your-backend-url.com";
