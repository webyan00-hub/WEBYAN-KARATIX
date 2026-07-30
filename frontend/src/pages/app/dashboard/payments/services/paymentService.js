export const paymentService = {
  async createPaymentSession(amount, clubId, reference) {
    const url = 'https://gdfzgwkdsgbqcdnvziku.supabase.co/functions/v1/dynamic-task';
    
    // Appel sans header Authorization, puisque la fonction est maintenant publique
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        club_id: clubId,
        reference: reference,
        clientName: "Club KARATIX",
        description: "Abonnement mensuel"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur serveur:", response.status, errorData);
      throw new Error("Erreur serveur: " + response.status);
    }
    
    return await response.json();
  }
};
