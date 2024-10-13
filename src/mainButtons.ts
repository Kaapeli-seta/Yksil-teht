

function NavButtons () {
// selectors for mobile buttons
const expandMobile = document.querySelector('#expand-mobile')
const navDisply = document.querySelector('#normal-nav')



function displayNav () {
    if(!navDisply) {return;}
    navDisply.classList.toggle('slide')
}

// Code for mobile buttons
if(expandMobile) {
expandMobile.addEventListener('click', displayNav);
}
//dark mode
const checkbox = document.getElementById("checkbox")
if(checkbox){
checkbox.addEventListener("change", () => {
    document.body.classList.toggle("dark")
    document.documentElement.classList.toggle("dark")
})}
}

export {NavButtons}
