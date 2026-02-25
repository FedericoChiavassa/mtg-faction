import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import type { RowData } from '@tanstack/react-table';

import { queryClient } from '@/lib/query/client';
import { ThemeProvider } from '@/components/theme-provider';

import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree, scrollRestoration: true });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  // https://github.com/TanStack/router/discussions/1342#discussioncomment-8848490
  interface HistoryState {
    disablePlaceholderData?: boolean;
  }
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    paginationState: {
      pageIndex: number;
      pageSize: number;
    };
  }
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
