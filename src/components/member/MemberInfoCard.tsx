import '@/pages/MemberPage.css';

export interface MemberInfoCardProps {
  title: string;
  boldText: string | number;
  textPostFix: string;
}
export default function MemberInfoCard({ title, boldText, textPostFix }: MemberInfoCardProps) {
  return (
    <div className="secondary-bg flex-1 pl-4 py-4 rounded-lg">
      <h3 className="secondary-color text-sm">{title}</h3>
      <div className="flex items-end gap-x-1">
        <p className="primary-color font-bold text-xl">{boldText}</p>
        <p className="secondary-color text-sm">{textPostFix}</p>
      </div>
    </div>
  );
}
