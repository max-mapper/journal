import { findFastestRoutes } from "./getroutes.js";
// --- Entry Point ---

// Get arguments from CLI: node script.js <OriginCode> <ISODate>
const args = process.argv.slice(2);
const originInput = args[0] || "1605"; // Default to Inokashira-koen if empty
const dateInput = args[1]; // undefined = current time

findFastestRoutes(originInput, dateInput).then((data) => {
  console.log(JSON.stringify(data, null, 2));
});
