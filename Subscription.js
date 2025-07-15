import React from 'react';

function Subscription() {
  const handlePayment = () => {
    // Lógica de integración con Stripe aquí
  };

  return (
    <div>
      <h2>Suscripción</h2>
      <button onClick={handlePayment}>Pagar con Stripe</button>
    </div>
  );
}

export default Subscription; 