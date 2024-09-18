import firebase, { auth } from "./Firebase";
import { UserData } from "../interfaces/MultifactedUser";

var devRef = firebase.firestore().collection("user_accounts");

export function authRefHelper(
  googleSetter: (u: any) => any,
  userSetter: (u: UserData) => any
) {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      googleSetter(user);
      convertToMultifactedUser(user, userSetter);
      console.log(user);
    }
  });
  unsubscribe();

  const convertToMultifactedUser = (
    googleUser: any,
    uSetter: (u: UserData) => any
  ) => {
    devRef
      .doc(googleUser.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const dataBlock = doc.data();
          if (dataBlock !== undefined) {
            const multifactedUser: UserData = {
              name: dataBlock.name,
              email: dataBlock.email,
              id: dataBlock.id,
              photoURL: dataBlock.photoURL,
              recipe_list: dataBlock.recipe_list,
              friend_list: dataBlock.friend_list,
              incoming_friends: dataBlock.incoming_friends,
            };
            uSetter(multifactedUser);
            console.log("User has been set!");
          }
        } else {
          console.log(
            "User could not be found in Firebase! Generating a new account..."
          );
          createAccountOrLogin(googleUser, googleUser.uid);
        }
      });
  };
}

export function createAccountOrLogin(googleUser: any, uid: string) {
  const generateAccount = ({
    name,
    email,
    id,
    photoURL,
    recipe_list,
    friend_list,
    incoming_friends,
  }: UserData) => {
    devRef
      .doc(uid)
      .set({
        name,
        email,
        id,
        photoURL,
        recipe_list,
        friend_list,
        incoming_friends,
      })
      .catch((e) => console.log(e));
  };
  devRef
    .doc(uid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        const name = googleUser.displayName;
        const email = googleUser.email;
        const photoURL = googleUser.photoURL;
        const id = uid;
        generateAccount({
          name,
          email,
          id,
          photoURL,
          recipe_list: new Array(),
          friend_list: new Array(),
          incoming_friends: new Array(),
        });
        console.log("Account generated!");
      } else {
        console.log("Account exists.");
      }
    });
}

export default authRefHelper;
