import { fetchData } from "./functions";
import { UpdateResult } from "./interfaces/UpdateResult";
import { LoginUser, UpdateUser, User } from "./interfaces/User";
import { Restaurant } from "./types/Restaurant";
import { apiUrl, uploadUrl } from "./variables";



const login = async (passwordInput:HTMLInputElement | null ,usernameInput:HTMLInputElement | null): Promise<LoginUser> => {
    if (!passwordInput || !usernameInput){
      throw new Error('elementti ei saatavilla')
    }
    const password = passwordInput.value;
    const username = usernameInput.value;
    const data = {
      username,
      password,
    };
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    const result = await fetchData<LoginUser>(apiUrl + '/auth/login', options);
    return result
  };


const updateUserData = async (user: UpdateUser, token: string | null): Promise<UpdateResult> => {
    const options: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(user),
    };
    const result = await fetchData<LoginUser>(apiUrl + '/users', options);
    return result
  };


const addUserDataToDom = (
    token?: string | null,
    usernameTarget?:HTMLSpanElement, 
    emailTarget?: HTMLSpanElement,
    avatarTarget?: HTMLImageElement,
    favoritTarget?: HTMLSpanElement
): void => {
    if (!token){return}
    const user = async () => await getUserData(token);
    user().then((user) => {
    console.log('Dom Updatad')
    if (!user) {return;}
    if (usernameTarget) {usernameTarget.innerHTML = user.username;} 
    if (emailTarget) {emailTarget.innerHTML = user.email;}
    if (avatarTarget) {avatarTarget.src = uploadUrl + user.avatar;}
    if (favoritTarget) {
        const name = async (): Promise<Restaurant["name"]> => {return (await fetchData<Restaurant>(apiUrl + `/restaurants/${user.favouriteRestaurant}`)).name}
         name().then((name) => favoritTarget.innerHTML = name) ;
         console.log(user.favouriteRestaurant)
        }
    })
}


const getUserData = async (token: string | null): Promise<User | void> => {
    if(!token) {console.log('no token'); return;}
    const options: RequestInit = {headers: {Authorization: 'Bearer ' + token,},
    };
    return await fetchData<User>(apiUrl + '/users/token', options)
  };



  export {getUserData, addUserDataToDom, updateUserData, login}