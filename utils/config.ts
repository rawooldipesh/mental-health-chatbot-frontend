// app/utils/config.ts

const USE_LAN = true; // set false if testing on emulator

export const API_BASE_URL =
  __DEV__
    ? USE_LAN
      ? "http://192.168.1.9:5000/api"     
      : "http://localhost:5000/api"
    : "https://your-backend-url.com";

    
