import React, { useEffect, useMemo, useState } from 'react';
import { X, Camera, Loader2, User, Phone, ShieldAlert, FileText } from 'lucide-react';

const defaultMember = () => ({
  first_name: '',
  last_name: '',
  birth_date: '',
  gender: 'male',
  grade: 'Blanche',
  member_status: 'active',
  entry_date: new Date().toISOString().split('T')[0],
  phone: '',
  email: '',
  address: '',
  emergency_name: '',
  emergency_phone: '',
  emergency_relationship: '',
  allergies: '',
  injuries: '',
  medical_notes: '',
  photo: null,
});

export default function MemberModal({ isOpen, onClose, onSave, initialData = null, isSaving = false }) {
  const [formData, setFormData] = useState(defaultMember);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      ...defaultMember(),
      ...initialData,
      photo: null,
      member_status: initialData?.member_status || 'active',
    });
    setPhotoPreview('');
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!(formData.photo instanceof File)) return undefined;

    const objectUrl = URL.createObjectURL(formData.photo);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.photo]);

  const existingPhotoUrl = useMemo(() => {
    if (!initialData?.photo_url) return '';
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${initialData.photo_url}`;
  }, [initialData?.photo_url]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((current) => ({ ...current, photo: file }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50';
  const textareaClass = 'min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50';
  const labelClass = 'mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500';

  return (
    <div className="fixed inset-0 z-[10050] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <form onSubmit={handleSubmit} className="flex h-[calc(100dvh-0.75rem)] w-full flex-col overflow-hidden rounded-t-[28px] bg-slate-50 shadow-2xl ring-1 ring-white/40 sm:h-auto sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-[28px]">
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-4 pb-4 pt-3 sm:px-6 sm:pt-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />
          <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">Membre</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{initialData ? 'Modifier le membre' : 'Nouveau membre'}</h2>
            <p className="mt-1 text-xs font-bold text-slate-400">Remplissez les infos utiles, puis enregistrez.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="grid gap-5">
            <section className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-[96px_1fr]">
              <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                {photoPreview || existingPhotoUrl ? (
                  <img src={photoPreview || existingPhotoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-slate-400" />
                )}
                <input type="file" accept="image/jpeg,image/png,image/gif" onChange={handleFileChange} className="absolute inset-0 opacity-0" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Nom</label>
                  <input name="last_name" value={formData.last_name || ''} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Prénom</label>
                  <input name="first_name" value={formData.first_name || ''} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Date d'entrée</label>
                  <input type="date" name="entry_date" value={formData.entry_date || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Naissance</label>
                  <input type="date" name="birth_date" value={formData.birth_date || ''} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
                <User className="h-4 w-4 text-blue-600" /> Profil sportif
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Sexe</label>
                  <select name="gender" value={formData.gender || 'male'} onChange={handleChange} className={inputClass}>
                    <option value="male">Masculin</option>
                    <option value="female">Féminin</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Grade</label>
                  <select name="grade" value={formData.grade || 'Blanche'} onChange={handleChange} className={inputClass}>
                    {['Blanche', 'Jaune', 'Orange', 'Verte', 'Bleue', 'Marron', 'Noire'].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Statut</label>
                  <select name="member_status" value={formData.member_status || 'active'} onChange={handleChange} className={inputClass}>
                    <option value="active">Actif</option>
                    <option value="suspended_sick">Malade</option>
                    <option value="suspended_vacation">Vacances</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
                <Phone className="h-4 w-4 text-blue-600" /> Contact
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Adresse</label>
                  <textarea name="address" value={formData.address || ''} onChange={handleChange} className={textareaClass} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
                <ShieldAlert className="h-4 w-4 text-red-500" /> Contact d'urgence
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Nom</label>
                  <input name="emergency_name" value={formData.emergency_name || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input name="emergency_phone" value={formData.emergency_phone || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Relation</label>
                  <input name="emergency_relationship" value={formData.emergency_relationship || ''} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
                <FileText className="h-4 w-4 text-blue-600" /> Santé
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Allergies</label>
                  <textarea name="allergies" value={formData.allergies || ''} onChange={handleChange} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>Blessures</label>
                  <textarea name="injuries" value={formData.injuries || ''} onChange={handleChange} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>Notes médicales</label>
                  <textarea name="medical_notes" value={formData.medical_notes || ''} onChange={handleChange} className={textareaClass} />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} disabled={isSaving} className="h-12 rounded-2xl bg-slate-100 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-200 disabled:opacity-50">
            Annuler
          </button>
          <button type="submit" disabled={isSaving} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          </div>
        </div>
      </form>
    </div>
  );
}
