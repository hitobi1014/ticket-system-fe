export interface MemberInfoCardProps {
  title: string;
  boldText: string | number;
  textPostFix: string;
}
export default function MemberInfoCard({ title, boldText, textPostFix }: MemberInfoCardProps) {
  return (
    <div className="bg-card border-border min-w-0 rounded-lg border py-3 pr-2 pl-3 md:py-4 md:pl-4">
      <h3 className="text-primary truncate text-xs md:text-sm">{title}</h3>
      <div className="flex items-end gap-x-1">
        <p className="text-primary text-lg font-bold md:text-xl">{boldText}</p>
        <p className="text-secondary text-sm">{textPostFix}</p>
      </div>
    </div>
  );
}
