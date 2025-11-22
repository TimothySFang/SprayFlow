import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  primaryColor: 'custom',
  colors: {
    custom: [
      '#e6f7fc',
      '#cceff9',
      '#99dff3',
      '#66cfed',
      '#33bfe7',
      '#30B5DD', // Base color
      '#2ba3c7',
      '#2691b1',
      '#207f9b',
      '#1a6d85',
    ],
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>,
)
