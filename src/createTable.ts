import * as L from "leaflet";
import { fetchData } from "./functions";
import { newMarkers } from "./map";
import { DailyMenu } from "./types/Menu";
import { Restaurant } from "./types/Restaurant";
import { apiUrl } from "./variables";
import { Favorit, LoginUser } from "./interfaces/User";
import { UpdateResult } from "./interfaces/UpdateResult";
import { addUserDataToDom } from "./loginSiplify";



const updateFavorite = async (userFav: Favorit, token: string | null): Promise<UpdateResult> => {
    const options: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(userFav),
    };
    const result = await fetchData<LoginUser>(apiUrl + '/users', options);
    return result
  };

const createTable = (restaurants: Restaurant[], markerLayer: L.FeatureGroup | undefined, mapView: L.Map, modal: HTMLDialogElement) => {
    // chech that map exists
    if (!markerLayer){
        return;
    }
    markerLayer.clearLayers()
    const table = document.querySelector('table');
    if (!table){
      console.error('talbe is missing in html');
      return;
    }
    table.innerHTML = '';
    restaurants.forEach((restaurant) => {
        const tr = restaurantRow(restaurant, modal);
        table.appendChild(tr);
        newMarkers(restaurant, markerLayer, tr);
        
        tr.addEventListener('click', async () => {
          console.log('something happened')
          // remove all highlights
          const allHighs = document.querySelectorAll('.highlight');
          allHighs.forEach((high) => {
            high.classList.remove('highlight');
        });
        mapView.flyTo(new L.LatLng(restaurant.location.coordinates[0], restaurant.location.coordinates[1]), 14)
          tr.classList.add('highlight');
          // add restaurant data to modal
          modal.innerHTML = '';
      });
    });
};

const restaurantRow = (restaurant: Restaurant, modal: HTMLDialogElement) => {
    const {name, address, company, city, _id} = restaurant;
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.innerText = name;
    const addressCell = document.createElement('td');
    addressCell.innerText = address;
    const companyCell = document.createElement('td');
    companyCell.innerText = company;
    const cityCell = document.createElement('td');
    cityCell.innerText = city;
    const MbuttonCell = document.createElement('button');
    MbuttonCell.innerText = 'Menu';
    MbuttonCell.addEventListener('click', async () => {
        try{
            // fetch menu
            const menu = await fetchData<DailyMenu> (apiUrl + `/restaurants/daily/${restaurant._id}/fi`);
            console.log(menu);
            const menuHtml = restaurantModal(restaurant, menu);
            modal.insertAdjacentHTML('beforeend', menuHtml);
            const closer = document.querySelector('#close') as HTMLButtonElement;
            closer.addEventListener('click', () => {
              modal.close();
            }, {once: true});
            modal.showModal();
        } catch (error) {
            modal.innerHTML = errorModal((error as Error).message);
            modal.showModal();
        }
      });
    
    const FbuttonCell = document.createElement('button');
    const token = localStorage.getItem('token');
    if (!token){
        FbuttonCell.disabled = true
    }

    FbuttonCell.innerHTML = `<i class="fa-regular fa-star"></i>`;
    FbuttonCell.addEventListener('click', async () => {
        const data: Favorit = {
            favouriteRestaurant: _id
          };
          const updateResult = await updateFavorite(data, token)
          console.log(updateResult)
          addUserDataToDom(token)
      });

    tr.appendChild(nameCell);
    tr.appendChild(addressCell);
    tr.appendChild(companyCell);
    tr.appendChild(cityCell);
    tr.appendChild(MbuttonCell);
    tr.appendChild(FbuttonCell);
    return tr;
};
  
const restaurantModal = (restaurant: Restaurant, menu: DailyMenu) => {
    const {name, address, city, postalCode, phone, company} = restaurant;
    let html = `<h3>${name}</h3>
      <button id="close" class="user-option"><p>×</p></button>
      <p>${company}</p>
      <p>${address} ${postalCode} ${city}</p>
      <p>${phone}</p>
      <table>
        <tr>
          <th>Course</th>
          <th>Diet</th>
          <th>Price</th>
        </tr>
      `;
    menu.courses.forEach((course) => {
      const {name, diets, price} = course;
      html += `
            <tr>
              <td>${name}</td>
              <td>${diets ?? ' - '}</td>
              <td>${price ?? ' - '}</td>
            </tr>
            `;
    });
    html += '</table>';

    return html;
};

const errorModal = (message: string) => {
    const html = `
        <h3>Error</h3>
        <p>${message}</p>
        `;
    return html;
};



export {createTable, errorModal}