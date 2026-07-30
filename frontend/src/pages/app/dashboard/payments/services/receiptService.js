export const generateReceipt = (payment, club, settings) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Formatage des périodes multiples (si jointe par des virgules)
  const formatPeriod = (periodStr) => {
    return periodStr.split(', ').map(p => {
        const [year, monthIndex] = p.trim().split('-');
        return `${months[parseInt(monthIndex) - 1] || p} ${year}`;
    }).join(', ');
  };

  const receiptHTML = `
    <div style="font-family: 'Inter', sans-serif; padding: 50px; max-width: 650px; margin: auto; color: #0f172a; background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;">
      <header style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 50px;">
        <div>
          <h1 style="font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.05em;">${club?.name || 'Club Sportif'}</h1>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Reçu officiel de paiement</p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #2563eb;">REÇU</h2>
          <p style="font-size: 12px; color: #94a3b8; font-weight: 600; margin: 4px 0 0;">N° ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </header>

      <div style="margin-bottom: 50px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #64748b; font-size: 14px; font-weight: 600;">Membre</span>
                <span style="font-weight: 800; font-size: 16px;">${payment.member_name.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #64748b; font-size: 14px; font-weight: 600;">Période</span>
                <span style="font-weight: 800; font-size: 16px;">${formatPeriod(payment.billing_period)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b; font-size: 14px; font-weight: 600;">Date</span>
                <span style="font-weight: 800; font-size: 16px;">${new Date(payment.payment_date).toLocaleDateString('fr-FR')}</span>
            </div>
        </div>
      </div>

      <div style="margin-bottom: 60px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0;">
              <th style="text-align: left; padding: 15px 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase;">Description</th>
              <th style="text-align: right; padding: 15px 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 20px 0; font-weight: 600; font-size: 16px;">Cotisation Membre - ${payment.payment_method}</td>
              <td style="padding: 20px 0; text-align: right; font-weight: 800; font-size: 18px; color: #2563eb;">${payment.amount} ${settings?.currency || 'EUR'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 30px;">
        <div style="text-align: center;">
            <div style="border-bottom: 1px solid #cbd5e1; width: 160px; height: 40px; margin-bottom: 10px;"></div>
            <p style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Signature</p>
        </div>
        <div style="text-align: right;">
            <strong style="font-size: 20px; font-weight: 900; letter-spacing: -0.02em;">TOTAL : ${payment.amount} ${settings?.currency || 'EUR'}</strong>
        </div>
      </div>

      <footer style="margin-top: 60px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="font-size: 11px; color: #94a3b8; font-weight: 600;">Généré par KARATIX • Système de gestion club</p>
      </footer>
    </div>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.print();
};
