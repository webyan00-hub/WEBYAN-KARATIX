import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import BeltBadge from './BeltBadge';
import { calculateAge } from '../../../../../lib/calculateAge';

export default function MemberTable({ members, onView }) {
  const [sortConfig, setSortConfig] = useState({ key: 'last_name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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

  const paginatedMembers = sortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getMemberStatus = (member) => {
    const isManuallyActive = member.active;
    if (!member.last_attendance_date) {
      return isManuallyActive 
        ? { label: 'Actif', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' } 
        : { label: 'Inactif', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    const lastAttendance = new Date(member.last_attendance_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const isRecentlyActive = lastAttendance > threeMonthsAgo;
    
    if (!isManuallyActive) return { label: 'Inactif', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (!isRecentlyActive) return { label: 'Absence', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    
    return { label: 'Actif', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-3 h-3 text-action ml-1" /> : 
      <ArrowDown className="w-3 h-3 text-action ml-1" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-6">Photo</th>
              <th className="px-8 py-6 cursor-pointer hover:text-slate-900" onClick={() => handleSort('last_name')}>
                <div className="flex items-center">Membre <SortIcon columnKey="last_name" /></div>
              </th>
              <th className="px-8 py-6 cursor-pointer hover:text-slate-900" onClick={() => handleSort('grade')}>
                <div className="flex items-center">Grade <SortIcon columnKey="grade" /></div>
              </th>
              <th className="px-8 py-6 cursor-pointer hover:text-slate-900" onClick={() => handleSort('member_status')}>
                <div className="flex items-center">Statut <SortIcon columnKey="member_status" /></div>
              </th>
              <th className="px-8 py-6 cursor-pointer hover:text-slate-900" onClick={() => handleSort('birth_date')}>
                <div className="flex items-center">Naissance <SortIcon columnKey="birth_date" /></div>
              </th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedMembers.map(member => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 border border-slate-200 overflow-hidden shadow-sm">
                    {member.photo_url ? (
                      <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo_url}`} alt={member.first_name} className="w-full h-full object-cover" />
                    ) : (
                      `${member.first_name[0]}${member.last_name[0]}`
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                    <p className="font-black text-slate-950">{member.last_name.toUpperCase()} {member.first_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">ID: {member.member_number}</p>
                </td>
                <td className="px-8 py-6"><BeltBadge grade={member.grade} /></td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getMemberStatus(member).color}`}>
                    {getMemberStatus(member).label}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-600 font-mono">{new Date(member.entry_date).toLocaleDateString()}</td>
                <td className="px-8 py-6 text-sm font-bold text-slate-600 font-mono">{new Date(member.birth_date).toLocaleDateString()}</td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => onView(member)} className="text-blue-600 font-black hover:text-blue-800 text-sm">Voir profil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
