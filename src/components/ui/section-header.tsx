interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex gap-[4px] items-center w-full">
      <p className="font-semibold text-[16px] text-[#282828] whitespace-nowrap">
        {title}
      </p>
      <div className="flex gap-[4px] items-center">
        <div className="w-[15px] h-[15px] flex items-center justify-center">
          <div className="w-[4px] h-[4px] bg-[#d4d4d4] rounded-full" />
        </div>
        <div className="w-[15px] h-[15px] flex items-center justify-center">
          <div className="w-[4px] h-[4px] bg-[#d4d4d4] rounded-full" />
        </div>
        <div className="w-[15px] h-[15px] flex items-center justify-center">
          <div className="w-[4px] h-[4px] bg-[#d4d4d4] rounded-full" />
        </div>
      </div>
    </div>
  );
}
