import * as cheerio from "cheerio";
import * as fs from "fs";
import { setTimeout } from "timers/promises";

// 1. Station Database (Source of Truth)
// We need this lookup table because Ekitan requires the Kanji Name (sfname/stname)
// to generate a valid URL, but the input is only the Station Code.
const STATIONS_DB = JSON.parse(fs.readFileSync("./codes.json"));

/**
 * Helper: Parse Japanese duration string to minutes for comparison
 * e.g., "1時間6分" -> 66
 * e.g., "38分" -> 38
 */
function parseDurationToMinutes(timeStr) {
  let minutes = 0;
  if (!timeStr) return Infinity;

  const hours = timeStr.match(/(\d+)時間/);
  const mins = timeStr.match(/(\d+)分/);

  if (hours) minutes += parseInt(hours[1], 10) * 60;
  if (mins) minutes += parseInt(mins[1], 10);

  return minutes;
}

/**
 * Core Scraper Function
 */
async function getTransitData(origin, destination, dateObj) {
  // Format Date: YYYYMMDD
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const dtParam = `${yyyy}${mm}${dd}`;

  // Format Time: HHMM
  const hh = String(dateObj.getHours()).padStart(2, "0");
  const min = String(dateObj.getMinutes()).padStart(2, "0");
  const tmParam = `${hh}${min}`;

  // Construct URL
  // We use encodeURIComponent to safely put Kanji in the URL
  const baseUrl = "https://ekitan.com/transit/route";
  const path = `sf-${origin.station_code}/st-${destination.station_code}`;
  const queryParams = new URLSearchParams({
    cs_flg: "0",
    cv: "0",
    dc: "1",
    ic: "1",
    rp: "0",
    sf: origin.station_code,
    sfname: origin.station_name_kanji,
    sr: "0",
    st: destination.station_code,
    stname: destination.station_name_kanji,
    tp: "0",
    tu1: "1",
    tu2: "1",
    tu3: "1",
    dt: dtParam,
    tm: tmParam,
  });

  const url = `${baseUrl}/${path}?${queryParams.toString()}`;

  try {
    await setTimeout(1000);
    console.error(url);
    const response = await fetch(url, {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-JP,en;q=0.9,ja-JP;q=0.8,ja;q=0.7",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://ekitan.com/",
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $("tr.ek-result_candidate").each((i, el) => {
      const $row = $(el);
      const totalTime = $row.find(".td-total-time").text().trim();

      const data = {
        totalTime: totalTime,
        totalCharge: $row.find(".td-total-charge").text().trim(),
        path: $row.find(".td-path span").text().trim(),
        // Add parsed minutes for internal sorting
        _minutes: parseDurationToMinutes(totalTime),
      };

      if (data.totalTime || data.path) {
        results.push(data);
      }
    });

    return results;
  } catch (error) {
    console.error(
      `Scraping failed for ${destination.station_name_en}:`,
      error.message
    );
    return [];
  }
}

/**
 * Main Controller
 */
export async function findFastestRoutes(originCode, isoDateTime) {
  // 1. Resolve Origin Details
  const originStation = STATIONS_DB.find((s) => s.station_code === originCode);

  if (!originStation) {
    console.error(
      `Error: Origin station code '${originCode}' not found in local database.`
    );
    process.exit(1);
  }

  // 2. Parse Date
  const dateObj = isoDateTime ? new Date(isoDateTime) : new Date();
  if (isNaN(dateObj.getTime())) {
    console.error("Error: Invalid Date String Provided");
    process.exit(1);
  }

  console.error(
    `\nSearching routes from: ${originStation.station_name_kanji} (${originStation.station_name_en})`
  );
  console.error(`Departure Time: ${dateObj.toLocaleString("ja-JP")}\n`);

  const finalResults = [];

  // 3. Process each destination
  for (const dest of STATIONS_DB) {
    // Skip if origin and dest are the same
    if (dest.station_code === originStation.station_code) continue;

    const routes = await getTransitData(originStation, dest, dateObj);

    if (routes.length > 0) {
      // Sort by shortest time (_minutes)
      routes.sort((a, b) => a._minutes - b._minutes);
      const fastest = routes[0];

      // Remove the internal helper property
      delete fastest._minutes;

      // Merge into final object structure
      finalResults.push({
        from: originStation.station_name_kanji,
        to: dest.station_name_kanji,
        departure_time_input: dateObj.toISOString(),
        ...dest, // Spread original destination object properties
        route_details: fastest, // Merged fastest route info
      });
    }
  }

  return finalResults;
}
