import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { z } from "zod";
import { useConfig, type Config } from "@/hooks/use-config";

type TokenSettings = Config["server"]["token_settings"];

const WRITE_TOKEN_KEY = ["write-token"] as const;
const WRITE_TOKEN_OWNER_KEY = ["write-token-owner"] as const;

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
    queryFn: async ({ client, queryKey }) => {
      if (!client.getQueryData<WriteTokenStatus>(queryKey)?.has_token) {
        return postWriteToken(settings.acquire_url);
      }

      // A browser lease can outlive the server's ownership of the router token.
      const [status, owner] = await Promise.all([
        postWriteToken(settings.renew_url),
        client.fetchQuery({
          ...writeTokenOwnerQueryOptions(settings),
          staleTime: 0,
        }),
      ]);
      return { has_token: status.has_token && owner.owned_by_this_client };
    },
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

const WriteTokenOwnerSchema = z.object({
  // Session fingerprint when held via this server, external client id otherwise
  token_owner: z.string().nullable(),
  // True when this web server (not necessarily this browser) holds the token
  owned_by_this_client: z.boolean(),
});
export type WriteTokenOwner = z.infer<typeof WriteTokenOwnerSchema>;

async function getWriteTokenOwner(url: string): Promise<WriteTokenOwner> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(
      `Write token owner request failed: ${res.status} ${await res.text()}`,
    );
  return WriteTokenOwnerSchema.parse(await res.json());
}

const writeTokenOwnerQueryOptions = (settings: TokenSettings) =>
  queryOptions({
    queryKey: WRITE_TOKEN_OWNER_KEY,
    queryFn: () => getWriteTokenOwner(settings.owner_url),
    refetchInterval: settings.lease_renewal_interval * 1000,
  });

export const useWriteTokenOwner = () =>
  useQuery(writeTokenOwnerQueryOptions(useTokenSettings()));

// Refresh ownership on a 403; only holders renew, so viewers never try to acquire.
export function recheckWriteToken(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: WRITE_TOKEN_OWNER_KEY });
  const status = queryClient.getQueryData<WriteTokenStatus>(WRITE_TOKEN_KEY);
  if (status?.has_token) {
    void queryClient.invalidateQueries({ queryKey: WRITE_TOKEN_KEY });
  }
}

const ReleaseTokenSchema = z.object({ released: z.boolean() });

// Release the write token; updates cached state in place (no reload, which would re-acquire)
export const useReleaseWriteToken = () => {
  const { release_url } = useTokenSettings();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(release_url, { method: "POST" });
      if (!res.ok)
        throw new Error(
          `Write token release failed: ${res.status} ${await res.text()}`,
        );
      return ReleaseTokenSchema.parse(await res.json());
    },
    onSuccess: () => {
      queryClient.setQueryData<WriteTokenStatus>(WRITE_TOKEN_KEY, {
        has_token: false,
      });
      void queryClient.invalidateQueries({ queryKey: WRITE_TOKEN_OWNER_KEY });
    },
  });
};

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
