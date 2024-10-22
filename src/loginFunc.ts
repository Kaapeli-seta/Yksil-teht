
import {fetchData} from './functions';
import {UpdateResult} from './interfaces/UpdateResult';
import { UpdateUser } from './interfaces/User';

// import {UploadResult} from './interfaces/UploadResult';
import { addUserDataToDom, updateUserData, login } from './loginSiplify';
import {apiUrl} from './variables';

const setLoginModal = (modal: HTMLDialogElement) =>{

const loginButtonFrame = document.querySelector('#login-button-frame')

if (loginButtonFrame) {
    loginButtonFrame.addEventListener('click', async () => {
        modal.innerHTML = ''
        const token = localStorage.getItem('token')
        
        if (!token) {
          modal.innerHTML = `    
          <section id="login">

          <div id="dialog-head">
              <h2>Login</h2>
              <button id="close"><p>×</p></button>
            </div>

            <p>Login to get user data</p>

            <form id="login-form">
              <div class="form-control">
                <label for="username-login">Username</label>
                <input id="username-login" class="inputfield" type="text" name="username" placeholder="UserName" minlength="3" maxlength="15" title="Min 3 Max 15 characters" required>
              </div>

              <div class="form-control">
                <label for="password-login">Password</label>
                <input id="password-login" class="inputfield" type="password" name="password" name="password" placeholder="Password" minlength="5" maxlength="15" title="Min 5 Max 15 characters" required>
              </div>

              <div class="form-control">
                <input type="submit" value="Login" class="user-option">
              </div>

            </form>
          </section>

          <hr>

          <section id="register">
            <div>
            <h2>Register</h2>

              <form id="register-form">
              <div class="form-control">
                <label for="username-register">Username</label>
                <input id="username-register" class="inputfield" type="text" name="username" placeholder="UserName" minlength="3" maxlength="15" title="Min 3 Max 15 characters" required>
              </div>
              
              <div class="form-control">
                <label for="email-register">Email</label>
                <input id="email-register" class="inputfield" type="email" name="Email" placeholder="User@mail.com" required>
              </div>

              <div class="form-control">
                <label for="password-register">Password</label>
                <input id="password-register" class="inputfield" type="password" name="password" name="password" placeholder="Password" minlength="5" maxlength="15" title="Min 5 Max 15 characters" required>
              </div>

              <div class="form-control">
                <input type="submit" value="Register" class="user-option">
              </div>

            </div>
          </section>
          `
          const closer = document.querySelector('#close') as HTMLButtonElement;
          closer.addEventListener('click', () => {
            modal.close();
          }, {once: true});
        }
      else {        
        modal.innerHTML = `    
        <section id="profile">
          <div id="dialog-head">
            <h2>Profile</h2>
            <button id="close"><p>×</p></button>
          </div>
          <p>Username: <span id="username-target" placeholder="UserName" minlength="3" maxlength="15" title="Min 3 Max 15 characters" required></span></p>
          <p>Email: <span id="email-target"></span></p>
          <p>Favorit Restaurant: <span id="favorit-target"></span></p>
          <form id="select-form">

          <div id="avatar-background">
            <input type="image" id="avatar-target" src="" name="saveForm" class=""/>
            <p><i class="fa-solid fa-pen-to-square"></i></p>
          </div>
          
            <div class="form-control" id="user-options">
              <input type="submit" id="profile-info" value="Eddit profile" class="user-option">
              
              <button id="logout" class="user-option">Logout</button>
            </div>
            </form>
        </section>
          <div id="edit-profile" style="display: none;">

          </div>`
          const closer = document.querySelector('#close') as HTMLButtonElement;
          closer.addEventListener('click', () => {
            modal.close();
          }, {once: true});
      }
      const usernameTarget = document.querySelector('#username-target') as HTMLSpanElement;
      const emailTarget = document.querySelector('#email-target') as HTMLSpanElement;
      const avatarTarget = document.querySelector('#avatar-target') as HTMLImageElement;
      const favoritTarget = document.querySelector('#favorit-target') as HTMLSpanElement;
      loginDetect ()
      addUserDataToDom(token, usernameTarget, emailTarget, avatarTarget, favoritTarget)
      userEditFormatter(usernameTarget, emailTarget, avatarTarget);
      modal.showModal();
    })
    
}
};

function userEditFormatter (usernameTarget: HTMLSpanElement, emailTarget: HTMLSpanElement, avatarTarget: HTMLImageElement) {
  const profileInfo = document.querySelector('#profile-info') as HTMLSpanElement | null;
  const editProfile = document.querySelector('#edit-profile') as HTMLSpanElement | null;

  
  if (!profileInfo) {
    return;
  }

  profileInfo.addEventListener('click', (evt) => {
    evt.preventDefault();
    if(!editProfile){
      return;
    }
    editProfile.style.display = 'block'

    editProfile.innerHTML = `
      <h2>Edit profile</h2>
      <form id="profile-form">

        <div class="form-control">
          <label for="profile-username">Username</label>
          <input id="profile-username" class="inputfield" type="text" name="username" placeholder="UserName" minlength="3" maxlength="15" title="Min 3 Max 15 characters">
        </div>

        <div class="form-control">
          <label for="profile-email">Email</label>
          <input id="profile-email" class="inputfield" type="email" name="email" placeholder="Email" minlength="3" maxlength="15" title="Min 3 Max 15 characters">
        </div>

        <div class="form-control">
          <input type="submit" value="Update" class="user-option">
        </div>
      </form>
    `

    
    const profileForm = document.querySelector('#profile-form') as HTMLFormElement | null;
    //update info
    const profileUsernameInput = document.querySelector(
      '#profile-username'
    ) as HTMLInputElement | null;
    const profileEmailInput = document.querySelector(
      '#profile-email'
    ) as HTMLInputElement | null;

    if (profileForm) {
      profileForm.addEventListener('submit', async (evt) => {
        try {
          evt.preventDefault();
          const token = localStorage.getItem('token')
          if (!token) {
            return
          }
          if (!profileUsernameInput || !profileEmailInput){
            throw new Error('elementti ei saatavilla')
          }
          const username = profileUsernameInput.value as string | undefined;
          const email = profileEmailInput.value as string | undefined;
    
          const data = {} as UpdateUser;
          data.username = username ? username : undefined
          data.email = email ? email : undefined


          const updateResult = await updateUserData(data, token);
          console.log(updateResult)
    
          addUserDataToDom(token, usernameTarget, emailTarget)
        } catch (error) {
            console.log((error as Error).message);
          }
      });
    
    }

  });

  if (!avatarTarget) {
    return;
  }
  
  avatarTarget.addEventListener('click', (evt) => {
    evt.preventDefault();
    if(!editProfile){
      return;
    }
    editProfile.style.display = 'block'
     editProfile.innerHTML = `
      <h2>Upload avatar</h2>
      <form id="avatar-form">
        <div class="form-control">
          <input id="avatar" type="file" name="avatar" >
          <label for="avatar" class="user-option">Choose image</label>
        </div>
        <div class="form-control">
          <input type="submit" value="Uppload" class="button user-option">
        </div>
      </form>`

      const avatarForm = document.querySelector('#avatar-form') as HTMLFormElement | null;

    if (avatarForm) {
      avatarForm.addEventListener('submit', async (evt) => {
        evt.preventDefault();
        const fd = new FormData(avatarForm);
        const token = localStorage.getItem('token')
        const options: RequestInit = {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
          },
          body: fd
        }
        const UploadResult = await fetchData<UpdateResult>(apiUrl + '/users/avatar', options);
        
        /// chck something
        console.log(UploadResult);
        addUserDataToDom(token, undefined, undefined, avatarTarget)
      });
    }

  });


};

function loginDetect () {

// select forms
const loginForm = document.querySelector('#login-form') as HTMLFormElement | null;

// logout button
const logoutButton = document.querySelector('#logout');

// select inputs
const usernameInput = document.querySelector(
  '#username-login'
) as HTMLInputElement | null;
const passwordInput = document.querySelector(
  '#password-login'
) as HTMLInputElement | null;


if (loginForm) {
  loginForm.addEventListener('submit', async (evt) => {
    try {
    evt.preventDefault();
    const loginResult = await login(passwordInput, usernameInput);
    console.log(loginResult)
    localStorage.setItem('token', loginResult.token)

    location.reload()
    } catch (error) {
      console.log((error as Error).message);
    }
  });
}


logoutButton?.addEventListener('click', () => {
  localStorage.removeItem('token');
  location.href = './';
});


}



export {setLoginModal, loginDetect};