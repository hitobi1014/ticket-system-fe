export interface MemberInfoCardProps {
  title: string;
  boldText: string | number;
  textPostFix: string;
}
export default function MemberInfoCard({ title, boldText, textPostFix }: MemberInfoCardProps) {
  return (
    <div className="pl-4 py-2 w-40 bg-gray-800 rounded-lg">
      <h3 className="text-gray-300 text-sm">{title}</h3>
      <div className="flex items-end gap-x-1">
        <p className="text-white font-bold text-xl">{boldText}</p>
        <p className="text-gray-300 text-sm">{textPostFix}</p>
      </div>
    </div>
  );
}
