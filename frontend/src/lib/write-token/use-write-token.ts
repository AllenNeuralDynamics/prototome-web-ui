import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

// TODO: set these endpoints in the config
const ACQUIRE_URL = "/api/get_write_token";
const RENEW_URL = "/api/renew_write_token";
export const RELEASE_URL = "/api/release_write_token";

// TODO: set in config. Server lease TTL is 120s; renew well before it lapses.
const RENEW_INTERVAL_MS = 30_000;

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

export const writeTokenQueryOptions = queryOptions({
  queryKey: ["write-token"],
  // First fetch claims; later fetches only renew so an idle-expired lease isn't silently reclaimed.
  queryFn: ({ client, queryKey }) =>
    postWriteToken(
      client.getQueryData<WriteTokenStatus>(queryKey)?.has_token
        ? RENEW_URL
        : ACQUIRE_URL,
    ),
  // Only the renewal interval should trigger refetches.
  staleTime: Infinity,
  // Holder renews its lease; viewers don't retry until the page is reloaded.
  refetchInterval: (query) =>
    query.state.data?.has_token ? RENEW_INTERVAL_MS : false,
  // Refresh the write token in the background (hidden tab).
  refetchIntervalInBackground: true,
});

// Hook access to the write token status
export const useWriteToken = () => {
  const { data } = useSuspenseQuery(writeTokenQueryOptions);
  return { hasToken: data.has_token };
};
