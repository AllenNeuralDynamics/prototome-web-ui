export async function getCurrentState(host: string) {
  const response = await fetch(`${host}/state/current_state`);
  if (!response.ok) throw new Error("Failed to fetch current state");

  const data = await response.json();
  return data.position;
}

export async function postFacing(host: string) {
  return fetch(`${host}/acquisition_control/facing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "facing" }),
  });
}

export async function postCutting(host: string) {
  return fetch(`${host}/acquisition_control/cutting`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "cutting" }),
  });
}

export async function postStart(host: string) {
  return fetch(`${host}/acquisition_control/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "start" }),
  });
}

export async function postStop(host: string) {
  return fetch(`${host}/acquisition_control/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "stop" }),
  });
}

export async function postSafeStop(host: string) {
  return fetch(`${host}/acquisition_control/safe_stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "safe_stop" }),
  });
}

export async function postCutOne(host: string) {
  return fetch(`${host}/acquisition_control/cut_one`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "cut_one" }),
  });
}

export async function postRepeatCut(host: string) {
  return fetch(`${host}/acquisition_control/repeat_cut`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "repeat_cut" }),
  });
}
