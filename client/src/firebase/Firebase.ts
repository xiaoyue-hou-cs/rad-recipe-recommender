import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTctmdtbNXRsWDol9a3wFTGRi1xszMGy0",
  authDomain: "rad-recipe-recommender.firebaseapp.com",
  databaseURL: "https://rad-recipe-recommender-default-rtdb.firebaseio.com",
  projectId: "rad-recipe-recommender",
  storageBucket: "rad-recipe-recommender.appspot.com",
  messagingSenderId: "981648998753",
  appId: "1:981648998753:web:3fc8ee5a3823939a92c520",
};

const app = firebase.initializeApp(firebaseConfig);

// For other files that will use firebase, "import firebase from './Firebase'"

export const auth = getAuth(app);
export default firebase;
