import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import BeltBadge from './BeltBadge';
import { calculateAge } from '../../../../../lib/calculateAge';
import { membersService } from '../services/membersService';

export default function MemberTable({ members, onView }) {
  const [sortConfig, setSortConfig] = useState({ key: 'last_name', direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedMembers = useMemo(() => [...members].sort((a, b) => {
    let aVal = a[sortConfig.key] || '';
    let bVal = b[sortConfig.key] || '';

    if (sortConfig.key === 'age') {
      aVal = calculateAge(a.birth_date);
      bVal = calculateAge(b.birth_date);
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }), [members, sortConfig]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-1 h-3 w-3 text-slate-400" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3 text-blue-600" />
      : <ArrowDown className="ml-1 h-3 w-3 text-blue-600" />;
  };

  return (
    <div className="w-full bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Photo</th>
              <th className="cursor-pointer px-5 py-4 hover:text-slate-900" onClick={() => handleSort('last_name')}>
                <div className="flex items-center">Membre <SortIcon columnKey="last_name" /></div>
              </th>
              <th className="cursor-pointer px-5 py-4 hover:text-slate-900" onClick={() => handleSort('grade')}>
                <div className="flex items-center">Grade <SortIcon columnKey="grade" /></div>
              </th>
              <th className="cursor-pointer px-5 py-4 hover:text-slate-900" onClick={() => handleSort('member_status')}>
                <div className="flex items-center">Statut <SortIcon columnKey="member_status" /></div>
              </th>
              <th className="cursor-pointer px-5 py-4 hover:text-slate-900" onClick={() => handleSort('entry_date')}>
                <div className="flex items-center">Entrée <SortIcon columnKey="entry_date" /></div>
              </th>
              <th className="cursor-pointer px-5 py-4 hover:text-slate-900" onClick={() => handleSort('birth_date')}>
                <div className="flex items-center">Naissance <SortIcon columnKey="birth_date" /></div>
              </th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedMembers.map((member) => {
              const status = membersService.getMemberStatus(member);

              return (
                <tr key={member.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-xs font-black text-slate-500 shadow-sm">
                      {member.photo_url ? (
                        <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo_url}`} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-950">{member.last_name?.toUpperCase()} {member.first_name}</p>
                    <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-400">ID: {member.member_number || '-'}</p>
                  </td>
                  <td className="px-5 py-4"><BeltBadge grade={member.grade} /></td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-slate-600">{member.entry_date ? new Date(member.entry_date).toLocaleDateString() : '-'}</td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-slate-600">{member.birth_date ? new Date(member.birth_date).toLocaleDateString() : '-'}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => onView(member)} className="text-sm font-black text-blue-600 hover:text-blue-800">Voir profil</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
