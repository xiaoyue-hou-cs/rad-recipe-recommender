import Navbar from "../components/Navbar";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/Firebase";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { UserData } from "../interfaces/MultifactedUser";
import authRefHelper from "../firebase/AuthRefHelper";
import firebase from "../firebase/Firebase";
import Title from "../components/Title";
import "../styles/Home.css";
import Recommendations from "../components/Recommendations";

function returnListByID(id: string, iSetter: (newItems: any[]) => any) {
  var devRef = firebase.firestore().collection("user_accounts");
  devRef
    .doc(id)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const dataBlock = doc.data();
        if (dataBlock !== undefined) {
          const recList = dataBlock.recipe_list;
          if (recList !== undefined) {
            const imDiv = [];
            for (let i = 0; i < recList.length; i++) {
              imDiv.push(
                <div key={i}>
                  <img
                    src={recList[i].thumbnail}
                    alt={"cover picture of " + recList[i].title}
                    onClick={() => {
                      window.open(recList[i].url);
                    }}
                  />
                  <br></br>

                  <div className="recipe-title" aria-label="recipe title">
                    {recList[i].title}
                  </div>
                  <button
                    className="button-container"
                    onClick={() => {
                      devRef.doc(id).update({
                        recipe_list: firebase.firestore.FieldValue.arrayRemove(
                          recList[i]
                        ),
                      });
                      returnListByID(id, iSetter);
                    }}
                  >
                    {" "}
                    Remove From List{" "}
                  </button>
                </div>
              );
            }
            iSetter(imDiv);
          }
        }
      } else {
        console.log("could not find their id");
      }
    });
}

function Home() {
  const [incomingFriends, setIncomingFriends] = useState<any[]>([]);
  const [userList, setList] = useState<any>([]);

  // The below code block serves as a listener. After this, you will be able
  // to access both information relating to the GoogleUser and the FirebaseUser.
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [fbUser, setFBUser] = useState<UserData>();
  useEffect(() => {
    authRefHelper(setGoogleUser, setFBUser);
  }, []);
  useEffect(() => {
    getIncomingFriends();
    returnListByID(fbUser?.id ?? "x", setList);
  }, [fbUser]);
  const devRef = firebase.firestore().collection("user_accounts");

  interface EditBoxProps {
    localName: string | undefined;
    localSetName: Dispatch<SetStateAction<string | undefined>>;
    ariaLabel: string;
  }

  function EditBox({ localName, localSetName, ariaLabel }: EditBoxProps) {
    const [value, setValue] = useState("");
    const editName = (newName: string) => {
      var devRef = firebase.firestore().collection("user_accounts");
      devRef.doc(fbUser?.id).update({
        name: newName,
      });
    };

    return (
      <div id="editBox" className="edit-section" aria-label={ariaLabel}>
        <input
          value={value}
          placeholder="New Name"
          onChange={(ev) => setValue(ev.target.value)}
          aria-label={"name change"}
        ></input>
        <br />
        <button
          onClick={() => {
            editName(value);
            localSetName(value);
            setValue("");
          }}
        >
          Click to Change Name
        </button>
      </div>
    );
  }

  const getIncomingFriends = () => {
    devRef
      .get()
      .then((items) => {
        return items.docs.map((doc) => doc.data());
      })
      .then((allUsers) => {
        getIncomingFriendsHelper(allUsers);
      });
  };

  const getIncomingFriendsHelper = (allUsers: any[]) => {
    devRef
      .doc(fbUser?.id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const dataBlock = doc.data();
          if (dataBlock !== undefined) {
            const incomingFriends = dataBlock.incoming_friends;
            if (incomingFriends !== undefined) {
              const incomingFriendObjects = [];
              for (let i = 0; i < incomingFriends.length; i++) {
                let incomingFriend = incomingFriends[i];
                let userDict: Map<string, any> = new Map(
                  allUsers.map((x) => [x.id, x])
                );
                if (userDict.has(incomingFriend)) {
                  let incomingFriendObject = userDict.get(incomingFriend);
                  console.log(incomingFriendObject.photoURL);
                  incomingFriendObjects.push(
                    <div key={i}>
                      <img
                        src={incomingFriendObject.photoURL}
                        alt={"profile picture for " + incomingFriendObject.name}
                        onClick={() => {
                          acceptFriendRequest(incomingFriend);
                        }}
                        referrerPolicy="no-referrer"
                      />
                      <br></br>
                      <p>{incomingFriendObject.name}</p>
                    </div>
                  );
                }
              }
              setIncomingFriends(incomingFriendObjects);
            }
          }
        }
      });
  };

  const acceptFriendRequest = (acceptedID: string) => {
    console.log(acceptedID);
    devRef
      .doc(acceptedID)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const dataBlock = doc.data();
          if (dataBlock !== undefined) {
            devRef.doc(acceptedID).update({
              friend_list: firebase.firestore.FieldValue.arrayUnion(fbUser?.id),
            });
            console.log("added!");
          }
          return true;
        } else {
          return false;
        }
      })
      .then((foundUser) => {
        devRef.doc(fbUser?.id).update({
          incoming_friends:
            firebase.firestore.FieldValue.arrayRemove(acceptedID),
        });
        if (foundUser) {
          devRef
            .doc(fbUser?.id)
            .update({
              friend_list: firebase.firestore.FieldValue.arrayUnion(acceptedID),
            })
            .then(() => getIncomingFriends());
        } else {
          console.log("Couldn't find the user :((");
        }
      });
  };

  console.log("CHECK!");
  const [name, setName] = useState<string | undefined>(undefined);

  return (
    <div className="homepage">
      <div>
        <Title />
        <Navbar />
      </div>
      <div className="content">
        <div className="left-item">
          <p
            style={{
              margin: "10px",
              fontSize: "large",
            }}
          >
            Recommended recipes (based on your friends):
          </p>
          <Recommendations userObject={fbUser}></Recommendations>
        </div>

        <div className="right-item">
          <p className="userWelcome">Welcome {name ?? fbUser?.name}! </p>
          <div className="userWelcome">
            <img
              src={googleUser?.photoURL as string}
              referrerPolicy="no-referrer"
            />
            <br></br>
            <p>User ID: {fbUser?.id}</p>

            <div className="button-holder">
              <button
                onClick={() => {
                  const change = document.getElementById("editBox");
                  if (change instanceof HTMLElement) {
                    change.style.display = "block";
                  }
                }}
              >
                Edit Profile{" "}
              </button>
              <button
                onClick={() => {
                  signOut(auth);
                }}
              >
                {" "}
                Log Out{" "}
              </button>
            </div>

            <br></br>

            <EditBox
              localName={name}
              localSetName={setName}
              ariaLabel="box to edit username"
            />
          </div>
          <div className="userWelcome">
            <p>Your Recipe List (click to open recipe!):</p>
            <div className="my-recipelist" aria-label="my recipelist">
              {userList}
            </div>
            <div className="incoming-friends">
              <p>Incoming Friend Requests (click to accept!):</p>
              <div>{incomingFriends}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
