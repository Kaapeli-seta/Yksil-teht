import * as L from "leaflet";
import { Restaurant } from "./types/Restaurant";

const setMap = () => {
  try {
    const mapView = L.map("map", {
      center: [60.188222, 24.829696],
      zoom: 11,
    });

    L.tileLayer("http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 19,
      minZoom: 4,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }).addTo(mapView);

    const markerLayer = L.featureGroup().addTo(mapView);
    return [mapView, markerLayer];
  } catch (error) {
    console.log("new error: " + (error as Error).message);
  }
};

const CompassGIcon = L.icon({
  iconUrl: "./img/Compass-marker-50x82.png",
  iconSize: [25, 41], // size of the icon
  iconAnchor: [14, 38], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -20.5], // point from which the popup should open relative to the iconAnchor
});
const sodexoIcon = L.icon({
  iconUrl: "./img/Sodexo-marker-50x82.png",
  iconSize: [25, 41],
  iconAnchor: [14, 38],
  popupAnchor: [0, -20.5],
});

const newMarkers = (
  restaurant: Restaurant,
  markerLayer: L.FeatureGroup,
  tr: HTMLTableRowElement
) => {
  const markLocat = restaurant.location.coordinates.sort(
    (a, b) => b - a
  ) as L.PointTuple;
  // sort is for longitude and latitude flipping (note not a good fix in large scale).
  // The data inserted flipped into database.
  const markerView = L.marker(markLocat);
  if (restaurant.company === "Sodexo") {
    markerView.setIcon(sodexoIcon);
  } else {
    markerView.setIcon(CompassGIcon);
  }
  markerLayer.addLayer(markerView);
  markerView
    .bindPopup(`<h3>${restaurant.name}</h3><p>${restaurant.address}</p>`, {
      closeButton: false,
      maxHeight: 200,
    })
    .on("click", () => {
      try {
        // remove all highlights
        const allHighs = document.querySelectorAll(".highlight");
        allHighs.forEach((high) => {
          high.classList.remove("highlight");
        });

        tr.classList.add("highlight");
      } catch (error) {
        console.log((error as Error).message);
      }
    });
};

const selfMarker = (
  mapView: L.Map | undefined,
  crd: GeolocationCoordinates
) => {
  if (!mapView) {
    return;
  }

  const markerSelfL = L.featureGroup().addTo(mapView);
  const selfLocation: L.LatLngExpression = [crd.latitude, crd.longitude];
  mapView.flyTo(new L.LatLng(selfLocation[0], selfLocation[1]));
  const markerView: L.Marker = L.marker(selfLocation);
  const SelfIcon = L.icon({
    iconUrl: "./img/self-marker-50x82.png",
    iconSize: [25, 41],
    iconAnchor: [14, 38],
    popupAnchor: [0, -20.5],
  });
  markerView.setIcon(SelfIcon);
  markerSelfL.addLayer(markerView);
  markerView.bindPopup(`<h3>Your location</h3><p>you are here.</p>`, {
    closeButton: false,
    maxHeight: 200,
  });
};

export { newMarkers, setMap, selfMarker };
