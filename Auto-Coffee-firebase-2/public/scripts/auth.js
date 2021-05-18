let userDevicesPROMISES = [];
let statusesAndDevices = [];

//listen for auth status chagnes
auth.onAuthStateChanged(user => {
    userDevicesPROMISES =[];
    statusesAndDevices = [];
   if(user){ //user logged in
    document.querySelector('#pLogin').classList.add('hide');
    document.querySelector('#cDevices').classList.remove('hide');
    setupUI(user);
    setuptDevicesAndStatusses(user);
   }else { //user logged out
    document.querySelector('#pLogin').classList.remove('hide');
    document.querySelector('#cDevices').classList.add('hide');
    setupUI();
    setupDevices([]);
   } 
});

async function setuptDevicesAndStatusses(user){
    userDevicesPROMISES = await getDevices(user);
    await doNextPromise(0);
}

async function doNextPromise(d){
    await getDeviceStatus(userDevicesPROMISES[d].Serial, userDevicesPROMISES[d].Name).then( () => {
        d++;

        if(d < userDevicesPROMISES.length){
            doNextPromise(d);
        }else{
            setupDevices(statusesAndDevices);
            statusesAndDevices.forEach(device => {
                db.collection(`Devices`).doc(device.Serial).onSnapshot( (doc) => {
                    updateDeviceCard(device.Serial, doc.data());
                });
            });
        }
    })
}

async function getDevices(user){
    await db.collection(`users/${user.uid}/devices`).get().then(snapshot => {
        snapshot.forEach(doc => {
            userDevicesPROMISES.push({
                Serial:doc.data().Serial,
                Name: doc.data().Name
            });
            
        });
    });
    return userDevicesPROMISES;
}

async function getDeviceStatus(_serial,_Name){
    await db.collection('Devices').doc(_serial).get().then( doc =>{
        statusesAndDevices.push({
            Name:_Name,
            Serial: _serial,
            Info :doc.data()});
    });
}


//signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    //sign up user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        return db.collection('users').doc(cred.user.uid).set({ "email": email});
    }).then( () => {
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
    })
});

//logout
const logout = document.querySelectorAll('#logout');
logout.forEach(item => item.addEventListener('click', (e) => {
    e.preventDefault();
    //sign out
    auth.signOut();
    console.log("logged out!")
}));

//log in
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //log in info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    //log in user
    auth.signInWithEmailAndPassword(email, password).then(cred => {
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
    });
});