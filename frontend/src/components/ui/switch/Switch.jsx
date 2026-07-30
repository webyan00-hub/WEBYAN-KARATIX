import React from 'react';
import { cn } from '../../../lib/utils';

export const Switch = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "peer appearance-none w-11 h-6 bg-slate-200 rounded-full cursor-pointer transition-transition-default checked:bg-action focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2",
        "before:content-[''] before:absolute before:mt-1 before:ml-1 before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-all before:duration-300 checked:before:ml-6",
        className
      )}
      {...props}
    />
  );
});

Switch.displayName = "Switch";
