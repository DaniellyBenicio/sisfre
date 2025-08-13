import haversine from "haversine-distance";

const CAMPUS_COORDS = { latitude: -6.353131736454447, longitude: -39.2963145500635 };
const MAX_DIST = 100; // metros

// Campus -6.600767156023205, -39.05512157768739
// my house -6.353131736454447, -39.2963145500635

export const isInCampus = (coords) => {
  const distance = haversine(CAMPUS_COORDS, coords);
  return distance <= MAX_DIST;
};
