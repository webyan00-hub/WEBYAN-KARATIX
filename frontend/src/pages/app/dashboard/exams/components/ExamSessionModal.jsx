import React, { useState } from 'react';
import { X } from 'lucide-react';
import { examsService } from '../services/examsService';

export default function ExamSessionModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    exam_date: new Date().toISOString().split('T')[0],
    examiner_name: ''
  });

  if (!isOpen) return null;

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await examsService.createSession(formData);
      onSave();
      onClose();
    } catch (err) {
      console.error("Erreur lors de la création de la session:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">Nouvelle Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-6 h-6 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la session</label>
            <input name="name" required onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="ex: Passage de grade Juillet 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input name="exam_date" type="date" required onChange={handleChange} value={formData.exam_date} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examinateur</label>
            <input name="examiner_name" required onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="ex: Sensei Jean Dupont" />
          </div>
          <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition mt-4">
            Créer la session
          </button>
        </form>
      </div>
    </div>
  );
}
