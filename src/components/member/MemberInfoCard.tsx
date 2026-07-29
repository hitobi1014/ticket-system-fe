export interface MemberInfoCardProps {
  title: string;
  boldText: string | number;
  textPostFix: string;
}
export default function MemberInfoCard({ title, boldText, textPostFix }: MemberInfoCardProps) {
  return (
    <div className="bg-card border-border flex-1 rounded-lg border py-4 pl-4">
      <h3 className="text-primary text-sm">{title}</h3>
      <div className="flex items-end gap-x-1">
        <p className="text-primary text-xl font-bold">{boldText}</p>
        <p className="text-secondary text-sm">{textPostFix}</p>
      </div>
    </div>
  );
}
