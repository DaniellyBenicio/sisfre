import haversine from "haversine-distance";

const CAMPUS_COORDS = {
  latitude: -6.753737859947655,
  longitude: -38.96898803330336,
};
const MAX_DIST = 2000; // metros

// Campus -6.600767156023205, -39.05512157768739
// my house -6.353131736454447, -39.2963145500635     -6.60352750792448, -39.060096172282485
//Danielly = -6.753737859947655, -38.96898803330336;

export const isInCampus = (coords) => {
  const distance = haversine(CAMPUS_COORDS, coords);
  return distance <= MAX_DIST;
};
