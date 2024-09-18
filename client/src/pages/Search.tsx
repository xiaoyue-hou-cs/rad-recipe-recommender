import firebase from "../firebase/Firebase";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { RecipeData } from "../interfaces/MultifacetedRecipes";
import { UserData } from "../interfaces/MultifactedUser";
import authRefHelper from "../firebase/AuthRefHelper";
import "../styles/searchStyles.css";
import Title from "../components/Title";
import { Select } from "@chakra-ui/react";
import mock_information from "../mock/mock_information.json";
import { API_KEY } from "../private/key";

const MOCK: boolean = false;

interface ControlledImageProps {
  link: string;
  altText: string;
  malLink: string;
}

/**
 * Uses the interface Controlled image props to create an image
 *
 * @param link - the src of the image
 * @param altText - the alt text of the image
 * @returns an image
 */
function ControlledImage({ link, altText, malLink }: ControlledImageProps) {
  return (
    <div>
      <a target="_blank" href={malLink}>
        <img src={link} alt={altText}></img>
      </a>
    </div>
  );
}

interface ControlledTitleProps {
  title: string;
}

/**
 * creates a title line using the ControlledTitleProp
 *
 * @param title - title of the show
 * @returns
 */
function ControlledTitle({ title }: ControlledTitleProps) {
  return <p className="image-title">{title}</p>;
}

/**
 * creates a list of search result divs and allows for them to be displayed. Also adds the show to a users
 * recipelist.
 * @param data the data set of the search results
 * @param setItems part of the hook that we use to set the list of react element sop that thay can be displayed.
 * @param addToAcc adds the recipe block that we create for each show to a person's recipe list if they want it.
 */
async function CreateSearchResults(
  data: any[],
  setItems: (itemList: any[]) => any,
  addToAcc: (recipeBlock: RecipeData) => any
) {
  let imDiv = [];
  if (data[0] !== undefined) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id !== undefined) {
        try {
          if (MOCK) {
            data[i].url = mock_information.sourceUrl;
            data[i].score = mock_information.spoonacularScore;
            data[i].cuisines = mock_information.cuisines;
          } else {
            const response = await fetch(
              "https://api.spoonacular.com/recipes/" +
                data[i].id +
                "/information?apiKey=" +
                API_KEY +
                "&includeNutrition=false"
            );

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            const responseObject = await response.json();
            data[i].url = responseObject.sourceUrl;
            data[i].score = responseObject.spoonacularScore;
            data[i].cuisines = responseObject.cuisines;
          }
        } catch (e) {
          console.log(e);
        }

        imDiv.push(
          <div>
            <ControlledImage
              link={data[i].image}
              altText={"cover picture of " + data[i].title}
              malLink={data[i].url}
            />
            <br></br>
            <ControlledTitle title={data[i].title} />
            <button
              className="add-button"
              onClick={() => {
                if (data[i] !== undefined) {
                  const ref = data[i];
                  try {
                    const recipeBlock: RecipeData = {
                      id: parseInt(ref.id),
                      title: ref.title,
                      thumbnail: ref.image,
                      url: ref.url,
                      cuisines: ref.cuisines,
                      score: ref.score,
                    };
                    addToAcc(recipeBlock);
                  } catch (error) {
                    console.log(error);
                  }
                }
              }}
            >
              Add to Your Recipe Collection
            </button>
          </div>
        );
      }
    }
    setItems(imDiv);
  } else {
    let notFoundDiv = [];
    notFoundDiv.push(
      <div className="alert">
        <p>No matching recipes! Check your spelling or widen your search.</p>
      </div>
    );
    setItems(notFoundDiv);
  }
}

export default function SearchPage() {
  //Hooks are created in order to update search term, image links, titles, etc.
  const [value, setValue] = useState("");
  const [cuisine, setCuisine] = useState<string>("");
  const [restriction, setRestriction] = useState<string>("");
  // const [data, setData] = useState<any[]>([])
  const [itemList, setItemList] = useState<any[]>([]);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [fbUser, setFBUser] = useState<UserData>();
  useEffect(() => {
    authRefHelper(setGoogleUser, setFBUser);
  }, []);

  /**
   * defines lambda function addToAcc, which adds in an recipeblock to an account
   */
  const devRef = firebase.firestore().collection("user_accounts");
  const addToAccount = (recipeBlock: RecipeData) => {
    console.log("Adding to account:", recipeBlock);
    devRef
      .doc(googleUser?.uid)
      .get()
      .then((doc) => {
        const datablock = doc.data();
        console.log(datablock);
        if (datablock !== undefined) {
          if (datablock.recipe_list !== undefined) {
            console.log("recipe list exists: adding to recipe list");
            if (recipeBlock !== undefined) {
              devRef.doc(googleUser?.uid).update({
                recipe_list:
                  firebase.firestore.FieldValue.arrayUnion(recipeBlock),
              });
            } else {
              console.error("recipeBlock is undefined");
              // Handle the case where recipeBlock is undefined
            }
          } else {
            console.log("adding to recipe list");
            devRef.doc(googleUser?.uid).update({
              recipe_list: [recipeBlock],
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching document:", error);
      });
  };

  // This use effect function updates on the search term and displays new search results as necessary
  function handleSubmit(value: string) {
    // setData([])
    setItemList([]);
    const getInfo = () => {
      console.log(cuisine);
      console.log(
        "https://api.spoonacular.com/recipes/complexSearch?apiKey=" +
          API_KEY +
          "&query=" +
          value +
          "&cuisine=" +
          cuisine +
          "&diet=" +
          restriction +
          "&number=10"
      );

      fetch(
        "https://api.spoonacular.com/recipes/complexSearch?apiKey=" +
          API_KEY +
          "&query=" +
          value +
          "&cuisine=" +
          cuisine +
          "&diet=" +
          restriction +
          "&number=10"
      )
        .then((r) => r.json())
        .then((jr) => {
          var newData: any[] = [];
          for (let i = 0; i < 10; i++) {
            newData.push(jr.results[i]);
          }
          return newData;
        })
        .then((dataBlock) => {
          CreateSearchResults(dataBlock, setItemList, addToAccount);
        });
    };
    getInfo();
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSubmit(value);
    }
  }

  return (
    <div className="searchContainer">
      <Title />
      <Navbar />
      <div className="everything-else">
        <div className="search-bar">
          <div className="search-bar-input">
            <fieldset>
              <div className="user-text">Search for recipes!</div>
              <div className="drop-downs">
                <Select
                  width={180}
                  padding={10}
                  placeholder={"Filter for cuisine"}
                  onChange={(ev) => setCuisine(ev.target.value)}
                >
                  <option>Asian</option>
                  <option>Chinese</option>
                  <option>Japanese</option>
                  <option>Korean</option>
                  <option>Italian</option>
                  <option>Mexican</option>
                  <option>European</option>
                  <option>Indian</option>
                </Select>
                <Select
                  width={180}
                  padding={10}
                  placeholder={"Filter for dietary restrictions"}
                  onChange={(ev) => setRestriction(ev.target.value)}
                >
                  <option>Vegan</option>
                  <option>Vegetarian</option>
                  <option>Pescetarian</option>
                </Select>
              </div>

              <input
                className="search-input-box"
                value={value}
                placeholder="Enter something (ingredients, recipe names, etc.) to search"
                onChange={(ev) => setValue(ev.target.value)}
                aria-label={"Search box, look up some recipe recommendations"}
                onKeyPress={(e) => handleKeyPress(e)}
              ></input>
            </fieldset>
          </div>
          <div>
            <button
              onClick={() => {
                handleSubmit(value);
                setValue("");
              }}
              className="search-button"
              aria-label={"search button"}
            >
              {"Search"}
            </button>
          </div>
        </div>
        <div className="search">{itemList}</div>
      </div>
    </div>
  );
}
