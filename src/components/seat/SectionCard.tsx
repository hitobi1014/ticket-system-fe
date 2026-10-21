import type { FloorItem, Section } from '@/types';
import Row from '@/components/seat/Row.tsx';
import RowGap from '@/components/seat/RowGap.tsx';
import useFloorStore from '@/store/floorStore.ts';
import {
  IconEye,
  IconEyeOff,
  IconLineDashed,
  IconMinus,
  IconRowInsertBottom,
} from '@tabler/icons-react';
import useDragSelect from '@/hooks/use-drag-select.ts';
import DragSelectBox from '@/components/seat/DragSelectBox.tsx';
import { toast } from 'sonner';
import { RemoveSeatDialog } from '@/components/dialog/RemoveSeatDialog.tsx';
import { useMemo, useState } from 'react';
import { buildSeatNumberPreview } from '@/lib/sectionUtils.ts';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge';
import AisleDivider from '@/components/seat/AisleDivider.tsx';
import { seatSectionClass, selectedSectionClass } from '@/constant/styles.ts';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';
import AddSeatDialog from '@/components/dialog/seat/AddSeatDialog.tsx';
import AddRowDialog from '@/components/dialog/row/AddRowDialog.tsx';
import ChangeSeatNumberingDialog from '@/components/dialog/section/ChangeSeatNumberingDialog.tsx';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import { findSectionRowInfoByRowId } from '@/lib/seatUtils.ts';

interface SectionCardProps {
  item: FloorItem;
  selectedRowId: number | undefined;
  selectedSectionId: number | undefined;
  selectedAisleId: number | undefined;

  onSelectedSectionId: (id: number | undefined) => void;
  onSelectedAisleId: (id: number | undefined) => void;
  onSelectedRowId: (id: number | undefined) => void;
  /** Space를 누르고 있는 동안(화면 이동 모드)에는 드래그 선택을 하지 않음 */
  isSpacePressed?: boolean;
}

export default function SectionCard({
  item,
  selectedRowId,
  selectedSectionId,
  selectedAisleId,
  onSelectedSectionId,
  onSelectedAisleId,
  onSelectedRowId,
  isSpacePressed = false,
}: SectionCardProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());
  const isSectionSelected = item.kind === 'section' && selectedSectionId === item.id;

  // 구역 선택이 해제되면 좌석 선택도 초기화 (렌더 중 상태 조정)
  if (!isSectionSelected && selectedSeatIds.size > 0) {
    setSelectedSeatIds(new Set());
  }

  // 좌석을 선택했을 때만 번호 미리보기(숨김 처리 전 힌트) 계산 — 서버 데이터와 별개의 파생 값
  const seatNumberPreview = useMemo(
    () =>
      item.kind === 'section' && isSectionSelected && selectedSeatIds.size > 0
        ? buildSeatNumberPreview(item, selectedSeatIds)
        : undefined,
    [item, isSectionSelected, selectedSeatIds],
  );

  const { box, consumeClick, handlers } = useDragSelect({
    enabled: isSectionSelected && !isSpacePressed,
    selectedIds: selectedSeatIds,
    onChange: setSelectedSeatIds,
  });

  const handleSelectSection = (sectionId: number) => {
    if (selectedSectionId === sectionId) return;
    onSelectedSectionId(sectionId);
    onSelectedAisleId(undefined);
  };

  const handleSelectAisle = (id: number) => {
    if (selectedAisleId === id) return;
    onSelectedAisleId(id);
    onSelectedSectionId(undefined);
  };

  // 구역이 선택된 상태에서 클릭: 해당 구역의 모든 좌석을 개별 선택/해제 가능
  const handleSeatClick = (seatId: number) => {
    setSelectedSeatIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seatId)) {
        newSet.delete(seatId);
      } else {
        newSet.add(seatId);
      }
      return newSet;
    });
  };

  if (item.kind === 'aisle') {
    return (
      <AisleDivider
        onClick={(e) => {
          e.stopPropagation();
          handleSelectAisle(item.id);
        }}
        isSelected={selectedAisleId === item.id}
      />
    );
  }

  /* Section */
  return (
    <div
      key={item.id}
      onClick={(e) => {
        e.stopPropagation();
        handleSelectSection(item.id);
      }}
      className={cn(seatSectionClass, selectedSectionId === item.id && selectedSectionClass)}
    >
      <div
        className="flex items-center justify-between"
        onClick={(e) => {
          e.stopPropagation();
          handleSelectSection(item.id);
          onSelectedRowId(undefined); // row 선택 해제
        }}
      >
        <Badge>{item.name}</Badge>
        <p>{item.rows.flatMap((r) => r.seats).length}석</p>
      </div>
      {selectedSectionId === item.id && (
        <SectionButtons
          item={item}
          selectedRowId={selectedRowId}
          selectedSeatIds={selectedSeatIds}
          setSelectedSeatIds={setSelectedSeatIds}
          onSelectedRowId={onSelectedRowId}
        />
      )}
      <div
        className={cn('flex flex-col gap-y-2', isSectionSelected && !isSpacePressed && 'select-none')}
        {...handlers}
        onClickCapture={(e) => {
          // 드래그 직후 발생하는 click(열 선택 등)은 무시
          if (consumeClick()) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <DragSelectBox box={box} />
        {item.rows.map((row) =>
          row.kind === 'gap' ? (
            <RowGap
              key={row.id}
              className="h-8"
              isSelected={selectedRowId === row.id}
              onClick={() => {
                handleSelectSection(item.id);
                onSelectedRowId(row.id);
              }}
            />
          ) : (
            <Row
              key={row.id}
              row={row}
              isSelected={selectedRowId === row.id}
              onClick={(rowId) => {
                handleSelectSection(item.id);
                onSelectedRowId(rowId);
              }}
              selectedSeatIds={selectedSeatIds}
              onSeatClick={handleSeatClick}
              onSelectSection={() => handleSelectSection(item.id)}
              isEditMode={isSectionSelected}
              seatNumberPreview={seatNumberPreview}
            />
          ),
        )}
      </div>
    </div>
  );
}

interface SectionButtonsProps {
  item: Section;
  selectedRowId: number | undefined;
  selectedSeatIds: Set<number>;
  setSelectedSeatIds: (selectedSeatIds: Set<number>) => void;
  onSelectedRowId: (id: number | undefined) => void;
}

function SectionButtons({
  item,
  selectedRowId,
  selectedSeatIds,
  setSelectedSeatIds,
  onSelectedRowId,
}: SectionButtonsProps) {
  const toggleSeatVisible = useFloorStore((state) => state.toggleSeatVisible);
  const removeRow = useFloorStore((state) => state.removeRow);
  const addGapRow = useFloorStore((state) => state.addGapRow);
  const convertRowToGap = useFloorStore((state) => state.convertRowToGap);

  // 선택된 줄: 일반 열 또는 빈 줄
  const selectedRow = item.rows.find((r) => r.id === selectedRowId);
  const isGapSelected = selectedRow?.kind === 'gap';
  const isSeatRowSelected = selectedRow?.kind === 'row';

  // 선택된 좌석을 현재 표시 상태별로 분리 (서버 API는 각 좌석의 표시 상태를 반전시킴)
  const visibleSeatIds: number[] = [];
  const hiddenSeatIds: number[] = [];
  for (const row of item.rows) {
    for (const seat of row.seats) {
      if (!selectedSeatIds.has(seat.id)) continue;
      (seat.visible ? visibleSeatIds : hiddenSeatIds).push(seat.id);
    }
  }

  // 숨기기: 선택 좌석 중 보이는 좌석만 / 숨김 해제: 선택 좌석 중 숨긴 좌석만
  const handleToggleSeatVisible = async (targetIds: number[], message: string) => {
    if (targetIds.length === 0) {
      toast.warning('선택된 좌석이 없습니다.');
      return;
    }

    try {
      await toggleSeatVisible(targetIds);
      // 처리한 좌석만 선택에서 제외 (다른 상태로 선택된 좌석은 유지)
      const done = new Set(targetIds);
      setSelectedSeatIds(new Set([...selectedSeatIds].filter((id) => !done.has(id))));
      toast.success(`${targetIds.length}개 좌석을 ${message}했습니다.`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : '좌석 표시 상태 변경에 실패했습니다.');
    }
  };

  const getRowName = () => {
    const infos = findSectionRowInfoByRowId(item, selectedRowId!);
    return infos?.row.rowName;
  };

  const handleRemoveRow = async (rowId: number, rowName: string | undefined) => {
    try {
      await removeRow(rowId);
      onSelectedRowId(undefined); // 삭제된 줄의 선택 해제
      toast.success(isGapSelected ? '빈 줄 삭제를 성공했습니다.' : `[${rowName}]열 삭제를 성공했습니다.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '행 삭제에 실패했습니다.');
    }
  };

  // 선택한 열 바로 아래에 빈 줄 추가
  const handleAddGap = async () => {
    if (!isSeatRowSelected) return;
    try {
      await addGapRow(item.id, selectedRowId!);
      toast.success('빈 줄을 추가했습니다.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '빈 줄 추가에 실패했습니다.');
    }
  };

  // 선택한 열을 빈 줄로 변환 (배정된 좌석이 있으면 서버가 거부)
  const handleConvertToGap = async () => {
    if (!isSeatRowSelected) return;
    try {
      await convertRowToGap(selectedRowId!);
      onSelectedRowId(undefined);
      toast.success('빈 줄로 변경했습니다.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '빈 줄 변경에 실패했습니다.');
    }
  };
  return (
    <ButtonGroup className="self-end">
      {/*열 버튼 그룹*/}
      <ButtonGroup>
        <AddRowDialog item={item} />
        <AlertDialogCustom
          title={isGapSelected ? '빈 줄 삭제' : '행 삭제'}
          triggerText={isGapSelected ? '빈 줄 삭제' : '열 삭제'}
          size="xs"
          icon={<IconMinus stroke={2} />}
          disabled={selectedRowId == undefined}
          description={
            isGapSelected
              ? '선택한 빈 줄을 삭제하시겠습니까?'
              : `선택한 [${getRowName()}]열을 삭제하시겠습니까?`
          }
          actions={[
            {
              text: '삭제',
              size: 'xs',
              onClick: () => handleRemoveRow(selectedRowId!, getRowName()),
            },
          ]}
        />
      </ButtonGroup>
      {/*좌석 번호 방식 변경*/}
      <ButtonGroup>
        <ChangeSeatNumberingDialog section={item} />
      </ButtonGroup>
      {/*빈 줄 버튼 그룹*/}
      <ButtonGroup>
        <Button size="xs" disabled={!isSeatRowSelected} onClick={handleAddGap}>
          <IconRowInsertBottom stroke={2} />
          빈 줄 추가
        </Button>
        <AlertDialogCustom
          title="빈 줄로 변경"
          triggerText="빈 줄로 변경"
          size="xs"
          icon={<IconLineDashed stroke={2} />}
          disabled={!isSeatRowSelected}
          description={`선택한 [${getRowName()}]열의 좌석이 모두 삭제되고 빈 줄로 변경됩니다. 배정된 좌석이 있으면 변경할 수 없습니다.`}
          actions={[{ text: '변경', size: 'xs', onClick: handleConvertToGap }]}
        />
      </ButtonGroup>
      {/*좌석 버튼 그룹*/}
      <ButtonGroup>
        <AddSeatDialog
          triggerDisabled={!isSeatRowSelected}
          selectedRowId={selectedRowId!}
        />
        <RemoveSeatDialog
          key={selectedRowId}
          triggerDisabled={!isSeatRowSelected}
          selectedRowId={selectedRowId!}
        />
      </ButtonGroup>
      <ButtonGroup>
        <Button
          size="xs"
          disabled={visibleSeatIds.length === 0}
          onClick={() => handleToggleSeatVisible(visibleSeatIds, '숨김 처리')}
        >
          <IconEyeOff stroke={2} />
          좌석 숨기기{visibleSeatIds.length > 0 ? ` ${visibleSeatIds.length}` : ''}
        </Button>
        <Button
          size="xs"
          disabled={hiddenSeatIds.length === 0}
          onClick={() => handleToggleSeatVisible(hiddenSeatIds, '숨김 해제')}
        >
          <IconEye stroke={2} />
          숨김 해제{hiddenSeatIds.length > 0 ? ` ${hiddenSeatIds.length}` : ''}
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
