import { useQuery } from "@tanstack/react-query";

import { z } from "zod";
import { useConfigStore } from "@/stores/configStore.ts";

// --------------------------------------------------------------------------------
//  Constants
// --------------------------------------------------------------------------------

export const FASTAPI_BASE_URL =
  useConfigStore.getState().config?.FASTAPI_BASE_URL || "http://localhost:8000";
const RPC_METADATA_URL = `${FASTAPI_BASE_URL}${useConfigStore.getState().config?.RPC_METADATA_ENDPOINT || "/api/rpcs"}`;
const STREAM_METADATA_URL = `${FASTAPI_BASE_URL}${useConfigStore.getState().config?.STREAM_METADATA_ENDPOINT || "/api/streams"}`;

// --------------------------------------------------------------------------------
//  Schemas
// --------------------------------------------------------------------------------

export const RPCMetadataSchema = z.object({
  name: z.string(),
  route: z.string(),
  params_schema: z.record(z.string(), z.unknown()).nullish(),
  return_schema: z.record(z.string(), z.unknown()).nullish(),
  description: z.string().nullish(),
});
export type RPCMetadata = z.infer<typeof RPCMetadataSchema>;

export const RPCsMetadataSchema = z.record(z.string(), RPCMetadataSchema);
export type RPCsMetadata = z.infer<typeof RPCsMetadataSchema>;

export const StreamMetadataSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  schema: z.record(z.string(), z.unknown()).nullish(),
});
export type StreamMetadata = z.infer<typeof StreamMetadataSchema>;

export const StreamsMetadataSchema = z.record(z.string(), StreamMetadataSchema);
export type StreamsMetadata = z.infer<typeof StreamsMetadataSchema>;

// --------------------------------------------------------------------------------
//  API
// --------------------------------------------------------------------------------

// Fetch RPC metadata
export async function fetchRPCMetadata(): Promise<RPCsMetadata> {
  const res = await fetch(RPC_METADATA_URL);
  if (!res.ok)
    throw new Error(
      `Failed to fetch RPC metadata: ${res.status} ${await res.text()}`,
    );
  return RPCsMetadataSchema.parse(await res.json());
}

export async function fetchStreamMetadata(): Promise<StreamsMetadata> {
  const res = await fetch(STREAM_METADATA_URL);
  if (!res.ok)
    throw new Error(
      `Failed to fetch Stream metadata: ${res.status} ${await res.text()}`,
    );
  return StreamsMetadataSchema.parse(await res.json());
}

// --------------------------------------------------------------------------------
//  Hook
// --------------------------------------------------------------------------------

// Hook to fetch all RPC metadata
export const useFetchRPCMetadata = () =>
  useQuery<RPCsMetadata>({
    queryKey: ["rpc-metadata"],
    queryFn: fetchRPCMetadata,
  });

// Hook to fetch all Stream metadata
export const useFetchStreamMetadata = () =>
  useQuery<StreamsMetadata>({
    queryKey: ["stream-metadata"],
    queryFn: fetchStreamMetadata,
  });
