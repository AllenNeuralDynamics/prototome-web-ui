import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import type { RPCMetadata } from "./registry.ts";

// Pydantic v2 emits JSON Schema Draft 2020-12; use the matching Ajv build.
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validators = new Map<string, ValidateFunction>();

// Custom RPC error for invalid parameters
export class RPCParamsError extends Error {
  constructor(rpcName: string, details: string) {
    super(`Invalid params for "${rpcName}": ${details}`);
    this.name = "RPCParamsError";
  }
}

// Throws RPCParamsError if params don't match the RPC's params_schema.
export function assertParamsValid(
  rpcName: string,
  params: unknown,
  paramsSchema: RPCMetadata["params_schema"],
): void {
  // Ignore if no schema is provided (no validation needed)
  if (!paramsSchema) return;
  let validate = validators.get(rpcName);
  if (!validate) {
    validate = ajv.compile(paramsSchema);
    validators.set(rpcName, validate);
  }
  if (validate(params)) return;
  const details = (validate.errors ?? [])
    .map((e) => `${e.instancePath || "(root)"} ${e.message ?? "invalid"}`)
    .join("; ");
  throw new RPCParamsError(rpcName, details);
}
