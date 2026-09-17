import { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export default function ContentContainer({ children, className = '' }: ContentContainerProps) {
  return (
    <div className={`bg-white border border-[#ececec] rounded-3xl p-[24px] flex flex-col gap-[12px] ${className}`}>
      {children}
    </div>
  );
}
