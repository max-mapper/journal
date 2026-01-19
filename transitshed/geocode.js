import * as fs from "fs";
import * as https from "https";
const inputGeoJSON = JSON.parse(fs.readFileSync("./stations.json"));
/**
 * Script to update GeoJSON features with Google Place IDs
 * using the Places API (New) - v1/places:searchText
 */

// 1. CONFIGURATION
const API_KEY = process.env.GOOGLE_API_KEY || "YOUR_API_KEY_HERE";

/**
 * Call Places API (New) to get the Place ID
 * Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
 */
async function getPlaceIdNew(queryText, lat, lon, apiKey) {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery: queryText,
    // Biasing results to 500m around the point to ensure we get the specific station
    // at this location, not a similarly named one elsewhere.
    locationBias: {
      circle: {
        center: {
          latitude: lat,
          longitude: lon,
        },
        radius: 500.0,
      },
    },
    // Optional: Filter to ensure we only get valid places
    maxResultCount: 1,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      // CRITICAL: You must request the specific fields you need.
      // asking for 'places.id' gives us the Place ID.
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.places && data.places.length > 0) {
    return data.places[0].id;
  }

  return null;
}

/**
 * Main Processing Function
 */
async function processFeatures(geoJSON) {
  if (API_KEY === "YOUR_API_KEY_HERE") {
    console.error("Please set a valid GOOGLE_API_KEY.");
    return;
  }

  console.log(
    `Processing ${geoJSON.features.length} features using Places API (New)...`
  );

  // Process sequentially to handle rate limits gracefully
  for (const feature of geoJSON.features) {
    const props = feature.properties;
    const geom = feature.geometry;

    if (!geom || geom.type !== "Point") {
      console.warn(`Skipping ${props.stationName}: Invalid geometry`);
      continue;
    }

    const [lon, lat] = geom.coordinates;
    // Search query: prefer station name, fallback to city name
    const searchText = props.stationName || props.cityName;

    try {
      console.log(`Searching for: "${searchText}"...`);
      const placeId = await getPlaceIdNew(searchText, lat, lon, API_KEY);

      if (placeId) {
        console.log(`   -> Found ID: ${placeId}`);
        feature.properties.placeId = placeId;
      } else {
        console.warn(`   -> No results found.`);
      }
    } catch (err) {
      console.error(`   -> Failed: ${err.message}`);
    }

    // Slight delay to be polite to the API
    await new Promise((r) => setTimeout(r, 100));
  }

  return geoJSON;
}

// EXECUTION
(async () => {
  const result = await processFeatures(inputGeoJSON);
  if (result) {
    console.log("\n--- UPDATED GEOJSON ---");
    console.log(JSON.stringify(result, null, 2));
  }
})();
