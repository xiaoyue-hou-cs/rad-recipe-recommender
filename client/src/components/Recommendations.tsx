import { UserData } from "../interfaces/MultifactedUser";
import firebase from "../firebase/Firebase";
import { useEffect, useState } from "react";
import "../styles/Recommendations.css";

const counter = (array: string[]) => {
  var count: any = {};
  array.forEach((val) => (count[val] = (count[val] ?? 0) + 1));
  return count;
};

const dictCounter = (array: string[]) => {
  var count = new Map<string, number>();
  array.forEach((val) => count.set(val, (count.get(val) ?? 0) + 1));
  return count;
};

function Recommendations(userObject: any) {
  const [recommendList, setRecommendList] = useState<any[]>([]);
  useEffect(() => {
    if (user !== undefined && user !== null) {
      console.log("loading");
      loadRecommendations();
    }
  }, [userObject.userObject]);

  let user: UserData = userObject.userObject;
  if (user === undefined || user === null) {
    return <div>User Not Loaded! Try Again</div>;
  } else if (!user.id || !user.friend_list) {
    return <div>Add Some Friends Before Using Recommender!</div>;
  }

  var devRef = firebase.firestore().collection("user_accounts");
  const loadRecommendations = () => {
    const friendSet = new Set(user.friend_list);
    // Gets all docs
    devRef
      .get()
      .then((items) => {
        return items.docs.map((doc) => doc.data());
      })
      // Returns all friends
      .then((allItems) => allItems.filter(({ id }) => friendSet.has(id)))
      // Returns all friend's recipe lists
      .then((friendObjects) =>
        friendObjects.map(function (doc) {
          return doc.recipe_list;
        })
      )
      .then((friendLists) => {
        // Generates a count of how many times each cuisine appear in each person's list.
        let cuisineCountsCounter = friendLists.map(function (doc) {
          return counter(
            doc
              .map(function (inner: any) {
                if (inner.cuisines !== "") {
                  console.log(inner.cuisines);
                  return inner.cuisines;
                }
              })
              .flat(2)
          );
        });

        // Filter out the key-value pair with an empty string key
        // cuisineCountsCounter = Object.fromEntries(
        //   Object.entries(cuisineCountsCounter).filter(
        //     ([key, value]) => key !== ""
        //   )
        // );
        console.log(cuisineCountsCounter);
        // Compiles them into the max cuisine for each person
        const argMax = cuisineCountsCounter.map(function (cuisineCounts) {
          return Object.entries(cuisineCounts).reduce((a: any, b: any) =>
            a[1] > b[1] ? a : b
          )[0];
        });
        console.log(argMax);
        // Compiles them into the max cuisine amongst all friends
        const topCuisine = Object.entries(counter(argMax)).reduce(
          (a: any, b: any) => (a[1] > b[1] ? a : b)
        )[0];
        console.log(topCuisine);
        // Filters user lists to only derive shows of the top cuisine
        const friendsOnlyTopCuisine = friendLists.map(function (doc) {
          return doc.filter(function (recipe: any) {
            return recipe.cuisines.includes(topCuisine);
          });
        });
        // console.log(friendsOnlyTopCuosine)
        // Removes the overlap between the user and their friends' watched shows
        const flatten = friendsOnlyTopCuisine.flat();
        const userRecipeTitles = user.recipe_list.map(function (recipe) {
          return recipe.title;
        });
        const arrayDifference = flatten.filter(
          (x) => !userRecipeTitles.includes(x.title)
        );
        // console.log(arrayDifference)
        // Filters out repeated recipe in the list, recording how many times they occurred among friends
        const arrayDifferenceCounter = dictCounter(
          arrayDifference.map(function (recipe) {
            return recipe.title;
          })
        );
        const uniqueNames: any[] = [];
        const uniqueRecommendations = arrayDifference.filter(function (recipe) {
          if (uniqueNames.includes(recipe.title)) {
            return false;
          } else {
            uniqueNames.push(recipe.title);
            return true;
          }
        });
        // Comparator for ranking. As a reminder, b - a implies b > a.
        const mu = 20000; // average ratings required
        const sigmoid = (score: number) => {
          return 1 / (1 + Math.exp(-(score - mu) / 5000));
        };

        function rankingComparator(a: any, b: any) {
          const aVal =
            sigmoid(a.score) * (arrayDifferenceCounter.get(a.title) ?? 1);
          const bVal =
            sigmoid(b.score) * (arrayDifferenceCounter.get(b.title) ?? 1);
          return bVal - aVal;
        }
        const orderedRecommendations =
          uniqueRecommendations.sort(rankingComparator);

        const reccDiv = [];
        for (let i = 0; i < orderedRecommendations.length; i++) {
          reccDiv.push(
            <div key={i}>
              <img
                src={orderedRecommendations[i].thumbnail}
                alt={"cover picture of " + orderedRecommendations[i].title}
                onClick={() => {
                  window.open(orderedRecommendations[i].url);
                }}
              />
              <br></br>
              <div className="recipe-title" aria-label="recipe title">
                {orderedRecommendations[i].title}
              </div>
              <button
                onClick={() => {
                  devRef.doc(user.id).update({
                    recipe_list: firebase.firestore.FieldValue.arrayUnion(
                      orderedRecommendations[i]
                    ),
                  });
                }}
              >
                {" "}
                Add To List{" "}
              </button>
            </div>
          );
        }
        setRecommendList(reccDiv.slice(0, 6));
      });
  };

  return (
    <div className="recommended" aria-label="recommended">
      {recommendList}
    </div>
  );
}

export default Recommendations;
