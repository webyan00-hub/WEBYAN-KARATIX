import React from 'react';
import BeltBadge from './BeltBadge';
import { ChevronRight } from 'lucide-react';

export default function MemberCardList({ members, onView, getMemberStatus }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden p-4">
      {members.map(member => (
        <button 
          key={member.id} 
          onClick={() => onView(member)}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-500 border border-slate-200 overflow-hidden shadow-sm">
                {member.photo_url ? (
                    <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo_url}`} alt={member.first_name} className="w-full h-full object-cover" />
                ) : (
                    `${member.first_name[0]}${member.last_name[0]}`
                )}
            </div>
            <div className="text-left">
              <p className="font-black text-slate-950 text-base">{member.last_name.toUpperCase()} {member.first_name}</p>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5 mb-2">ID: {member.member_number}</p>
              <div className="flex items-center gap-2">
                <BeltBadge grade={member.grade} />
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getMemberStatus(member).color}`}>
                    {getMemberStatus(member).label}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="text-slate-300" size={20} />
        </button>
      ))}
    </div>
  );
}
