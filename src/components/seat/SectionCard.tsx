import type { FloorItem, Section } from '@/types';
import Row from '@/components/seat/Row.tsx';
import RowGap from '@/components/seat/RowGap.tsx';
import useFloorStore from '@/store/floorStore.ts';
import { IconEyeOff, IconLineDashed, IconMinus, IconRowInsertBottom } from '@tabler/icons-react';
import { toast } from 'sonner';
import { RemoveSeatDialog } from '@/components/dialog/RemoveSeatDialog.tsx';
import { useState } from 'react';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge';
import AisleDivider from '@/components/seat/AisleDivider.tsx';
import { seatSectionClass, selectedSectionClass } from '@/constant/styles.ts';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';
import AddSeatDialog from '@/components/dialog/seat/AddSeatDialog.tsx';
import AddRowDialog from '@/components/dialog/row/AddRowDialog.tsx';
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
}

export default function SectionCard({
  item,
  selectedRowId,
  selectedSectionId,
  selectedAisleId,
  onSelectedSectionId,
  onSelectedAisleId,
  onSelectedRowId,
}: SectionCardProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());

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

  const handleSeatClick = (seatId: number) => {
    // row 선택 모드가 아닐 때만 좌석 선택 가능
    if (selectedRowId === null) return;

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
      <div className="flex flex-col gap-y-2">
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
              isEditMode={selectedRowId === row.id}
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

  const handleToggleSeatVisible = async () => {
    if (selectedSeatIds.size === 0) {
      toast.warning('선택된 좌석이 없습니다.');
      return;
    }

    try {
      await toggleSeatVisible([...selectedSeatIds]);
      setSelectedSeatIds(new Set()); // 선택 초기화
      toast.success(`${selectedSeatIds.size}개 좌석의 표시 상태가 변경되었습니다.`);
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
        <Button size="xs" disabled={selectedSeatIds.size === 0} onClick={handleToggleSeatVisible}>
          <IconEyeOff stroke={2} />빈 좌석
          {selectedSeatIds.size > 0 ? selectedSeatIds.size : '설정'}
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
