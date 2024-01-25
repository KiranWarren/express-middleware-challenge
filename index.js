const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const baseURL = "https://pokeapi.co/api/v2/pokemon/";

// Middleware function, check if valid response is received from the API
// Return json if valid response, return error if invalid API response
const isPokemonValid = async (request, response, next) => {
  // Retrieve response from API
  await fetch(baseURL + request.body.pokemonName).then(async (data) => {
    // Convert data from API to string and store in variable
    let dataText = await data.text();
    // Check if the data string is an error from the API. Return an error if so, otherwise return the response
    if (dataText == "Not Found") {
      next(new Error("Pokemon not found."));
    } else {
      request.body.pokeApiResult = JSON.parse(dataText);
      next();
    }
  });
};

// Middleware function, handles a possible error from the previous middleware
const handleInvalid = (error, request, response, next) => {
  if (error) {
    console.log(error.message);
    response.status(400).json({
      error: error.message,
    });
  }
};

// localhost:3000
app.post("/", isPokemonValid, handleInvalid, async (request, response) => {
  // Middleware has already retrieved the response.
  // If the code has reached this point, then the data must be valid. (I.e. handleInvalid did not trigger a response.)
  response.json({
    pokedexNumber: request.body.pokeApiResult.id,
    name: request.body.pokeApiResult.name,
  });
});

// Activate the server at port 3000
app.listen(3000, () => {
  console.log("Server running...");
});
