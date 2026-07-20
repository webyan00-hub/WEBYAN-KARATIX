export const generateReceipt = (payment, club, settings) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Formatage période (ex: YYYY-MM -> Month)
  const [year, monthIndex] = payment.billing_period.split('-');
  const monthName = months[parseInt(monthIndex) - 1] || payment.billing_period;

  const receiptHTML = `
    <div style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #eee;">
      <header style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 24px; color: #333;">${club?.name || 'Club Sportif'}</h1>
      </header>

      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 10px;">Reçu de Paiement</h2>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr><td style="padding: 10px 0;"><strong>Membre:</strong></td><td style="padding: 10px 0;">${payment.member_name.toUpperCase()}</td></tr>
          <tr><td style="padding: 10px 0;"><strong>Montant:</strong></td><td style="padding: 10px 0;">${payment.amount} ${settings?.currency || 'EUR'}</td></tr>
          <tr><td style="padding: 10px 0;"><strong>Date:</strong></td><td style="padding: 10px 0;">${new Date(payment.payment_date).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 10px 0;"><strong>Période:</strong></td><td style="padding: 10px 0;">${monthName} ${year}</td></tr>
          <tr><td style="padding: 10px 0;"><strong>Méthode:</strong></td><td style="padding: 10px 0;">${payment.payment_method}</td></tr>
        </table>
      </div>

      <div style="margin-top: 40px; text-align: right;">
        <p style="margin-bottom: 60px;">Signature du responsable:</p>
        <div style="border-top: 1px solid #333; width: 200px; display: inline-block;"></div>
      </div>

      <footer style="margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 18px;">KARATIX</strong>
          <p style="font-size: 12px; color: #777; margin: 0;">Optimisez la gestion de votre club avec Karatix. Simplicité, performance, succès.</p>
        </div>
      </footer>
    </div>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.print();
};
