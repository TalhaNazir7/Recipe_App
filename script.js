"use strict";
const randImg = document.querySelector(".randImg");
const mealCard = document.querySelector(".meals-card");
const favMealContainer = document.querySelector(".meals");
const searchBtn = document.getElementById("search--btn");
const searchTerm = document.getElementById("search--term");
const input = document.querySelector("input");
const mealPopUp = document.getElementById("meal-popUp");

searchBtn.addEventListener("click", loadSearchedMeal);
input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    loadSearchedMeal();
  }
});

//============== Used Event delegation on fav Meal Container to show popUp for every FavMeal =======
favMealContainer.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("favMeal--img")) return;
  const mealName = e.target.closest("li").children[1].textContent;
  const mealData = await fetchMealfromName(mealName);
  showMealPopup(mealData[0]);
});

async function fetchRandomRecipe() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respMeal = await resp.json();
  const randomMeal = respMeal.meals[0];
  displayRandomMeal(randomMeal, true);
}

async function fetchMealfromId(mealId) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
  );
  const respMeal = await resp.json();
  return respMeal.meals[0];
}

async function fetchMealfromName(mealName) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`
  );
  const respMeal = await resp.json();
  return respMeal.meals;
}

async function loadSearchedMeal() {
    const searchedMeals = await fetchMealfromName(searchTerm.value);
    if(!searchedMeals) alert('No Food Recipe Found');
    if (searchedMeals && searchTerm.value) {
    mealCard.innerHTML = "";
    searchedMeals.forEach((meal) => {
      displayRandomMeal(meal);
    });
  }
  searchTerm.value = "";
}

async function getFavMealsFromLS() {
  favMealContainer.innerHTML = "";
  const mealIds = getMealfromLS();
  for (let i = 0; i < mealIds.length; i++) {
    const meal = await fetchMealfromId(mealIds[i]);
    loadFavMeal(meal);
  }
}

function getMealfromLS() {
  const data = JSON.parse(window.localStorage.getItem("MealsId"));
  return data !== null ? data : [];
}

function removeMealFromLS(mealId) {
  const mealIds = getMealfromLS();
  window.localStorage.setItem(
    "MealsId",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function addMealToLS(mealId) {
  const mealIds = getMealfromLS();
  window.localStorage.setItem("MealsId", JSON.stringify([...mealIds, mealId]));
}

//-----------  loads the fav meal section ---------

function loadFavMeal(mealData) {
  let html = `
    <li><img id="favMeal-img" class='favMeal--img' src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
    <button class ='clear'><i class="fa-regular fa-square-xmark"></i></button>
    </li>`;
  favMealContainer.insertAdjacentHTML("afterbegin", html);
  document.querySelector(".clear").addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);
    getFavMealsFromLS();
  });

  //========== Event listener of pop up for every Fav Meal ========

  // document.getElementById('favMeal-img').addEventListener('click',()=>{
  // showMealPopup(mealData);
  // })
}

function displayRandomMeal(mealData, random = false) {
  let html = `
    <div class="random-meal">
    ${random ? `<h3 class="meal-header">Random Recipe</h3>` : ""}
    <img id="randMealImg" class="randImg" src=${mealData.strMealThumb} alt="">
    <div class="meal-body">
    <span>${mealData.strMeal}</span>
    <button class="fav-btn icons">
    <i class="fa-solid fa-heart"></i>
    </button>
    </div>
    </div>
    `;
  mealCard.insertAdjacentHTML("afterbegin", html);
  document
    .querySelector(".randImg")
    .addEventListener("click", () => showMealPopup(mealData));
  document.querySelector(".fav-btn").addEventListener("click", (e) => {
    const favBtn = e.target.closest(".fav-btn");
    favBtn.classList.toggle("active");
    if (favBtn.classList.contains("active")) {
      addMealToLS(mealData.idMeal);
    } else {
      removeMealFromLS(mealData.idMeal);
    }

    getFavMealsFromLS();
  });
}

//=============== Pop Up Meals =================

function showMealPopup(mealData) {
  mealPopUp.classList.remove("hidden");
  mealPopUp.innerHTML = "";
  const html = ` <div class="mealInfo-container">
<button  id="popUp-close" class="popUp-closeBtn icons"><i class="fas fa-close"></i></button>
<h1>${mealData.strMeal}</h1>
<img class="popUp-meal-img" src="${mealData.strMealThumb}" alt="">
<p>${mealData.strInstructions}</p>
<ul>${showIngredientAndMeasure(mealData)}</ul>    
</div>`;
  mealPopUp.insertAdjacentHTML("afterbegin", html);
  const popUpCloseBtn = document.getElementById("popUp-close");
  popUpCloseBtn.addEventListener("click", () => {
    mealPopUp.classList.add("hidden");
  });
}

//=============== Shows Ingredients in Pop up =================

function showIngredientAndMeasure(mealData) {
  let html = ``;
  for (let i = 1; i <= 20; i++) {
    if (mealData[`strIngredient${i}`])
      html += `<li>${mealData[`strIngredient${i}`]}  / ${
        mealData[`strMeasure${i}`]
      }</li>`;
    else break;
  }
  return html;
}

getFavMealsFromLS();
fetchRandomRecipe();
