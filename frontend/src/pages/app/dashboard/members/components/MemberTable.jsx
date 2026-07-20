import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import BeltBadge from './BeltBadge';
import MemberDetailsModal from './MemberDetailsModal';
import { calculateAge } from '../../../../../lib/calculateAge';

export default function MemberTable({ members, onView }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'last_name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Retour à la première page lors du tri
  };

  const sortedMembers = [...members].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'age') {
      aVal = calculateAge(a.birth_date);
      bVal = calculateAge(b.birth_date);
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculs de pagination
  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  const paginatedMembers = sortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

// Ajout d'une fonction utilitaire pour calculer le statut hybride
const getMemberStatus = (member) => {
  const isManuallyActive = member.active;
  
  if (!member.last_attendance_date) {
      // Si aucune donnée de présence, on considère comme inactif (absent depuis trop longtemps ou nouveau)
      return isManuallyActive ? { label: 'Actif', color: 'bg-green-100 text-green-700' } : { label: 'Inactif (Manuel)', color: 'bg-red-100 text-red-700' };
  }

  const lastAttendance = new Date(member.last_attendance_date);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const isRecentlyActive = lastAttendance > threeMonthsAgo;
  
  if (!isManuallyActive) return { label: 'Inactif (Manuel)', color: 'bg-red-100 text-red-700' };
  if (!isRecentlyActive) return { label: 'Inactif (Absence)', color: 'bg-amber-100 text-amber-700' };
  
  return { label: 'Actif', color: 'bg-green-100 text-green-700' };
};

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 text-gray-300 ml-1" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-600 ml-1" /> : 
      <ArrowDown className="w-4 h-4 text-blue-600 ml-1" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
      {/* Vue Mobile : Liste de Cartes */}
      <div className="md:hidden flex flex-col divide-y divide-slate-100">
        {paginatedMembers.map(member => (
          <div key={member.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 text-lg">{member.last_name.toUpperCase()} {member.first_name}</span>
              <BeltBadge grade={member.grade} />
            </div>
            <div className="flex justify-between items-center text-sm text-slate-600">
              <div className="flex flex-col">
                <span>{calculateAge(member.birth_date)} ans</span>
                <span className="text-xs text-slate-400">Entrée: {new Date(member.entry_date).toLocaleDateString()}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getMemberStatus(member).color}`}>
                {getMemberStatus(member).label}
              </span>
            </div>
            <button onClick={() => onView(member)} className="text-blue-600 font-semibold hover:text-blue-800 text-sm mt-2 self-end">Voir détails</button>
          </div>
        ))}
      </div>

      {/* Vue Desktop : Tableau Classique */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600 hidden md:table-cell" onClick={() => handleSort('member_number')}><div className="flex items-center">ID <SortIcon columnKey="member_number" /></div></th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('last_name')}><div className="flex items-center">Membre <SortIcon columnKey="last_name" /></div></th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600 hidden md:table-cell" onClick={() => handleSort('gender')}><div className="flex items-center">Sexe <SortIcon columnKey="gender" /></div></th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('age')}><div className="flex items-center">Âge <SortIcon columnKey="age" /></div></th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('grade')}><div className="flex items-center">Grade <SortIcon columnKey="grade" /></div></th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('member_status')}><div className="flex items-center">Statut <SortIcon columnKey="member_status" /></div></th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600 hidden sm:table-cell" onClick={() => handleSort('entry_date')}><div className="flex items-center">Entrée <SortIcon columnKey="entry_date" /></div></th>
              <th className="px-6 py-4 cursor-pointer hover:text-blue-600 hidden lg:table-cell" onClick={() => handleSort('birth_date')}><div className="flex items-center">Naissance <SortIcon columnKey="birth_date" /></div></th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedMembers.map(member => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-slate-500 hidden md:table-cell">{member.member_number}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{member.last_name.toUpperCase()} {member.first_name}</td>
                <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{member.gender === 'male' ? 'Masculin' : member.gender === 'female' ? 'Féminin' : 'Autre'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{calculateAge(member.birth_date)} ans</td>
                <td className="px-6 py-4"><BeltBadge grade={member.grade} /></td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getMemberStatus(member).color}`}>
                    {getMemberStatus(member).label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{new Date(member.entry_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">{new Date(member.birth_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onView(member)} className="text-blue-600 font-semibold hover:text-blue-800 text-sm">Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Contrôles de pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="text-sm font-medium text-slate-600 disabled:text-slate-300"
          >
            Précédent
          </button>
          <span className="text-sm text-slate-500">Page {currentPage} sur {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="text-sm font-medium text-slate-600 disabled:text-slate-300"
          >
            Suivant
          </button>
        </div>
      )}
      
      <MemberDetailsModal 
        isOpen={!!selectedMember} 
        onClose={() => setSelectedMember(null)} 
        member={selectedMember} 
      />
    </div>
  );
}
