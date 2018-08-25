import firebase from "firebase";
 
var config = {
    apiKey: "AIzaSyCJGMINS0JavRqtDM3v3fRJHQqSk-wU7xo",
    authDomain: "cityzen-aa9d6.firebaseapp.com",
    databaseURL: "https://cityzen-aa9d6.firebaseio.com",
    projectId: "cityzen-aa9d6",
    storageBucket: "cityzen-aa9d6.appspot.com",
    messagingSenderId: "906463765885"
  };

  firebase.initializeApp(config);

  const storage = firebase.storage();