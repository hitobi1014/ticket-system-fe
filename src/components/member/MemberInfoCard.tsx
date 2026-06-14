import '@/pages/MemberPage.css';

export interface MemberInfoCardProps {
  title: string;
  boldText: string | number;
  textPostFix: string;
}
export default function MemberInfoCard({ title, boldText, textPostFix }: MemberInfoCardProps) {
  return (
    <div className="bg-surface-secondary flex-1 pl-4 py-4 rounded-lg">
      <h3 className="text-content-secondary text-sm">{title}</h3>
      <div className="flex items-end gap-x-1">
        <p className="text-content-primary font-bold text-xl">{boldText}</p>
        <p className="text-content-secondary text-sm">{textPostFix}</p>
      </div>
    </div>
  );
}
