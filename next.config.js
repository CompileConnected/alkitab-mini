const withOffline = require('next-pwa');

module.exports = withPWA({
  pwa: {
    dest: 'public'
  }
})
