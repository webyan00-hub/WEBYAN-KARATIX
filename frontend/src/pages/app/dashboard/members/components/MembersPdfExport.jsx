import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { MembersListPDF } from './MembersListPDF';

export default function MembersPdfExport({ members }) {
  return (
    <PDFDownloadLink
      document={<MembersListPDF members={members} />}
      fileName="liste_membres.pdf"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {({ loading }) => (loading ? 'Préparation...' : <><Download className="h-4 w-4" /> Télécharger</>)}
    </PDFDownloadLink>
  );
}
