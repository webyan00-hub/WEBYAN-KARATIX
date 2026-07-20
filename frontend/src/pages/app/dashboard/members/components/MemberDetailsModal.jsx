import React, { useState } from 'react';
import { X, User, Mail, ShieldAlert, FileText, Phone, Calendar, MapPin, Award, UserCheck, Trash2, Edit2, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { MemberPDF } from './MemberPDF';

export default function MemberDetailsModal({ isOpen, onClose, member, onDelete, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !member) return null;

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
      <div>
        <div className="text-xs text-gray-500 font-medium uppercase">{label}</div>
        <div className="text-sm text-gray-900 font-semibold">{value || 'Non renseigné'}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Détails du Membre</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-6 h-6 text-gray-400" /></button>
        </div>

        <div className="flex items-center gap-6 mb-8 p-4 bg-blue-50 rounded-2xl">
          <img 
            src={member.photo_url ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo_url}` : '/placeholder.png'} 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            alt={`${member.first_name} ${member.last_name}`}
          />
          <div>
            <h3 className="text-xl font-bold">{member.last_name.toUpperCase()} {member.first_name}</h3>
            <div className="flex gap-2 items-center mt-1">
              <p className="text-sm text-gray-600">Grade : {member.grade}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                member.member_status === 'active' ? 'bg-green-100 text-green-700' :
                member.member_status === 'suspended_sick' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {member.member_status === 'active' ? 'Actif' :
                 member.member_status === 'suspended_sick' ? 'Malade' : 'Vacances'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4 mb-8">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl w-full">
              <span className="text-sm font-bold text-red-700 flex-1">Confirmer la suppression ?</span>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-sm text-gray-600 hover:underline">Annuler</button>
              <button onClick={() => { onDelete(member.id); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">Confirmer</button>
            </div>
          ) : (
            <div className="flex gap-4 w-full">
              <button onClick={() => { onEdit(member); onClose(); }} className="flex items-center justify-center gap-2 flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition">
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
              <PDFDownloadLink document={<MemberPDF member={member} />} fileName={`${member.last_name}_${member.first_name}.pdf`} className="flex items-center justify-center gap-2 flex-1 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold transition">
                {({ loading }) => (loading ? 'Préparation...' : <><Download className="w-4 h-4" /> PDF</>)}
              </PDFDownloadLink>
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center justify-center gap-2 flex-1 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition">
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={Calendar} label="Date de naissance" value={member.birth_date} />
          <DetailItem icon={UserCheck} label="Sexe" value={member.gender === 'M' ? 'Masculin' : 'Féminin'} />
          <DetailItem icon={Phone} label="Téléphone" value={member.phone} />
          <DetailItem icon={Mail} label="Email" value={member.email} />
          <DetailItem icon={MapPin} label="Adresse" value={member.address} />
        </div>

        <h4 className="font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" /> Contact d'urgence</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={User} label="Nom" value={member.emergency_name} />
          <DetailItem icon={Phone} label="Téléphone" value={member.emergency_phone} />
          <DetailItem icon={Award} label="Relation" value={member.emergency_relationship} />
        </div>

        <h4 className="font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-500" /> Notes médicales</h4>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl text-sm">
            <span className="font-bold text-gray-700">Allergies:</span> {member.allergies || 'Aucune'}
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-sm">
            <span className="font-bold text-gray-700">Blessures:</span> {member.injuries || 'Aucune'}
          </div>
        </div>
      </div>
    </div>
  );
}
