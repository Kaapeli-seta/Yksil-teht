import {errorModal} from './createTable';
import {fetchData} from './functions';
import {apiUrl, positionOptions} from './variables';
import {Restaurant} from './types/Restaurant';

import { selfMarker, setMap } from './map';
import './main.css'
import { setLoginModal } from './loginFunc';
import { addUserDataToDom} from './loginSiplify';
import { createTable } from './createTable';
import { calculateDistance } from './distance';
import { NavButtons } from './mainButtons';



const modal = document.querySelector('dialog');

const sfForm = document.querySelector('#sf-form') as HTMLSelectElement;
const filter = document.querySelector('#filter') as HTMLSelectElement;
const sorter = document.querySelector('#sorter') as HTMLSelectElement;



if (!modal) {
  throw new Error('Modal not found');
}

NavButtons()
const token = localStorage.getItem('token');
if (!token) {
  const auserinfoMainPage =  document.querySelector('#userinfo-main-page') as HTMLImageElement;
  if (auserinfoMainPage) {
    auserinfoMainPage.style.display = "none";
  }
}
if (token){
  const Loginbutton = document.querySelector('#login-button-frame') as HTMLButtonElement
  Loginbutton.innerHTML = `<i class="fa-solid fa-gears"></i>`
}
setLoginModal(modal);
addUserDataToDom(token)
const mapSet = setMap();
if (!mapSet) {
  throw new Error('Map not found');
}
const map = mapSet[0] as L.Map
const markers = mapSet[1] as L.FeatureGroup


const fetchRest = async ():Promise<Restaurant[]> =>  {
  const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');
  console.log(restaurants);
  return restaurants;
};


const error = async (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  try{
  const restaurants = await fetchRest();
  setData(restaurants);
  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};



const sucsess = async (pos: GeolocationPosition) =>{
  try{
  const restaurants = await fetchRest();
  const crd = pos.coords;
  selfMarker(map, crd)
      // Sort by distanse ----

      console.log(crd)
      console.log(restaurants)

  setData(restaurants, crd)
  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }

};

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

function SorterSet(modal: HTMLDialogElement, restaurants: Restaurant[], restaurantsD?: Restaurant[], crd?: GeolocationCoordinates) {
  const valS = sorter.value
  if (crd && restaurantsD && (valS === 'distance')) {
    console.log(valS)
    createTable(restaurantsD, markers, map, modal)
  }
  if (valS === 'name'){
      restaurants.sort((a: Restaurant, b: Restaurant) =>  a.name.localeCompare(b.name));
      createTable(restaurants, markers, map, modal)
  }
  if (valS === 'city'){
      restaurants.sort((a: Restaurant, b: Restaurant) =>  a.name.localeCompare(b.name));
      restaurants.sort((a: Restaurant, b: Restaurant) =>  a.city.localeCompare(b.city));
      createTable(restaurants, markers, map, modal)
    }
};
        

const setData = (restaurants: Restaurant[], crd? : GeolocationCoordinates) => {
  let restaurantsD : Restaurant[];
  let restaurantsDC : Restaurant[];
  let restaurantsDS : Restaurant[];
  const compassRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Compass Group');
  const sodexoRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Sodexo');

  if (crd){
    // could not add calculateDistance to event listenere it bugged for somereason
    restaurantsD = NewGeoSort(restaurants, crd)
    restaurantsDC = NewGeoSort(compassRestaurants, crd)
    restaurantsDS = NewGeoSort(sodexoRestaurants, crd)
  };


  createTable(restaurants, markers, map, modal);
  sfForm.addEventListener('change', () => {
    const valF = filter.value
    if (valF === 'all'){
      SorterSet(modal, restaurants, restaurantsD, crd)
    }
    if (valF === 'sodexo'){
      SorterSet(modal, sodexoRestaurants, restaurantsDS, crd)
    }
    if (valF === 'compass'){
      SorterSet(modal, compassRestaurants, restaurantsDC, crd)
    }
  }); 

};
navigator.geolocation.getCurrentPosition(sucsess, error, positionOptions)
