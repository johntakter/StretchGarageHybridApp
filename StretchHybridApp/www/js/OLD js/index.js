document.addEventListener("deviceready", onDeviceReady, false);

// device APIs are available
//
function onDeviceReady() {
    var element = document.getElementById('content');
    element.innerHTML = 'index';
    window.UpdateLocation.initialize(); 
}