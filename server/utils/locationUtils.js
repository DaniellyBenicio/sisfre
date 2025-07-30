import haversine from "haversine-distance";

const CAMPUS_COORDS = { latitude: -6.60054, longitude: -39.05512 };
const MAX_DIST = 100; // metros

export const isInCampus = (coords) => {
  const distance = haversine(CAMPUS_COORDS, coords);
  return distance <= MAX_DIST;
};
