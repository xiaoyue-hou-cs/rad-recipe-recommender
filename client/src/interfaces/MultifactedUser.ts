import { RecipeData } from "./MultifacetedRecipes";

export interface UserData{
    name : string,
    email : string,
    id : string,
    photoURL : string,
    recipe_list : Array<RecipeData>,
    friend_list : Array<string>,
    incoming_friends : Array<string>
}
    