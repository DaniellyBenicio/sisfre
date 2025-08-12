import haversine from "haversine-distance";

const CAMPUS_COORDS = { latitude: -6.600767156023205, longitude: -39.05512157768739 };
const MAX_DIST = 100; // metros

-6.600767156023205, -39.05512157768739

export const isInCampus = (coords) => {
  const distance = haversine(CAMPUS_COORDS, coords);
  return distance <= MAX_DIST;
};
