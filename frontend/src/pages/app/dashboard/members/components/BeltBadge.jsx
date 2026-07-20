import React from 'react';
import { getGradeColor } from '../../../../../lib/gradeUtils';

export default function BeltBadge({ grade }) {
  const colorClasses = getGradeColor(grade);
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClasses}`}>
      {grade}
    </span>
  );
}
