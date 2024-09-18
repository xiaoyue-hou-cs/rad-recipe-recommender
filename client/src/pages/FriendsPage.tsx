import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { UserData } from "../interfaces/MultifactedUser";
import authRefHelper from "../firebase/AuthRefHelper";
import firebase from '../firebase/Firebase';
import { useNavigate } from "react-router-dom";
import Title from '../components/Title'
import '../styles/Friends.css'

function FriendsPage() {
    const [queriedID, setQueriedID] = useState('')
    const [friendList, setFriendList] = useState<any[]>([])
    const [alert, setAlert] = useState('')
    // The below code block serves as a listener. After this, you will be able
    // to access both information relating to the GoogleUser and the FirebaseUser.
    const [googleUser, setGoogleUser] = useState<any>(null)
    const [fbUser, setFBUser] = useState<UserData>()
    useEffect(() => {authRefHelper(setGoogleUser, setFBUser)}, [])
    useEffect(() => {accessUpdateFriends()}, [fbUser])
    const navigate = useNavigate()

    var devRef = firebase.firestore().collection("user_accounts")    
    const sendFriendRequest = (friendID : string, notifSetter : (updatedMessage : string) => any) => {
        if (friendID) {
            if (fbUser !== undefined) {
                // checks if the user is already a friend and that the user is not themself
                if (!(new Set(fbUser.friend_list)).has(friendID) && fbUser.id !== friendID) {
                    devRef.doc(friendID).get().then((doc) => {
                        // Attempts
                        if (doc.exists) {
                            const datablock = doc.data()
                            if (datablock !== undefined) {
                                if (datablock.recipe_list !== undefined) {
                                    devRef.doc(friendID).update({
                                    incoming_friends : firebase.firestore.FieldValue.arrayUnion(fbUser.id)
                                })
                                } else {
                                devRef.doc(friendID).update({
                                    incoming_friends : [fbUser.id]
                                })}
                                notifSetter('Friend request sent!')
                            } 
                        } else {
                            console.log('Could not find user.')
                            notifSetter('Could not find user.')
                        }
                    })
                } else {
                    console.log("You are already friends with this user!")
                    notifSetter("You are already friends with this user!")
                }
            } else {
                console.log("There was an issue with user authentication. Try logging out then back in again.")
                notifSetter("There was an issue with user authentication. Try logging out then back in again.")
            }
        }
    }

    // 3) Access friends; when returning the list, make sure to delete users that no longer exist
    const accessUpdateFriends = () => {
        if (fbUser !== undefined) {
            devRef.get().then((items) => {
                return items.docs.map(doc => doc.data())
            }).then((allItems)=> {
            devRef.doc(fbUser?.id).get().then((doc) => {
                if (doc.exists) {
                    const dataBlock = doc.data()
                    if (dataBlock !== undefined) {
                        const friendList = dataBlock.friend_list
                        if (friendList !== undefined) {
                            let userIDList = new Set(allItems.map(function (doc) {return doc.id;}))
                            let userDict : Map<string, any> = new Map(allItems.map(x => [x.id, x]))
                            let updatedFriend = []
                            let updatedFriendID = []
                            
                            for (let i = 0; i < friendList.length; i++) {
                                const friend = friendList[i]
                                if (userIDList.has(friend)) {
                                    updatedFriend.push(userDict.get(friend))
                                    updatedFriendID.push(userDict.get(friend).id)
                                }
                            }

                            if (updatedFriendID.length !== friendList.length) {
                                devRef.doc(fbUser?.id).update({
                                    friend_list : firebase.firestore.FieldValue.arrayUnion(updatedFriendID)
                                })
                            }

                            const imDiv = []
                            for (let i = 0; i < updatedFriend.length; i++) {
                                const friendID = updatedFriend[i].id
                                const endpoint = "/gallery/"+ friendID
                                imDiv.push(
                                    <div key={i}>
                                        <img
                                            src = {updatedFriend[i].photoURL}
                                            alt= {"profile picture for " + updatedFriend[i].name}
                                            onClick= {() => {navigate(endpoint)}}
                                            referrerPolicy="no-referrer"/>
                                        <br></br>
                                        <p className='friend-title'>{updatedFriend[i].name}</p>
                                        <button className="remove-friend-button" onClick={()=>{removeFriend(friendID)}}>Remove Friend</button>
                                    </div>
                                )
                            }
                            setFriendList(imDiv)
                        }
                    }
                } else {
                    console.log("FBUser data could not be found!")
                }
            })
        }
            )
    }
    }


    const removeFriend = (idToRemove : string) => {
        console.log(idToRemove)
        devRef.doc(idToRemove).get().then((doc) => {
            if (doc.exists) {   
                const dataBlock = doc.data()
                if (dataBlock !== undefined) {
                    devRef.doc(idToRemove).update({
                        friend_list : firebase.firestore.FieldValue.arrayRemove(fbUser?.id)
                    })
                }
            }
        devRef.doc(fbUser?.id).update({
            friend_list : firebase.firestore.FieldValue.arrayRemove(idToRemove)
        }).then(() => {accessUpdateFriends()})
        })
    }
    

    console.log("Safeguard! (This is used to check how many times the page is reloaded...)")

    return (
      <div>
        <Title />
        <Navbar />
        <div className="everything-else">
          <div className="search-bar-input">
            <fieldset>
              <div className="friend-text">Add more friends!</div>
              <input
                className="friends-div"
                value={queriedID}
                placeholder="Enter a friend's user ID!"
                onChange={(ev) => setQueriedID(ev.target.value)}
                aria-label={"friend searchbar"}
              ></input>
            </fieldset>
          </div>
          <button
            className="add-friends-button"
            onClick={() => {
              sendFriendRequest(queriedID, setAlert);
              setQueriedID("");
            }}
          >
            Send Friend Request
          </button>
          <p className="alert-text">{alert}</p>
          <div className="friendlist">{friendList}</div>
        </div>
      </div>
    );
  }

  export default FriendsPage