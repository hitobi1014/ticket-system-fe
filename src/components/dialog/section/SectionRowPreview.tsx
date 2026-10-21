export interface SectionRowPreviewProps {
  previewNames: string[];
  sectionName: string;
  rowCount: number;
  defaultSeatCount: number;
}

export default function SectionRowPreview({
  previewNames,
  sectionName,
  rowCount,
  defaultSeatCount,
}: SectionRowPreviewProps) {
  const previewDisplay =
    previewNames.length > 4
      ? [...previewNames.slice(0, 3), '...', previewNames[previewNames.length - 1]]
      : previewNames;

  return (
    <>
      {/*미리보기*/}
      <div className="flex gap-x-1">
        <p>미리보기:</p>
        {previewDisplay.map((v, i) => (
          <span key={i} className="bg-secondary text-text-foreground rounded px-2 py-0.5 text-xs">
            {v === '...' ? '...' : `${v}열`}
          </span>
        ))}
      </div>

      {/*구역명, 열 수, 예상좌석 표기*/}
      <div className="flex justify-between rounded-md px-4 py-2 text-center">
        <div>
          <p className="text-secondary text-sm font-semibold">구역명</p>
          <p className="text-base">{sectionName}</p>
        </div>
        <div>
          <p className="text-secondary text-sm font-semibold">열 수</p>
          <p className="text-base">{rowCount}열</p>
        </div>
        <div>
          <p className="text-secondary text-sm font-semibold">예상 좌석</p>
          <p className="text-base">{rowCount * defaultSeatCount}석</p>
        </div>
      </div>
    </>
  );
}
