import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import './i18n/config';
import App from './App.tsx'

// One QueryClient for the whole app. Defaults chosen for our use case:
//  - refetchOnWindowFocus: false — colour names don't change while the user
//    is in another tab.
//  - retry: false — fetchPaletteNames already handles failures internally
//    via its fallback path, so TanStack Query doesn't need to retry.
// Per-query options (e.g. staleTime: Infinity for the names query) are set
// in the hook itself rather than here, so other future queries aren't
// affected by name-specific tuning.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
