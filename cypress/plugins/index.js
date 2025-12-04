require('dotenv').config();

module.exports = (on, config) => {
    // ... existing code if any
  
    // set environment variables here using dotenv
    config.env.mary_password = process.env.MARY_PASSWORD;
  
    return config;
  };
  