import type { UseQueryOptions } from '@tanstack/react-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryOptionsFromFn<TFn extends (...args: any) => any> = Omit<
  UseQueryOptions<Awaited<ReturnType<TFn>>>,
  'queryKey' | 'queryFn'
>;
