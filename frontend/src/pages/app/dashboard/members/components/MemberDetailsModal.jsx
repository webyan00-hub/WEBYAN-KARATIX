import React, { useState } from 'react';
import { X, User, Mail, ShieldAlert, FileText, Phone, Calendar, MapPin, Award, Trash2, Edit2, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { MemberPDF } from './MemberPDF';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemberDetailsModal({ isOpen, onClose, member, onDelete, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !member) return null;

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
        <Icon className="w-5 h-5 text-action" />
      </div>
      <div>
        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{label}</div>
        <div className="text-sm text-text-main font-semibold mt-0.5">{value || 'Non renseigné'}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="bg-white rounded-3xl w-full max-w-[800px] shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img 
              src={member.photo_url ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo_url}` : '/placeholder.png'} 
              className="w-20 h-20 rounded-2xl object-cover shadow-sm"
              alt={`${member.first_name} ${member.last_name}`}
            />
            <div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tighter">
                {member.last_name.toUpperCase()} {member.first_name}
              </h2>
              <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-widest">ID: {member.member_number} • Grade: {member.grade}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto space-y-8">
            {/* Actions */}
            <div className="flex gap-4">
                {showDeleteConfirm ? (
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl w-full border border-red-100">
                        <span className="text-sm font-bold text-red-700">Confirmer la suppression ?</span>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="text-sm text-red-600/70 hover:underline">Annuler</button>
                            <button onClick={() => { onDelete(member.id); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">Supprimer</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button onClick={() => { onEdit(member); onClose(); }} className="flex items-center justify-center gap-2 flex-1 p-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-sm transition">
                            <Edit2 size={16} /> Modifier
                        </button>
                        <PDFDownloadLink document={<MemberPDF member={member} />} fileName={`${member.last_name}_${member.first_name}.pdf`} className="flex items-center justify-center gap-2 flex-1 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-blue-200">
                            {({ loading }) => (loading ? '...' : <><Download size={16} /> Exporter PDF</>)}
                        </PDFDownloadLink>
                        <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center justify-center gap-2 flex-1 p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-black text-sm transition">
                            <Trash2 size={16} /> Supprimer
                        </button>
                    </>
                )}
            </div>

            {/* Détails */}
            <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={Calendar} label="Date de naissance" value={member.birth_date} />
                <DetailItem icon={User} label="Sexe" value={member.gender === 'male' ? 'Masculin' : 'Féminin'} />
                <DetailItem icon={Phone} label="Téléphone" value={member.phone} />
                <DetailItem icon={Mail} label="Email" value={member.email} />
                <DetailItem icon={MapPin} label="Adresse" value={member.address} />
            </div>

            {/* Urgence */}
            <div className="space-y-4">
                <h4 className="font-black text-slate-950 flex items-center gap-2 text-sm tracking-tighter"><ShieldAlert size={18} className="text-red-500" /> Contact d'urgence</h4>
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={User} label="Nom" value={member.emergency_name} />
                    <DetailItem icon={Phone} label="Téléphone" value={member.emergency_phone} />
                    <DetailItem icon={Award} label="Relation" value={member.emergency_relationship} />
                </div>
            </div>

            {/* Médical */}
            <div className="space-y-4">
                <h4 className="font-black text-slate-950 flex items-center gap-2 text-sm tracking-tighter"><FileText size={18} className="text-blue-600" /> Notes médicales & Coach</h4>
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl text-sm">
                        <span className="font-black text-slate-950 block mb-1">Allergies:</span> <span className="font-bold text-slate-600">{member.allergies || 'Aucune'}</span>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl text-sm">
                        <span className="font-black text-slate-950 block mb-1">Blessures:</span> <span className="font-bold text-slate-600">{member.injuries || 'Aucune'}</span>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
