export async function getCurrentState(
    host: string,
  ) {
    const response = await fetch(`${host}/state/current`);
    if (!response.ok) throw new Error("Failed to fetch position");
  
    const data = await response.json();
    return data.position;
  }
  
  export async function postStartCutting(
    host: string,
  ) {
    return fetch(`${host}/state/start_cutting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ true}),
    });
  }

  export async function postStopCutting(
    host: string,
  ) {
    return fetch(`${host}/state/stop_cutting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ true }),
    });
  }
  
