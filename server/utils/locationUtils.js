import haversine from "haversine-distance";

const CAMPUS_COORDS = { latitude: -6.353103786432008, longitude: -39.29616440443693 };
const MAX_DIST = 100; // metros

//-6.353103786432008, -39.29616440443693

export const isInCampus = (coords) => {
  const distance = haversine(CAMPUS_COORDS, coords);
  return distance <= MAX_DIST;
};
