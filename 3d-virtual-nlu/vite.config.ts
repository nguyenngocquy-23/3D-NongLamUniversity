import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { DOMAIN_CLIENT } from "./src/env";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${DOMAIN_CLIENT}/`,
})
