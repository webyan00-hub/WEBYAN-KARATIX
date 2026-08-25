import React from 'react';
import { ChevronRight, Phone } from 'lucide-react';
import BeltBadge from './BeltBadge';

const getInitials = (member) => `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase() || 'M';

export default function MemberCardList({ members, onView, getMemberStatus }) {
  return (
    <div className="grid gap-3 bg-slate-50/70 p-3">
      {members.map((member) => {
        const status = getMemberStatus(member);
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onView(member)}
            className="grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-200 active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs font-black text-slate-600 shadow-sm">
              {member.photo_url ? (
                <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo_url}`} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                getInitials(member)
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{member.last_name?.toUpperCase()} {member.first_name}</p>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">ID {member.member_number || '-'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <BeltBadge grade={member.grade} />
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${status.color}`}>
                  {status.label}
                </span>
              </div>
              {member.phone && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Phone className="h-3.5 w-3.5" /> {member.phone}
                </div>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>
        );
      })}
    </div>
  );
}
