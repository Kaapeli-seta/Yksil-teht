import {defineConfig} from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import postprocess from '@stadtlandnetz/rollup-plugin-postprocess';



export default defineConfig({
  base: './',
  build: {
    target: 'esnext', //browsers can handle the latest ES features
    rollupOptions: {
        external: ['leaflet'],
        plugins: [
          postprocess([
            [/import[^;]*;/, '']
          ])
        ]
    }
},
  plugins: [
    VitePWA({ registerType: 'autoUpdate',       devOptions: {
      enabled: true
    },    
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    },
    includeAssets: ['main.ccs'],
    manifest: {
      name: 'vite pwa test',
      short_name: 'vite-pwa',
      description: 'test for vite pwa plugin',
      theme_color: '#ffffff',
      icons: [
        {
            src: 'img/PageIcon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
        },
        {
          src: 'img/PageIcon-256x256.png',
          sizes: '256x256',
          type: 'image/png'
      },
      {
        src: 'img/PageIcon-192x192-alt.png',
        sizes: '192x192',
        type: 'image/png'
    },
    {
      src: 'img/PageIcon-256x256-alt.png',
      sizes: '256x256',
      type: 'imag/png'
  }
    ]
    }
  })
  ]

})
