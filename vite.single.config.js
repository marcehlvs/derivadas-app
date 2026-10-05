// Build de un solo archivo HTML (para abrir desde el celular o publicar como página). Uso: npm run build:single
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({ plugins: [react(), viteSingleFile()], base: './', build: { outDir: 'dist-single' } })
