import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev me /api aur /media Django (8000) ko proxy hote hain, is liye CORS ka masla nahi.
const target = 'http://127.0.0.1:8000';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': target, '/media': target } },
});
