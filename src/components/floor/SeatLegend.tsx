export default function SeatLegend() {
  return (
    <div className="flex gap-x-4 p-2">
      <div className="flex items-center gap-x-2">
        <span className="bg-success flex h-6 w-6 shrink-0 rounded-md" />
        <span>배정 완료 석</span>
      </div>
      <div className="flex items-center gap-x-2">
        <span className="bg-danger/50 flex h-6 w-6 shrink-0 rounded-md border-0" />
        <span>숨긴 좌석</span>
      </div>
      <div className="flex items-center gap-x-2">
        <span className="border-primary flex h-6 w-6 shrink-0 rounded-md border" />
        <span>배정 가능 석</span>
      </div>
    </div>
  );
}
