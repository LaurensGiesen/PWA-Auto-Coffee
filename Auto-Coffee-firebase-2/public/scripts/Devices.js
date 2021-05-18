const devices = document.querySelector('#card-container');

//pairing up a device
const addDeviceForm = document.querySelector('#add-device-form');
addDeviceForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get form info
    const Name = addDeviceForm['name'].value;
    const key = addDeviceForm['key'].value;
    const user = auth.currentUser;

    //check if correct key is given
    const userDevRef = db.collection(`users/${user.uid}/devices`)
    db.collection('Devices').doc(key).get().then(doc => {
        if(doc.data().Status === "Pairing"){
            userDevRef.doc(Name).set({
                "Name":Name,
                "Serial":key
        }).then( () => {
            const modal = document.querySelector('#modal-add-device');
            M.Modal.getInstance(modal).close();
            addDeviceForm.reset();
        }).then( () => {
            db.collection(`users/${user.uid}/devices`).get().then(snapshot => {
                setupDevices(snapshot.docs);
            });
        });
        }else{
            console.log("bad key");
        }
    });
    
});

//devices

const setupDevices = (data) => {
    if(data.length != 0){
        saveDeviceOnIndexedDb(data);
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
                    <a id="cupBTN" class="btn-floating halfway-fab waves-effect waves-light orange left" data-id="${device.Serial}" data-status="One Cup">1</a>
                    <a id="cupBTN" class="btn-floating halfway-fab waves-effect waves-light orange right" data-id="${device.Serial}" data-status="Two Cup's" >2</a>
                </div>
                <div class="card-content black-text">
                    <div class="card-title">${device.Name}</div>
                    <p>${device.Serial}</p>
                    <p>Info:</p>
                    <p id="infoStatus">${device.Info.Status}</p>
                    <span id="infoReservoir" style="justify-content:center" class="valign-wrapper">Reservoir Filled${reservoirIcon}</span>
                </div>
                <div class="card-action">
                    <a id="removeBTN" class="waves-effect waves-light btn deep-orange darken-2 hide-on-med-and-down" data-id="${device.Name}"><i class="material-icons right" >delete</i>remove</a>
                    <a id="removeBTN" class="waves-effect waves-light btn-floating deep-orange darken-2 hide-on-med-and-up" data-id="${device.Name}"><i class="material-icons right">delete</i></a>
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

async function updateDeviceCard(deviceSerial, newData){
    const forage = localforage.createInstance({name: "auto-coffee"});
    forage.getItem(deviceSerial).then(data => {
        data.Info.Status = newData.Status;
        data.Info.reservoirFull = newData.reservoirFull;
        forage.setItem(deviceSerial,data);        
    });
    
    let reservoirIcon = `<i class="material-icons red-text">close</i>`;
    if(newData.reservoirFull === "True"){
        reservoirIcon = `<i class="material-icons green-text">check</i>`;
    };
    document.querySelector(`#Device${deviceSerial} #infoStatus`).innerHTML = newData.Status;
    document.querySelector(`#Device${deviceSerial} #infoReservoir`).innerHTML = `Reservoir Filled${reservoirIcon}`;
    
    
};

const saveDeviceOnIndexedDb = (data) => {
    const forage = localforage.createInstance({name: "auto-coffee"});
    data.forEach(device => {
        forage.setItem(device.Serial, device)
    })
}
