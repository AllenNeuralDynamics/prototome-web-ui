import { useMutation, useQuery } from "@tanstack/react-query";

import { FASTAPI_BASE_URL, useFetchRPCMetadata } from "./registry.ts";
import { assertParamsValid } from "./validation.ts";

// --------------------------------------------------------------------------------
//  API
// --------------------------------------------------------------------------------

// Call FastAPI endpoint that forwards and calls the corresponding ZMQ RPC.
async function callRPC(route: string, params: unknown): Promise<unknown> {
  const res = await fetch(`${FASTAPI_BASE_URL}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok)
    throw new Error(`RPC call failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// --------------------------------------------------------------------------------
//  Hook
// --------------------------------------------------------------------------------

// Internal hook to fetch metadata for a specific RPC function by name
function useRPCMetadata(name: string) {
  const { data, isLoading } = useFetchRPCMetadata();
  const rpcMetadata = data?.[name];
  return {
    rpcMetadata,
    isReady: !!rpcMetadata,
    isLoadingMetadata: isLoading,
  };
}

// ACTION hook: Wraps a mutation for user-triggered calls (forms, buttons)
export const useRPCAction = <TResult = unknown, TParams = void>(
  name: string,
) => {
  const { rpcMetadata } = useRPCMetadata(name);

  const mutation = useMutation<TResult, Error, TParams>({
    mutationFn: (params) => {
      if (!rpcMetadata) throw new Error(`RPC function "${name}" not found`);
      const payload = params ?? {};
      assertParamsValid(name, payload, rpcMetadata.params_schema);
      return callRPC(rpcMetadata.route, payload) as Promise<TResult>;
    },
  });

  return {
    metadata: rpcMetadata,
    // triggers
    call: mutation.mutate,
    callAsync: mutation.mutateAsync,
    // output fields
    result: mutation.data,
    error: mutation.error,
    isLoading: mutation.isPending,
    reset: mutation.reset,
  };
};

// DATA hook: loads on mount for display (charts, panels). Wraps a query.
export const useRPCData = <TResult = unknown, TParams = unknown>(
  name: string,
  params: TParams,
) => {
  const { rpcMetadata } = useRPCMetadata(name);

  const query = useQuery<TResult>({
    queryKey: ["rpc-call", name, params],
    queryFn: () => {
      if (!rpcMetadata) throw new Error(`RPC function "${name}" not found`);
      assertParamsValid(name, params, rpcMetadata.params_schema);
      return callRPC(rpcMetadata.route, params) as Promise<TResult>;
    },
    enabled: !!rpcMetadata, // wait for registry; guards missing route
  });

  return {
    metadata: rpcMetadata,
    // trigger
    refetch: query.refetch,
    // output fields
    result: query.data,
    error: query.error,
    isLoading: query.isLoading,
  };
};
