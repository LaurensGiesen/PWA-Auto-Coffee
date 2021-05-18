
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');


const setupUI = (user) =>{
    if (user) {
        //account info
        db.collection('users').doc(user.uid).get().then(doc => {
            const html = `
            <div>Logged in as ${doc.data().email}</div>
        `;
        accountDetails.innerHTML = html;
        });
        //toggle UI elements
        
        loggedInLinks.forEach(item => item.classList.remove('hide'));
        loggedOutLinks.forEach(item => item.classList.add('hide'));
    }else {
        // empty account info
        accountDetails.innerHTML = '';
        // toggle UI elements
        loggedInLinks.forEach(item => item.classList.add('hide'));
        loggedOutLinks.forEach(item => item.classList.remove('hide'));
    }
}

//setup materialize conponents
document.addEventListener('DOMContentLoaded', function() {

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js")
            .then(res => console.log("Registered service worker with scope: ", res.scope))
    };
    
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
});  