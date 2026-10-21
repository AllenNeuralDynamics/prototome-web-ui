import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';
import type { PrototomeNumericKey } from '@/types/configTypes';

// --------------------------------------------------------------------------------
//  Constants
// --------------------------------------------------------------------------------

const CONFIG_URL = '/api/config';

// --------------------------------------------------------------------------------
//  Schemas
// --------------------------------------------------------------------------------

const TokenSettingsSchema = z.object({
  lease_renewal_interval: z.number().positive(),
  acquire_url: z.string(),
  renew_url: z.string(),
  release_url: z.string(),
  owner_url: z.string(),
});

const ServerSchema = z.object({
  url: z.string(),
  port: z.number(),
  rpcs_endpoint: z.string(),
  streams_endpoint: z.string(),
  offer_endpoint: z.string(),
  token_settings: TokenSettingsSchema,
});

const StageSchema = z.object({
  axes: z.array(z.string()),
  unit: z.string(),
});

// `satisfies` makes this fail to compile if a numeric PrototomeConfig key is missing or misspelled.
const PROTOTOME_NUMERIC_KEYS = Object.keys({
  bottom_position_mm: true,
  cut_speed: true,
  ep_cut_bottom: true,
  ep_cut_top: true,
  retract_distance: true,
  retract_piezo_distance: true,
  retract_speed: true,
  retract_time_ok_count: true,
  section_thickness: true,
  top_position_mm: true,
} satisfies Record<PrototomeNumericKey, true>) as [PrototomeNumericKey, ...PrototomeNumericKey[]];

const UISchema = z.object({
  axis_variable_mapping: z.record(
    z.string(),
    z.record(z.string(), z.array(z.enum(PROTOTOME_NUMERIC_KEYS))),
  ),
  stage: StageSchema,
});

// One entry per widget instance: which widget it is, plus its contract-key -> RPC-name bindings.
const WidgetSchema = z.object({
  type: z.string(),
  bindings: z.record(z.string(), z.string()),
});

const ConfigSchema = z.object({
  title: z.string(),
  server: ServerSchema,
  widgets: z.record(z.string(), WidgetSchema),
  ui: UISchema,
});

export type Config = z.infer<typeof ConfigSchema>;

// --------------------------------------------------------------------------------
//  Functions
// --------------------------------------------------------------------------------

/**
 * Retrieve the config from the backend and validate it against the schema.
 * @returns Config data
 */
const fetchConfig = async (): Promise<Config> => {
  let response: Response;
  try {
    response = await fetch(CONFIG_URL);
  } catch (cause) {
    throw new Error(`Could not reach ${CONFIG_URL}: is the backend running?`, { cause });
  }

  // Check for HTTP errors
  if (!response.ok) {
    const hint =
      response.status === 404
        ? ' The backend may be missing its config.json file or the /api/config endpoint.'
        : '';
    throw new Error(`Config request failed: ${response.status} ${response.statusText}.${hint}`);
  }

  // Check valid JSON
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    throw new Error(`Config response from ${CONFIG_URL} was not valid JSON.`, { cause });
  }

  // Check valid config schema
  const parsed = ConfigSchema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `- ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Config from ${CONFIG_URL} failed validation:\n${issues}`);
  }

  return parsed.data;
};

// --------------------------------------------------------------------------------
//  Hook
// --------------------------------------------------------------------------------

export const useConfig = (): Config => {
  return useSuspenseQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,
    staleTime: Infinity,
  }).data;
};
