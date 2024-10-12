
//not used

function isOnline() {
    const xmlhttp = new XMLHttpRequest();
    let state;
    xmlhttp.onload = () => { return state = true }
    xmlhttp.onerror = () => { return state = false}
    
    xmlhttp.open("GET","http://www.openstreetmap.org/copyright",true);
    xmlhttp.send();
    return state
}



export {isOnline}