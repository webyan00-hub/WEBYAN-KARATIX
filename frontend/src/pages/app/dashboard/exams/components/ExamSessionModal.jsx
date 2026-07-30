import React, { useState } from 'react';
import { X, Calendar, UserCheck, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { examsService } from '../services/examsService';

export default function ExamSessionModal({ isOpen, onClose, onSave, clubId }) {
  const [formData, setFormData] = useState({
    name: '',
    exam_date: new Date().toISOString().split('T')[0],
    examiner_name: ''
  });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { ...formData, club_id: clubId };
    try {
      await examsService.createSession(dataToSave);
      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error("Erreur lors de la création de la session:", err);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-sm";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Nouvelle Session</h2>
                    <p className="text-slate-500 font-bold text-sm mt-1">Configurez une nouvelle session d'examen.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 space-y-6 overflow-y-auto">
              <div>
                <label className={labelClass}>Nom de la session</label>
                <div className="relative">
                    <Tag className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input name="name" required onChange={handleChange} className={inputClass + " pl-12"} placeholder="ex: Passage de grade Juillet 2026" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Date de l'examen</label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input name="exam_date" type="date" required onChange={handleChange} value={formData.exam_date} className={inputClass + " pl-12"} />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Examinateur</label>
                <div className="relative">
                    <UserCheck className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input name="examiner_name" required onChange={handleChange} className={inputClass + " pl-12"} placeholder="ex: Sensei Jean Dupont" />
                </div>
              </div>
              
              <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all mt-4">
                Créer la session
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
