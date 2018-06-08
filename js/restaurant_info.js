import './common';
import { DBHelper } from './dbhelper';

let restaurant;
var map;

const dBHelper = new DBHelper();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL()
    .then(restaurant => {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      dBHelper.mapMarkerForRestaurant(restaurant, self.map);
    })
    .catch(err => console.log(err));
};

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = () => {
  console.log('test');
  return new Promise((resolve, reject) => {
    const id = getParameterByName('id');
    if (!id) {
      // no id found in URL
      error = 'No restaurant id in URL';
      callback(error, null);
    } else {
      dBHelper.fetchRestaurantById(id, async (error, restaurant) => {
        self.restaurant = restaurant;
        if (!restaurant) {
          reject(error);
        }
        await fillRestaurantHTML(restaurant);
        resolve(restaurant);
      });
    }
  });
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = restaurant => {
  if (!restaurant) return;
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = `${restaurant.name} preview picture`;
  image.src = dBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  //Favourite or not ??
  if (restaurant.is_favorite) {
    document.getElementById('favToggle').checked = true;
  }
  // fill reviews
  getReviewsByRestaurant(restaurant.id).then(reviews => {
    fillReviewsHTML(reviews);
  });
};

const getReviewsByRestaurant = id => {
  return new Promise((res, rej) => {
    fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(reviews => res(reviews.json()))
      .catch(error => {
        console.error('Error:', error);
        rej(error);
      });
  });
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement('li');

  const tcontainer = document.createElement('div');
  tcontainer.className = 'title-container';
  const name = document.createElement('p');
  name.innerHTML = review.name;
  tcontainer.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toDateString();
  tcontainer.appendChild(date);

  li.appendChild(tcontainer);

  const rating = document.createElement('p');
  rating.className = 'rating';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'comments';
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

document.querySelector('#form-reviews').addEventListener('submit', e => {
  e.preventDefault(); //stop form from submitting
  const form = document.getElementById('form-reviews');
  let invalid = false;
  form.elements['submit'].disabled = true;
  form.elements['submit'].value = 'Ajout du commentaire en cours';
  Array.from(document.querySelectorAll('#register input:required')).forEach(
    field => {
      field.className = 'required_empty';
      invalid = true;
    }
  );
  if (invalid) {
    form.elements['submit'].disabled = false;
    form.elements['submit'].value = 'Rate!';
    return;
  }
  fetch('http://localhost:1337/reviews/', {
    method: 'POST',
    body: JSON.stringify({
      restaurant_id: getParameterByName('id'),
      name:
        form.elements['firstname'].value +
        ' ' +
        form.elements['lastname'].value,
      rating: form.elements['rating'].value,
      comments: form.elements['review'].value
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(review => {
      const ul = document.getElementById('reviews-list');
      ul.appendChild(createReviewHTML(review));
      form.reset();
      form.elements['submit'].disabled = false;
      form.elements['submit'].value = 'Rate!';
    })
    .catch(err => console.error(err));
});

const toggleFav = e => {
  e.preventDefault();
  const button = document.getElementById('favToggle');
  const id = getParameterByName('id');
  fetch(
    `http://localhost:1337/restaurants/${id}/?is_favorite=${!button.checked}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
  )
    .then(response => response.json())
    .then(review => {
      button.checked = !button.checked;
    })
    .catch(err => console.error(err));
};
document.getElementById('favToggle').onclick = toggleFav;
