var token = "VK9en7fqcN8VTzfv5LVe";
const map = new maplibregl.Map({
  container: "map",
  style: "https://api.maptiler.com/maps/hybrid/style.json?key=" + token,
  center: [-118.2094, 34.2303],
  zoom: 9,
  hash: true,
  minPitch: 0,
  maxPitch: 85,
});

var control = new maplibreSearchBox.MapLibreSearchControl({
  useMapFocusPoint: true,
});

map.addControl(control, "top-right");

map.addControl(new maplibregl.FullscreenControl());

var styles = (MapLibreStyleDefinition = [
  {
    title: "Satellite Hybrid",
    uri: "https://api.maptiler.com/maps/hybrid/style.json?key=" + token,
  },
  {
    title: "Streets",
    uri: "https://api.maptiler.com/maps/streets/style.json?key=" + token,
  },
  {
    title: "Bright",
    uri: "https://api.maptiler.com/maps/bright/style.json?key=" + token,
  },
  {
    title: "Outdoor",
    uri: "https://api.maptiler.com/maps/outdoor/style.json?key=" + token,
  },
]);

var loadedStyle;

map.addControl(new MapLibreStyleSwitcherControl(styles, "Satellite Hybrid"));

let hoveredGridID = null;

function toggleSidebar(id) {
  const elem = document.getElementById(id);
  const classes = elem.className.split(" ");
  const collapsed = classes.indexOf("collapsed") !== -1;

  const padding = {};

  if (collapsed) {
    // Remove the 'collapsed' class from the class list of the element, this sets it back to the expanded state.
    classes.splice(classes.indexOf("collapsed"), 1);

    padding[id] = 400; // In px, matches the width of the sidebars set in .sidebar CSS class
    map.easeTo({
      padding,
      duration: 1000, // In ms, CSS transition duration property for the sidebar matches this value
    });
  } else {
    padding[id] = 0;
    // Add the 'collapsed' class to the class list of the element
    classes.push("collapsed");

    map.easeTo({
      padding,
      duration: 1000,
    });
  }

  // Update the class list on the element
  elem.className = classes.join(" ");
}

map.once("load", () => {
  toggleSidebar("left");
});

map.on("styledata", (e) => {
  var loaded = e.style.stylesheet.name;
  if (loaded !== loadedStyle) {
    loadedStyle = loaded;
    if (loaded === "Satellite Hybrid") {
      map.addSource("terrain", {
        type: "raster-dem",
        url: "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=VK9en7fqcN8VTzfv5LVe",
      });

      map.setTerrain({
        source: "terrain",
        exagerration: 2.5,
      });
    }
    onLoad();
  }
});

var onLoad = async () => {
  var content = document.querySelector(".content");
  content.innerHTML = marked.parse(content.innerHTML);

  map.addSource("inat", {
    type: "raster",
    tiles: [
      "https://tiles.inaturalist.org/v1/grid/{z}/{x}/{y}.png?verifiable=true&place_id=962&project_id=calflora-native-plants-of-california&geoprivacy=open&taxon_geoprivacy=open&style=geotilegrid&tile_size=256",
    ],
  });

  map.addLayer({
    id: "inat-raster",
    type: "raster",
    source: "inat",
    paint: {
      "raster-opacity": 0.7,
    },
  });

  const url = "./lacountyboundary.json";
  var json;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    json = await response.json();
  } catch (error) {
    console.error(error.message);
  }

  map.addSource("county", {
    type: "geojson",
    data: json,
  });

  map.addLayer({
    id: "countyborder",
    type: "line",
    source: "county",
    layout: {},
    paint: {
      "line-color": "#80a868",
      "line-width": 3,
    },
  });

  const url2 = "./lagrid.json";
  var json2;
  try {
    const response = await fetch(url2);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    json2 = await response.json();
  } catch (error) {
    console.error(error.message);
  }

  map.addSource("grid", {
    type: "geojson",
    data: json2,
  });

  map.addLayer({
    id: "grid-hover",
    type: "fill",
    source: "grid",
    layout: {},
    paint: {
      "fill-color": "#627BC1",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0,
        0,
      ],
    },
  });

  map.addLayer({
    id: "outline",
    type: "line",
    source: "grid",
    layout: {},
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "clicked"], false],
        "#000000",
        "#929292",
      ],
      "line-width": 2,
      "line-offset": 1,
    },
  });

  map.addLayer({
    id: "poi-labels",
    type: "symbol",
    source: "grid",
    layout: {
      "text-field": ["get", "gridID"],
      "text-size": 14,
    },
    paint: {
      "text-halo-color": "#fff",
      "text-halo-width": 2,
    },
  });
};

// When the user moves their mouse over the state-fill layer, we'll update the
// feature state for the feature under the mouse.
map.on("mousemove", "grid-hover", (e) => {
  if (e.features.length > 0) {
    if (hoveredGridID) {
      map.setFeatureState(
        { source: "grid", id: hoveredGridID },
        { clicked: false }
      );
    }
    hoveredGridID = e.features[0].id;
    if (hoveredGridID === polygonID) return;

    map.setFeatureState(
      { source: "grid", id: hoveredGridID },
      { clicked: true }
    );
  }
});

var clearHover = () => {
  if (hoveredGridID) {
    map.setFeatureState(
      { source: "grid", id: hoveredGridID },
      { hover: false }
    );
  }
  hoveredGridID = null;
};

// When the mouse leaves the state-fill layer, update the feature state of the
// previously hovered feature.
map.on("mouseleave", "grid-hover", clearHover);

var polygonID;

map.on("click", "grid-hover", async (e) => {
  map.getCanvas().style.cursor = "pointer";
  if (e.features.length > 0) {
    var content = document.querySelector(".content");
    content.innerHTML = marked.parse('<span class="loader"></span>');

    polygonID = e.features[0].id;

    var ul = e.features[0].geometry.coordinates[0][0];
    var lr = e.features[0].geometry.coordinates[0][2];
    var center = [ul[0] + (lr[0] - ul[0]) / 2, ul[1] + (lr[1] - ul[1]) / 2];

    map.flyTo({
      center: center, // Fly to the selected target
      essential: true, // This animation is considered essential with
      zoom: 12.5,
    });

    var rect = e.features[0].geometry.coordinates[0];
    var species = await getSpecies(rect);
    var iNatExplore = `https://www.inaturalist.org/observations?verifiable=true&spam=false&project_id=calflora-native-plants-of-california&geoprivacy=open&taxon_geoprivacy=open&quality_grade=research&swlng=${rect[3][0]}&swlat=${rect[3][1]}&nelng=${rect[1][0]}&nelat=${rect[1][1]}&locale=en&preferred_place_id=14`;

    var content = document.querySelector(".content");
    var tmp = "";
    // prettier-ignore
    tmp += `
#### Grid #${polygonID}

Species count: ${species.total_results} (<a href="${iNatExplore}" target="_blank">View on iNaturalist</a>)

`
    var list = species.results;
    list = list.sort((a, b) => {
      return a.taxon.name.localeCompare(b.taxon.name);
    });
    list.forEach((s) => {
      // prettier-ignore
      tmp += `
- ${s.taxon.preferred_common_name} (*${s.taxon.name}*)
`
    });
    content.innerHTML = marked.parse(tmp);
  }
});

var getSpecies = async function (rect) {
  var url = `https://api.inaturalist.org/v1/observations/species_counts?verifiable=true&spam=false&project_id=calflora-native-plants-of-california&quality_grade=research&swlng=${rect[3][0]}&swlat=${rect[3][1]}&nelng=${rect[1][0]}&nelat=${rect[1][1]}&locale=en&preferred_place_id=14&per_page=500`;

  var json;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    json = await response.json();
  } catch (error) {
    console.error(error.message);
  }
  return json;
};
