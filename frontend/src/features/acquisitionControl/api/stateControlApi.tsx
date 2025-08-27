export async function getCurrentState(host: string) {
  const response = await fetch(`${host}/state/current_state`);
  if (!response.ok) throw new Error("Failed to fetch current state");

  const data = await response.json();
  return data.position;
}

export async function postFacing(host: string) {
  return fetch(`${host}/state/facing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "facing" }),
  });
}

export async function postCutting(host: string) {
  return fetch(`${host}/state/facing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "cutting" }),
  });
}

export async function postStart(host: string) {
  return fetch(`${host}/state/facing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "cutting" }),
  });
}

export async function postStop(host: string) {
  return fetch(`${host}/state/facing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "cutting" }),
  });
}

export async function postSafeStop(host: string) {
  return fetch(`${host}/state/facing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "cutting" }),
  });
}
