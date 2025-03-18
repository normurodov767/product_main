import React from 'react'
import Router from './Router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

const App = () => {
  return <QueryClientProvider client={queryClient}>
    <Router />;
    <Toaster position='top-right' richColors />;
  </QueryClientProvider>
}

export default App
