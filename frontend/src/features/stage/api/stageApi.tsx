export async function getPosition(
  host: string,
  stage_id: string,
  axis: string,
) {
  const response = await fetch(`${host}/stage/${stage_id}/${axis}/pos`);
  if (!response.ok) throw new Error("Failed to fetch position");

  const data = await response.json();
  return data.position;
}

export async function postPosition(
  host: string,
  stage_id: string,
  axis: string,
  value: number,
) {
  return fetch(`${host}/stage/${stage_id}/${axis}/pos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
}

export async function getMinimumPosition(
  host: string,
  stage_id: string,
  axis: string,
) {
  const response = await fetch(`${host}/stage/${stage_id}/${axis}/min_pos`);
  if (!response.ok) throw new Error("Failed to fetch position");

  const data = await response.json();
  return data.position;
}

export async function getMaximumPosition(
  host: string,
  stage_id: string,
  axis: string,
) {
  const response = await fetch(`${host}/stage/${stage_id}/${axis}/max_pos`);
  if (!response.ok) throw new Error("Failed to fetch position");

  const data = await response.json();
  return data.position;
}

export async function postMinimumPosition(
  host: string,
  stage_id: string,
  axis: string,
  value: number,
) {
  return fetch(`${host}/stage/${stage_id}/${axis}/min_pos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
}

export async function postMaximumPosition(
  host: string,
  stage_id: string,
  axis: string,
  value: number,
) {
  return fetch(`${host}/stage/${stage_id}/${axis}/max_pos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
}

export async function getVelocity(
  host: string,
  stage_id: string,
  axis: string,
) {
  const response = await fetch(`${host}/stage/${stage_id}/${axis}/velocity`);
  if (!response.ok) throw new Error("Failed to fetch velocity");

  const data = await response.json();
  return data.velocity;
}

export async function postVelocity(
  host: string,
  stage_id: string,
  axis: string,
  value: number,
) {
  return fetch(`${host}/stage/${stage_id}/${axis}/velocity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
}
