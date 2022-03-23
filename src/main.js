/* eslint-disable no-else-return */
/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
import { FetchWrapper } from './fetch-wrapper';
import snackbar from 'snackbar';
import 'snackbar/dist/snackbar.css';
import Chart from 'chart.js/auto';

const ctx = document.getElementById('myChart').getContext('2d');
const foodname = document.querySelector('#foodname');
const cardsOutput = document.querySelector('.cards');
const carbs = document.querySelector('#carbs');
const protein = document.querySelector('#protein');
const fat = document.querySelector('#fat');
const add = document.querySelector('#add');
const totalOutput = document.querySelector('#totalCal');
// const variation = document.querySelector('#variation');

const API = new FetchWrapper(
  'https://firestore.googleapis.com/v1/projects/programmingjs-90a13/databases/(default)/documents/'
);

function thisChart() {
  // Creates the chart
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Carbs', 'Protein', 'Fat'],
      datasets: [
        {
          label: 'Macronutrients',
          data: [0, 0, 0],
          backgroundColor: [
            'rgb(95, 158, 160',
            'rgb(127, 29, 151)',
            'rgb(155, 40, 67)',
          ],
          borderColor: ['rgba(0, 0, 0, 0.6)'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Does all the heavy lifting
  const createFood = data => {
    const cards = data?.documents
      ?.map(card => {
        let carbsTotal;
        let proteinTotal;
        let fatTotal;
        // Gives total calories, cumulative with API
        const total =
          card.fields.carbs.integerValue * 4 +
          card.fields.protein.integerValue * 4 +
          card.fields.fat.integerValue * 9;
        const allTotal = total + Number(totalOutput.textContent);
        totalOutput.textContent = allTotal;

        // Updates chart with total values
        carbsTotal =
          Number(card.fields.carbs.integerValue) +
          myChart.data.datasets[0].data[0];
        proteinTotal =
          Number(card.fields.protein.integerValue) +
          myChart.data.datasets[0].data[1];
        fatTotal =
          Number(card.fields.fat.integerValue) +
          myChart.data.datasets[0].data[2];
        myChart.data.datasets[0].data = [];
        myChart.data.datasets[0].data.push(carbsTotal, proteinTotal, fatTotal);
        myChart.update();

        // Creates the food cards with right values
        return ` <div class="card">
      <h3 class="card__heading">${card.fields.foodname.stringValue}</h3>
      <p> ${total} kcal</p> 
      <ul class="card__list">
        <div class="card__items">
          <li class="card__item">Carbs</li>
          <p>${card.fields.carbs.integerValue} g</p>
        </div>
        <div class="card__items">
          <li class="card__item">Protein</li>
          <p>${card.fields.protein.integerValue} g</p>
        </div>
        <div class="card__items">
          <li class="card__item">Fat</li>
          <p>${card.fields.fat.integerValue} g</p>
        </div>
      </ul>
    </div>`;
      })
      .join('');

    // Checking if data is present, if the cloud is empty it will ask for an item, otherwise it will present the data.
    if (cards === undefined) {
      cardsOutput.innerHTML = '';
      snackbar.show(`I'm hungry 🤤, give me something to eat 🍎`);
    } else {
      cardsOutput.innerHTML = cards;
      snackbar.show('Here is your data');
    }
  };

  // POSTs food to the API
  async function postFood() {
    const body = {
      fields: {
        fat: {
          integerValue: fat.value,
        },
        protein: {
          integerValue: protein.value,
        },
        carbs: {
          integerValue: carbs.value,
        },
        foodname: {
          stringValue: foodname.value,
        },
      },
    };
    API.post(`bestFoodApp15`, body);
  }

  // Resets the fields
  const resetFields = () => {
    carbs.value = '';
    protein.value = '';
    fat.value = '';
  };

  // Just to trigger await
  async function business() {
    await postFood();

    await API.get(`bestFoodApp15`)
      .then(data => {
        createFood(data);
      })
      .catch(err => console.log('Something went wrong', err));
  }

  // Page reload
  function reload() {
    window.location.reload();
  }

  // When button is clicked adds food item to cloud and then presents it on the page
  add.addEventListener('click', e => {
    e.preventDefault();

    // Checks for the fields to be filled correctly
    if (foodname.value === 'Select Food') {
      return alert('Please select food type');
    } else if (carbs.value === '' || protein.value === '' || fat.value === '') {
      return alert('Please check your values');
    }
    snackbar.show('⚙️ Calculating ⚙️');

    business();
    resetFields();

    setTimeout(reload, 2000);
  });

  // Executes on page load, fetches items with API and presents them
  API.get(`bestFoodApp15`)
    .then(data => {
      createFood(data);
    })
    .catch(err => console.log('Something went wrong', err));
}
// Creates the chart on page load and runs createFood once
thisChart();
