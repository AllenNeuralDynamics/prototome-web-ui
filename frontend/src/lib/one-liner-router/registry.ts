import { useQuery } from "@tanstack/react-query";

import { z } from "zod";

// --------------------------------------------------------------------------------
//  Constants
// --------------------------------------------------------------------------------

// TODO: configure this in web_ui_config
export const FASTAPI_BASE_URL = "http://localhost:8000";
const RPC_METADATA_URL = `${FASTAPI_BASE_URL}/api/rpcs`;

// --------------------------------------------------------------------------------
//  Schemas
// --------------------------------------------------------------------------------

export const FunctionMetadataSchema = z.object({
  name: z.string(),
  route: z.string(),
  params_schema: z.record(z.string(), z.unknown()).nullish(),
  return_schema: z.record(z.string(), z.unknown()).nullish(),
  description: z.string().nullish(),
});
export type FunctionMetadata = z.infer<typeof FunctionMetadataSchema>;

export const RPCMetadataSchema = z.record(z.string(), FunctionMetadataSchema);
export type RPCMetadata = z.infer<typeof RPCMetadataSchema>;

// --------------------------------------------------------------------------------
//  API
// --------------------------------------------------------------------------------

// Fetch RPC metadata
export async function fetchMetadata(): Promise<RPCMetadata> {
  const res = await fetch(RPC_METADATA_URL);
  if (!res.ok)
    throw new Error(
      `Failed to fetch RPC metadata: ${res.status} ${await res.text()}`,
    );
  return RPCMetadataSchema.parse(await res.json());
}

// --------------------------------------------------------------------------------
//  Hook
// --------------------------------------------------------------------------------

// Hook to fetch all RPC metadata
export const useFetchRPCMetadata = () =>
  useQuery<RPCMetadata>({ queryKey: ["rpc-metadata"], queryFn: fetchMetadata });
