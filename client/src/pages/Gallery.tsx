import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import firebase from '../firebase/Firebase';
import Title from '../components/Title'
import "../styles/Gallery.css"

export function GalleryHome() {

    const [queriedID, setQueriedID] = useState('')
    const navigate = useNavigate()

    return (
      <div className="user-div">
        <Title />
        <Navbar />
        <div className="everything-else">
          <div className="search-bar-input">
          <fieldset>
            <div className="user-text">
              Enter someone else's user ID to view their profile!
            </div>

            <input
              className="user-id-search"
              value={queriedID}
              placeholder="Enter a user ID..."
              onChange={(ev) => setQueriedID(ev.target.value)}
              aria-label={"searchbar"}
            ></input>
           
          </fieldset>
          </div>
          <button
            className="gallery-button"
            aria-label="press to search for user gallery"
            onClick={() => {
              navigate("/gallery/" + queriedID);
            }}
          >
            Search user
          </button>
        </div>
      </div>
    );
  }


export function IndividualGallery() {
    
    const params = useParams()
    const queriedID = params.id
    const navigate = useNavigate()
    var devRef = firebase.firestore().collection("user_accounts")

    const [itemList, setItemList] = useState<any[]>([])

    function returnListByID(id : string | undefined, iSetter : (newItems : any[]) => any) {
        devRef.doc(id).get().then((doc) => {
            if (doc.exists) {
                const dataBlock = doc.data()
                if (dataBlock !== undefined) {
                    const recList = dataBlock.recipe_list
                    if (recList !== undefined) {
                        const imDiv = []
                        for (let i = 0; i < recList.length ; i++) {
                            imDiv.push(
                                <div >
                                <img
                                    src = {recList[i].thumbnail}
                                    alt= {"cover picture of " + recList[i].title}
                                    onClick={() => {window.open(recList[i].url)}}/>
                                <br></br>
                                <div className='recipe-title' aria-label='recipe title'>{recList[i].title}</div>
                            </div>
                            )
                            iSetter(imDiv)
                        }
                    }
                }
            } else {
                console.log('could not find their id')
            }
        })
    }
    returnListByID(queriedID, setItemList)

    return (
      <div>
        <Title />
        <Navbar />{" "}
        <div className="everything-else">
          <div className="my-recipelist" aria-label="my recipelist">
            {itemList}
          </div>

          <div className="back-button-container">
            <button
              className="back-button"
              onClick={() => {
                navigate(-1);
              }}
            >
              {" "}
              Take me back{" "}
            </button>
          </div>
        </div>
      </div>
    );
}