//TODO: make better

export function getAxisColor(axis: string) {
  const colors = {
    z: "pink",
    y: "#8A2BE2",
    piezo: "#20B2AA",
  };
  return colors[axis.toLowerCase()] || "gray";
}
