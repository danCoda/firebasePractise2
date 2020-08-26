console.log(firebase);

// Elements:
const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const userDetails = document.getElementById("userDetails");

//==============================
// Referencing Firebase auth SDK:
//==============================
const auth = firebase.auth();

// To enable login:
const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

// Update the View.
auth.onAuthStateChanged(user => {
    if (user) { // Logged in.
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3>`;
    } else { // No user.
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        userDetails.innerHTML = "";
    }
});


//==============================
// Referencing Firebase Firestore SDK:
//==============================
const db = firebase.firestore();

const createThing = document.getElementById("createThing");
const thingsList = document.getElementById("thingsList");

// We need two things to access firestore data in realtime.
let reference; // Reference to the document or collection in the db.
let unsubscribe; // Our frontend will change in realtime to changes in the db, so it will be subscribed to a stream. We need to tell the app to stop listening to save bandwidth.

auth.onAuthStateChanged(user => {
    // We only want to access the db if a user's logged in.
    if (user) {
        // 1. Create reference.
        reference = db.collection("cars");
        // 2. Set our click handler. 
        createThing.onclick = () => {
            reference.add({ // This adds a new document to our collection. New document will have a random document ID.
                uid: user.uid, // The new document will 'belong' to this user.
                brand: faker.commerce.productName(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Make a query stream so that we can get realtime updates based on updates in the DB.
        // When we make a query stream, a function is returned that can be used to unsubscribe from that stream later.
        unsubscribe = reference
            .where("uid", "==", user.uid)
            .onSnapshot(querySnapshot => { // onSnapshot() gets us the stream. If we want to read the data once, use .get().
                // This callback function gets called whenever the stream provides updates/changes.
                console.log("DB has been changed!");

                const items = querySnapshot.docs.map(doc => {
                    return `<li>${doc.data().brand}</li>`;
                });

                thingsList.innerHTML = items.join("");
            });

    } else {
        unsubscribe && unsubscribe(); // If unsubscribe's defined, unsubscribe(); close the stream.
    }
});