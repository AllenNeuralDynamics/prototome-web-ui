import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { z } from "zod";
import { useConfig, type Config } from "@/hooks/use-config";

type TokenSettings = Config["server"]["token_settings"];

const WRITE_TOKEN_KEY = ["write-token"] as const;

const WriteTokenStatusSchema = z.object({ has_token: z.boolean() });
export type WriteTokenStatus = z.infer<typeof WriteTokenStatusSchema>;

async function postWriteToken(url: string): Promise<WriteTokenStatus> {
  const res = await fetch(url, { method: "POST" });
  if (!res.ok)
    throw new Error(
      `Write token request failed: ${res.status} ${await res.text()}`,
    );
  return WriteTokenStatusSchema.parse(await res.json());
}

export const writeTokenQueryOptions = (settings: TokenSettings) =>
  queryOptions({
    queryKey: WRITE_TOKEN_KEY,
    // First fetch claims; later fetches only renew so an idle-expired lease isn't silently reclaimed.
    queryFn: ({ client, queryKey }) =>
      postWriteToken(
        client.getQueryData<WriteTokenStatus>(queryKey)?.has_token
          ? settings.renew_url
          : settings.acquire_url,
      ),
    // Only the renewal interval should trigger refetches.
    staleTime: Infinity,
    // Holder renews its lease; viewers don't retry until the page is reloaded.
    refetchInterval: (query) =>
      query.state.data?.has_token
        ? settings.lease_renewal_interval * 1000
        : false,
    // Refresh the write token in the background (hidden tab).
    refetchIntervalInBackground: true,
  });

export const useTokenSettings = (): TokenSettings =>
  useConfig().server.token_settings;

// Hook access to the write token status
export const useWriteToken = () => {
  const { data } = useSuspenseQuery(writeTokenQueryOptions(useTokenSettings()));
  return { hasToken: data.has_token };
};

// Renew immediately on a 403; holders only, since a viewer's refetch would try to acquire
export function recheckWriteToken(queryClient: QueryClient) {
  const status = queryClient.getQueryData<WriteTokenStatus>(WRITE_TOKEN_KEY);
  if (status?.has_token) {
    void queryClient.invalidateQueries({ queryKey: WRITE_TOKEN_KEY });
  }
}

// Take the write token even if another session holds it, then reload into the write layout
export const useForceWriteToken = () => {
  const { acquire_url } = useTokenSettings();
  return useMutation({
    mutationFn: () => postWriteToken(`${acquire_url}?force=true`),
    onSuccess: (data) => {
      if (data.has_token) window.location.reload();
    },
  });
};
