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
const userMainPage = document.querySelector('#username-main-page') as HTMLImageElement;

// not in use--------
if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('', () => {
  modal.close();
});
//------------

const token = localStorage.getItem('token')
const user = await getUserData(token);
setLoginModal(modal, user);
addUserDataToDom(user, userMainPage, undefined, avatarMainPage)
const mapW = setMap()
if (!mapW) {
  throw new Error()
}
const map = mapW[0] as L.Map
const markers = mapW[1] as L.FeatureGroup


const fetchRest = async ():Promise<Restaurant[]> =>  {
  const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');
  console.log(restaurants);
  return restaurants
}


const error = async (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  const restaurants = await fetchRest();
  setData(restaurants)
};



const sucsess = async (pos: GeolocationPosition) =>{
  const restaurants = await fetchRest();
  const crd = pos.coords;
  selfMarker(map, crd)
      // Sort by distanse ----
  restaurants.sort((a: Restaurant, b: Restaurant) => {
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

  setData(restaurants)
}


const setData = (restaurants: Restaurant[]) => {
  try {
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
      const sodexoRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Sodexo'
      );
      console.log(sodexoRestaurants);
      createTable(sodexoRestaurants, markers, modal);
    });

    if (!compassBtn){
      console.error('CompassBtn missing in html')
      return;
    }
    compassBtn.addEventListener('click', () => {
      const compassRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Compass Group'
      );
      console.log(compassRestaurants);
      createTable(compassRestaurants, markers, modal);
    });

    if (!resetBtn){
      console.error('ResetBtn missing in html')
      return;
    }
    resetBtn.addEventListener('click', () => {
      createTable(restaurants, markers, modal);
    });

  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};
navigator.geolocation.getCurrentPosition(sucsess, error, positionOptions)
