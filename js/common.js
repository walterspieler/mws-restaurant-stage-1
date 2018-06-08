/* Service Worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function(registration) {
        console.log('Service worker registered');
      })
      .catch(function(err) {
        console.log(err);
      });
  });
}
