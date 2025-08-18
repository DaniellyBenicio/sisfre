import haversine from "haversine-distance";

const CAMPUS_COORDS = {
  latitude: -6.6004442040661155,
  longitude: -39.055120304642614,
};
const MAX_DIST = 2000;

export const isInCampus = (coords) => {
  console.log("Entrando na função isInCampus com coords:", coords);

  const lat = parseFloat(coords.latitude);
  const lon = parseFloat(coords.longitude);

  if (isNaN(lat) || isNaN(lon)) {
    console.error("Erro: Coordenadas inválidas.", { lat, lon });
    throw new Error("Latitude e longitude devem ser números válidos.");
  }

  const coordsToCompare = { latitude: lat, longitude: lon };
  console.log("Coordenadas após parse:", coordsToCompare);
  console.log("Coordenadas do campus:", CAMPUS_COORDS);

  const distance = haversine(CAMPUS_COORDS, coordsToCompare);
  console.log("Distância calculada:", distance, "metros");

  const isWithinCampus = distance <= MAX_DIST;
  console.log("Está no campus?", isWithinCampus);

  return isWithinCampus;
};
