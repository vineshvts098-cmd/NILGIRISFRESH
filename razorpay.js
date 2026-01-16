// Razorpay Checkout script loader
(function() {
  if (window.Razorpay) return;
  var script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
})();
