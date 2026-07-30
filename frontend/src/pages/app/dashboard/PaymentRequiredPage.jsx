import React from 'react';

export default function PaymentRequiredPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-extrabold text-red-600 mb-4">Abonnement Suspendu</h1>
      <p className="text-lg text-slate-700 mb-8">Votre accès aux fonctionnalités est restreint car votre abonnement n'est pas à jour.</p>
      <div className="bg-slate-100 p-6 rounded-2xl">
        <p className="font-bold">Veuillez contacter l'administration pour régulariser votre situation.</p>
      </div>
    </div>
  );
}
