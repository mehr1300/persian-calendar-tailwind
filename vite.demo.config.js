import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    base: '/persian-calendar-tailwind/', // نام مخزن گیت‌هاب شما
    plugins: [react(),tailwindcss(),],
})
