import type { UseMutationOptions, DefaultOptions } from '@tanstack/react-query'

export const queryConfig = {
  queries: {
    // throwOnError: true,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60
  }
} satisfies DefaultOptions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> = Awaited<
  ReturnType<FnType>
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MutationConfig<MutationFnType extends (...args: any) => Promise<any>> =
  UseMutationOptions<ApiFnReturnType<MutationFnType>, Error, Parameters<MutationFnType>[0]>
