import * as L from 'leaflet';
import {Restaurant} from './types/Restaurant';



const setMap = () => {

  try {
  const mapView = L.map('map', {
    center: [60.188222, 24.829696],
    zoom: 11,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 4,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapView);
  
  console.log("Map wokrs")
  const markerLayer = L.featureGroup().addTo(mapView);
  return [mapView, markerLayer]
  } catch(error) {
    console.log('new error: ' + (error as Error).message);
  }
}

const CompassGIcon = L.divIcon({className: 'blue-icon'});
const sodexoIcon = L.divIcon({className: 'green-icon'});


const newMarkers = (restaurant: Restaurant, markerLayer: L.FeatureGroup, tr: HTMLTableRowElement) =>{
    const markLocat = restaurant.location.coordinates.sort((a, b) => b - a) as L.PointTuple 
        // sort is for longitude and latitude flipping (note not a good fix in large scale). 
        // The data inserted flipped into database.
    const markerView = L.marker(markLocat);
    if (restaurant.company === 'Sodexo') {
      markerView.setIcon(sodexoIcon)
    }
    else {
      markerView.setIcon(CompassGIcon)
    }
    markerLayer.addLayer(markerView)
    markerView.bindPopup(`<h3>${restaurant.name}</h3><p>${restaurant.address}.</p>`).on('click', () => {
      try {
        // remove all highlights
        const allHighs = document.querySelectorAll('.highlight');
        allHighs.forEach((high) => {
          high.classList.remove('highlight');
      });

        tr.classList.add('highlight');
      } catch (error) {
        console.log((error as Error).message);
      }
    })
};

const selfMarker = (mapView: L.Map | undefined, crd: GeolocationCoordinates) => {
  if (!mapView) {
    return;
  }
  
  const markerSelfL = L.featureGroup().addTo(mapView);
  const selfLocation: L.LatLngExpression = [crd.latitude, crd.longitude]
  mapView.flyTo(new L.LatLng(selfLocation[0], selfLocation[1]))
  const markerView : L.Marker = L.marker(selfLocation)
  const SelfIcon = L.divIcon({className: 'self-icon'});
  markerView.setIcon(SelfIcon)
  markerSelfL.addLayer(markerView)
  markerView.bindPopup(`<h3>Your location</h3><p>you are here.</p>`)
}



export {newMarkers, setMap, selfMarker}