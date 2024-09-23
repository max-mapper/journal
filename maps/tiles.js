function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}
function tile2long(x, z) {
  return (x / Math.pow(2, z)) * 360 - 180;
}
function tile2lat(y, z) {
  var n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

var zoom = 12;
var ul = [34.843057, -119.017212];
var lr = [32.659593, -117.353529];
var top_tile = lat2tile(ul[0], zoom); // eg.lat2tile(34.422, 9);
var left_tile = lon2tile(ul[1], zoom);
var bottom_tile = lat2tile(lr[0], zoom);
var right_tile = lon2tile(lr[1], zoom);
var width = Math.abs(left_tile - right_tile) + 1;
var height = Math.abs(top_tile - bottom_tile) + 1;

var pts = {
  type: "FeatureCollection",
  features: [],
};

for (var x = left_tile; x < right_tile + 1; x++) {
  for (var y = top_tile; y < bottom_tile + 1; y++) {
    [, tile2lat(y, zoom)];
    pts.features.push({
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [
            [tile2long(x, zoom), tile2lat(y, zoom)],
            [tile2long(x, zoom), tile2lat(y + 1, zoom)],
            [tile2long(x + 1, zoom), tile2lat(y + 1, zoom)],
            [tile2long(x + 1, zoom), tile2lat(y, zoom)],
            [tile2long(x, zoom), tile2lat(y, zoom)],
          ],
        ],
        type: "Polygon",
      },
    });
  }
}

console.log(JSON.stringify(pts));
