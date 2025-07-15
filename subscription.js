const express = require('express');
const router = express.Router();

// POST /pay
router.post('/pay', (req, res) => {
  // Lógica de integración con Stripe aquí
  res.send('Stripe payment endpoint');
});

module.exports = router; 