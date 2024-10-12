import {errorModal} from './createTable';
import {fetchData} from './functions';
import {apiUrl, positionOptions} from './variables';
import {Restaurant} from './types/Restaurant';

import { selfMarker, setMap } from './map';
import './main.css'
import { setLoginModal } from './loginFunc';
import { addUserDataToDom, getUserData } from './loginSiplify';
import { createTable } from './createTable';
import { calculateDistance } from './distance';



const modal = document.querySelector('dialog');
const avatarMainPage =  document.querySelector('#avatar-main-page') as HTMLImageElement;
const userMainPage = document.querySelector('#username-main-page') as HTMLSpanElement;
const sorter = document.querySelector('#sorter') as HTMLSelectElement;

// not in use--------
if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('', () => {
  modal.close();
});
//------------

const token = localStorage.getItem('token');
const user = await getUserData(token);
setLoginModal(modal, user);
addUserDataToDom(user, userMainPage, undefined, avatarMainPage)
const mapW = setMap();
if (!mapW) {
  throw new Error('Map not found');
}
const map = mapW[0] as L.Map
const markers = mapW[1] as L.FeatureGroup


const fetchRest = async ():Promise<Restaurant[]> =>  {
  const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');
  console.log(restaurants);
  return restaurants;
};


const error = async (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  const restaurants = await fetchRest();
  setData(restaurants);
};



const sucsess = async (pos: GeolocationPosition) =>{
  const restaurants = await fetchRest();
  const crd = pos.coords;
  selfMarker(map, crd)
      // Sort by distanse ----

      console.log(crd)
      console.log(restaurants)

  setData(restaurants, crd)
}

function SorterSet(modal: HTMLDialogElement, restaurants: Restaurant[], restaurantsD?: Restaurant[], crd?: GeolocationCoordinates) {
  const val = sorter.value
  if (crd && restaurantsD && (val === 'distance')) {
    console.log(val)
    createTable(restaurantsD, markers, modal)
  }
  if (val === 'name'){
      restaurants.sort((a: Restaurant, b: Restaurant) =>  a.name.localeCompare(b.name));
      createTable(restaurants, markers, modal)
  }
  if (val === 'city'){
      restaurants.sort((a: Restaurant, b: Restaurant) =>  a.name.localeCompare(b.name));
      restaurants.sort((a: Restaurant, b: Restaurant) =>  a.city.localeCompare(b.city));
      createTable(restaurants, markers, modal)
  }
}
        
function NewGeoSort(restaurants: Restaurant[], crd: GeolocationCoordinates) {
  return restaurants.toSorted((a: Restaurant, b: Restaurant) => {
    const locLati = crd.latitude;
    const locLongi = crd.longitude;
    const latiA = a.location.coordinates[1];
    const longiA = a.location.coordinates[0];
    const distanceA = calculateDistance(locLati, locLongi, latiA, longiA);
    const latiB = b.location.coordinates[1];
    const longiB = b.location.coordinates[0];
    const distanceB = calculateDistance(locLati, locLongi, latiB, longiB);
    return distanceA - distanceB;
  });  
};

const setData = (restaurants: Restaurant[], crd? : GeolocationCoordinates) => {
  let restaurantsD : Restaurant[];
  let restaurantsDC : Restaurant[];
  let restaurantsDS : Restaurant[];
  const compassRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Compass Group');
  const sodexoRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Sodexo');
  try {
    if (crd){
      // could not add calculateDistance to event listenere it bugged for somereason
      restaurantsD = NewGeoSort(restaurants, crd)
      restaurantsDC = NewGeoSort(compassRestaurants, crd)
      restaurantsDS = NewGeoSort(sodexoRestaurants, crd)
    }
    createTable(restaurants, markers, modal);

    // buttons for filtering ----
    const sodexoBtn = document.querySelector('#sodexo');
    const compassBtn = document.querySelector('#compass');
    const resetBtn = document.querySelector('#reset');

    // button filter code ----
    if (!sodexoBtn){
      console.error('SodexoBtn missing in html')
      return;
    }
    sodexoBtn.addEventListener('click', () => {
      SorterSet(modal, sodexoRestaurants, restaurantsDS, crd)
    });

    if (!compassBtn){
      console.error('CompassBtn missing in html')
      return;
    }
    compassBtn.addEventListener('click', () => {
      SorterSet(modal, compassRestaurants, restaurantsDC, crd)
    });

    if (!resetBtn){
      console.error('ResetBtn missing in html')
      return;
    }
    resetBtn.addEventListener('click', () => {
      SorterSet(modal, restaurants, restaurantsD, crd)
    });

    sorter.addEventListener('change', () => {
      SorterSet(modal, restaurants, restaurantsD, crd)
  });
  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};
navigator.geolocation.getCurrentPosition(sucsess, error, positionOptions)
