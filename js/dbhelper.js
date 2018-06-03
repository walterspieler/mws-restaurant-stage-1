import * as idb from 'idb';

/**
 * Common database helper functions.
 */
export class DBHelper {
  constructor() {
    this.dbPromise = idb.open('mws-restaurants', 2, upgradeDB => {
      switch (upgradeDB.oldVersion) {
        case 0:
        case 1:
        case 2:
          const store = upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
          store.createIndex('photos', 'photo');
      }
    });
  }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    http: return `http://localhost:${port}/restaurants`;
  }

  fetchRestaurantsFromIDB() {
    return this.dbPromise.then(db => {
      const tx = db.transaction('restaurants');
      const restaurantsStore = tx.objectStore('restaurants');
      return restaurantsStore.getAll();
    });
  }

  fetchRestaurantByIdFromIDB(id) {
    return this.dbPromise.then(db => {
      const tx = db.transaction('restaurants');
      const restaurantsStore = tx.objectStore('restaurants');
      return restaurantsStore.get(id);
    });
  }

  /**
   * Fetch all restaurants.
   */
  fetchRestaurants(callback) {
    console.log('Fetch restaurants');
    fetch(this.DATABASE_URL)
      .then(res => {
        console.log(res);
        return res.json();
      })
      .then(res => {
        console.log(res);
        res.map(restaurant => {
          this.dbPromise.then(db => {
            var tx = db.transaction('restaurants', 'readwrite');
            var store = tx.objectStore('restaurants');
            store.put(restaurant);
          });
        });
        callback(null, res);
      })
      .catch(err => {
        console.log(err);
        // Fetch from indexedDB if exists
        this.fetchRestaurantsFromIDB().then(restaurants => {
          callback(null, restaurants);
        });
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    this.fetchRestaurants(async (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        console.log(restaurants);
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  fetchNeighborhoods(callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        console.log(restaurants);
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  fetchCuisines(callback) {
    // Fetch all restaurants
    console.log('[fetchCuisines] fetch Restaurants');
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        console.log(restaurants);
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  imageUrlForRestaurant(restaurant) {
    console.log('[imageUrlForRestaurant]', restaurant);
    return `/build/${restaurant.photograph}.jpg`;
  }

  /**
   * Map marker for a restaurant.
   */
  mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: this.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}