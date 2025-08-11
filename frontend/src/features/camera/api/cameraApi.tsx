export async function getFrame(host, camera_id) {
  const response = await fetch(`${host}/camera/${camera_id}/frame`);
  if (!response.ok) throw new Error("Failed to fetch frame");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function postExposure(host, cameraId, value) {
  return fetch(`${host}/camera/${cameraId}/exposure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
}

export async function postGain(host, cameraId, value) {
  return fetch(`${host}/camera/${cameraId}/gain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
}
