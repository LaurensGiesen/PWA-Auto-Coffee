"use strict";

const devices = document.querySelector('#card-container');

document.addEventListener("DOMContentLoaded", init);

async function init(){
    const forage = localforage.createInstance({name: "auto-coffee"});
    let data = [];
    await forage.iterate((value) => {
        data.push(value);
    })
    setupDevices(data);
}

const setupDevices = (data) => {
    if(data.length != 0){
        devices.innerHTML = '';
        data.forEach(device => {
            let reservoirIcon = `<i class="material-icons red-text">close</i>`;
            if(device.Info.reservoirFull === "True"){
                reservoirIcon = `<i class="material-icons green-text">check</i>`;
            }
            devices.innerHTML += `
            <div id="Device${device.Serial}" class="card grey lighten-2" style="flex: 0 0 33.333%; margin-right: 1rem;">
                <div class="card-image" style="overflow: visible">
                    <img src="img/senseo.jpg" class="responsive-img"alt="senseo">
                    <a id="cupBTN" class="btn-floating halfway-fab waves-effect waves-light orange left disabled" data-id="${device.Serial}" data-status="One Cup">1</a>
                    <a id="cupBTN" class="btn-floating halfway-fab waves-effect waves-light orange right disabled" data-id="${device.Serial}" data-status="Two Cup's" >2</a>
                </div>
                <div class="card-content black-text">
                    <div class="card-title">${device.Name}</div>
                    <p>${device.Serial}</p>
                    <p>Info:</p>
                    <p id="infoStatus">${device.Info.Status}</p>
                    <span id="infoReservoir" style="justify-content:center" class="valign-wrapper">Reservoir Filled${reservoirIcon}</span>
                </div>
                <div class="card-action">
                    <a id="removeBTN" class="waves-effect waves-light btn deep-orange darken-2 hide-on-med-and-down disabled" data-id="${device.Name}"><i class="material-icons right" >delete</i>remove</a>
                    <a id="removeBTN" class="waves-effect waves-light btn-floating deep-orange darken-2 hide-on-med-and-up disabled" data-id="${device.Name}"><i class="material-icons right">delete</i></a>
                </div>
            </div>
            `;
            document.querySelectorAll("#removeBTN").forEach(button => button.addEventListener('click', (e) => { 
                e.stopPropagation();
                let name = e.target.closest("a").getAttribute("data-id");
                db.collection(`users/${auth.currentUser.uid}/devices`).doc(name).delete();
            }));
            document.querySelectorAll("#cupBTN").forEach(button => button.addEventListener('click', (e) => { 
                e.stopPropagation();
                let Serial = e.target.closest("a").getAttribute("data-id");
                let status = e.target.closest("a").getAttribute("data-status");
                db.collection("Devices").doc(Serial).update({
                    Status : status
                });
            }));
        })
    }else{
        devices.innerHTML = `<h4 class="grey-text">No devices yet</h4>`;
    }
};