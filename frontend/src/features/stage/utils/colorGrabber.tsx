//TODO: make better

export function getAxisColor(axis: string) {
  const colors = {
    piezo: "blue",
    y: "green",
    z: "red",
  };
  return colors[axis.toLowerCase()] || "gray";
}
