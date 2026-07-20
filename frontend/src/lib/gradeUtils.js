export const GRADE_COLORS = {
  'Blanche': 'bg-slate-100 text-slate-800',
  'Jaune': 'bg-yellow-200 text-yellow-900',
  'Orange': 'bg-orange-300 text-orange-950',
  'Verte': 'bg-green-400 text-green-950',
  'Bleue': 'bg-blue-500 text-white',
  'Marron': 'bg-amber-800 text-white',
  'Noire': 'bg-slate-900 text-white',
};

export const getGradeColor = (grade) => {
  return GRADE_COLORS[grade] || 'bg-slate-100 text-slate-800';
};
