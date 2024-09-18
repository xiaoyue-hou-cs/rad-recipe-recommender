# rad-recipe-recommender

A recipe recommender and social web app for food lovers!

## Project Overview

Through our rad recipe recommender, users are able to add and request friends, make search queries,
view other users' recipe lists, and get recommended recipes based on their friends' recipe lists.

Home: Home page shows the top 6 recipes recommended based on your friends' recipes on the left side and your own recipe list on the right side.

Search: The user can search for an ingredient in the search bar and filter for cuisines and dietary restrictions, and the page would return 10 recipes that fulfill the specifications. The user can add the recipes to their recipe list, and clicking on the image would lead them to the website that details the recipe.

Users: searching for a friend's ID would return their profile.

Friends: the user can send friend requests here.

## Getting Started

1. To get started, clone the repository to your own desktop.

2. Create an account at https://spoonacular.com/food-api. You would receive an API key in your profile.
   Alternatively, feel free to use the API key I provided in my Google Forms submission.

3. Copy and paste the API key into the "API key" constant in the "client/src/private/key.ts" file.

4. Run `npm install` in the `client` directory.

5. Run `npm start` in the same directory.
