//TODO: make better

export function getAxisColor(axis: string) {
  const colors = {
    piezo: "violet",
    y: "green",
    z: "red",
  };
  return colors[axis.toLowerCase()] || "gray";
}
