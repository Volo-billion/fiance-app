const express = require('express');
const router = express.Router();

// POST /signup
router.post('/signup', (req, res) => {
  // Lógica de registro aquí
  res.send('Signup endpoint');
});

// POST /login
router.post('/login', (req, res) => {
  // Lógica de login aquí
  res.send('Login endpoint');
});

module.exports = router; 