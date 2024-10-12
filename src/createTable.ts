import { fetchData } from "./functions";
import { newMarkers } from "./map";
import { DailyMenu } from "./types/Menu";
import { Restaurant } from "./types/Restaurant";
import { apiUrl } from "./variables";

const createTable = (restaurants: Restaurant[], map: L.FeatureGroup | undefined, modal: HTMLDialogElement) => {
    // chech that map exists
    if (map) {
      newMarkers(restaurants, map)
    }
    const table = document.querySelector('table');
    if (!table){
      console.error('talbe is missing in html');
      return;
    }
    table.innerHTML = '';
    restaurants.forEach((restaurant) => {
      const tr = restaurantRow(restaurant);
      table.appendChild(tr);
      tr.addEventListener('click', async () => {
        try {
          // remove all highlights
          const allHighs = document.querySelectorAll('.highlight');
          allHighs.forEach((high) => {
            high.classList.remove('highlight');
          });
          // add highlight
          tr.classList.add('highlight');
          // add restaurant data to modal
          modal.innerHTML = '';
          // fetch menu
          const menu = await fetchData<DailyMenu> (apiUrl + `/restaurants/daily/${restaurant._id}/fi`);
          console.log(menu);
          const menuHtml = restaurantModal(restaurant, menu);
          modal.insertAdjacentHTML('beforeend', menuHtml);
          modal.showModal();
        } catch (error) {
          modal.innerHTML = errorModal((error as Error).message);
          modal.showModal();
        }
      });
    });
};

const restaurantRow = (restaurant: Restaurant) => {
    const {name, address, company} = restaurant;
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.innerText = name;
    const addressCell = document.createElement('td');
    addressCell.innerText = address;
    const companyCell = document.createElement('td');
    companyCell.innerText = company;
    tr.appendChild(nameCell);
    tr.appendChild(addressCell);
    tr.appendChild(companyCell);
    return tr;
};
  
const restaurantModal = (restaurant: Restaurant, menu: DailyMenu) => {
    const {name, address, city, postalCode, phone, company} = restaurant;
    let html = `<h3>${name}</h3>
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