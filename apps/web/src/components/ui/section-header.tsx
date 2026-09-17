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
        <img
          src="/assets/flower pattern.svg"
          alt=""
          className="w-[15px] h-[15px]"
        />
        <img
          src="/assets/flower pattern.svg"
          alt=""
          className="w-[15px] h-[15px]"
        />
        <img
          src="/assets/flower pattern.svg"
          alt=""
          className="w-[15px] h-[15px]"
        />
      </div>
    </div>
  );
}
