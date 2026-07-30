import React from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../button/Button';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center gap-spacing-sm">
      <Button 
        variant="outline" 
        size="sm" 
        isDisabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-body-small text-text-muted">
        Page {currentPage} sur {totalPages}
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        isDisabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
