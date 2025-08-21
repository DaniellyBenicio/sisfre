import haversine from "haversine-distance";

const CAMPUS_COORDS = {
  latitude: -6.75329902464083,
  longitude: -38.96845441998467,
};

const MAX_DIST = 20000;

//if  latitude: -6.60075173908146, longitude: -39.05512217154764

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
