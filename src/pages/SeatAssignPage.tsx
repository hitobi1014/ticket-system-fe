import useFloorStore from '@/store/floorStore.ts';
import useVenueStore from '@/store/venueStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog.tsx';
import { AssignMemberModal } from '@/components/dialog/AssignMemberModal.tsx';
import BulkAssignConfirmDialog from '@/components/dialog/BulkAssignConfirmDialog.tsx';
import type { BulkAssignAction } from '@/components/dialog/BulkAssignConfirmDialog.tsx';
import SeatAssignSidebar from '@/components/seat-assign/SeatAssignSidebar.tsx';
import SeatAssignGrid from '@/components/seat-assign/SeatAssignGrid.tsx';
import BulkAssignBar from '@/components/seat-assign/BulkAssignBar.tsx';
import ZoomControl from '@/components/common/ZoomControl.tsx';
import useZoomControls from '@/hooks/use-zoom-controls.ts';
import useSpaceKey from '@/hooks/use-space-key.ts';
import useBulkSeatSelect from '@/hooks/use-bulk-seat-select.ts';
import { getAssignedSeatIds, groupSelectedSeats } from '@/lib/bulkAssignUtils.ts';
import { findSeatContext, getRemainTickets, isSeatSelectable } from '@/lib/seatUtils.ts';
import { cn } from '@/lib/utils.ts';
import { pageContentClass } from '@/constant/styles.ts';
import type { Seat } from '@/types';

export default function SeatAssignPage() {
  const { floors, assignSeat, unAssignSeat } = useFloorStore();
  const { venue } = useVenueStore();
  const { members, getAssignedCountMap } = useMemberStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());
  const [confirmAction, setConfirmAction] = useState<BulkAssignAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // state는 다음 렌더에 반영되므로, 같은 틱에 연속 호출되는 경우를 막기 위해 ref로 동기 가드
  const submittingRef = useRef(false);

  useEffect(() => {
    if (floors.length > 0 && selectedFloorId == undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFloorId(floors[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors]);

  const { currentScale, handleScaleChange, setTransformRef, zoomIn, zoomOut } =
    useZoomControls(selectedFloorId);

  // 일괄 편집 모드 = 잔여 티켓이 있는 회원이 선택된 상태 (잔여가 0이 되면 자동 종료)
  const assignedCountMap = getAssignedCountMap();
  const selectedMember = members.find((m) => m.id === selectedMemberId) ?? null;
  const bulkMember =
    selectedMember && getRemainTickets(selectedMember, assignedCountMap) > 0
      ? selectedMember
      : null;
  const isBulkEditMode = bulkMember != null;
  const remainTickets = bulkMember ? getRemainTickets(bulkMember, assignedCountMap) : 0;

  // 확인 다이얼로그가 열려 있는 동안은 Space 기본 동작(버튼 활성화)을 막지 않는다
  const isSpacePressed = useSpaceKey(isBulkEditMode && confirmAction == null);

  const exitBulkEditMode = () => {
    setSelectedMemberId(null);
    setSelectedSeatIds(new Set());
  };

  const handleSelectMember = (memberId: number) => {
    if (memberId === selectedMemberId) {
      exitBulkEditMode();
      return;
    }
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    // 새 회원에게 이미 배정된 좌석은 선택 대상이 아니므로 제외
    const nextSeatIds = new Set(
      [...selectedSeatIds].filter(
        (id) => findSeatContext(floors, id)?.seat.assignedMemberId !== memberId,
      ),
    );
    const remain = getRemainTickets(member, assignedCountMap);
    if (nextSeatIds.size > remain) {
      toast.warning(
        `${member.name} 회원의 잔여 티켓(${remain})보다 선택한 좌석(${nextSeatIds.size})이 많아 변경할 수 없습니다.`,
      );
      return;
    }
    setSelectedMemberId(memberId);
    setSelectedSeatIds(nextSeatIds);
  };

  const handleSingleSeatClick = (seatId: number) => {
    setSelectedSeatIds(new Set([seatId]));
    setIsModalOpen(true);
  };

  const isSeatSelectableForMember = useCallback(
    (seat: Seat, allowOverwrite: boolean) =>
      bulkMember != null && isSeatSelectable(seat, bulkMember.id, allowOverwrite),
    [bulkMember],
  );

  const handleLimitExceeded = useCallback(() => {
    toast.warning(`잔여 티켓(${remainTickets})을 초과하여 선택할 수 없습니다.`);
  }, [remainTickets]);

  const { handleSeatMouseDown, handleSeatMouseEnter } = useBulkSeatSelect({
    enabled: isBulkEditMode && !isSpacePressed,
    selectedSeatIds,
    onChange: setSelectedSeatIds,
    isSelectable: isSeatSelectableForMember,
    maxCount: remainTickets,
    onLimitExceeded: handleLimitExceeded,
  });

  const assignedSeatIds = getAssignedSeatIds(floors, selectedSeatIds);

  const handleConfirm = async () => {
    if (!bulkMember || confirmAction == null || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      if (confirmAction === 'assign') {
        await assignSeat({ seatIds: [...selectedSeatIds], memberId: bulkMember.id });
        toast.success(`${bulkMember.name} > ${selectedSeatIds.size}석 배정 완료`);
        // 잔여 티켓을 모두 사용했으면 일괄 편집 모드 종료
        if (remainTickets - selectedSeatIds.size <= 0) setSelectedMemberId(null);
      } else {
        await unAssignSeat({ seatIds: assignedSeatIds });
        toast.success(`${assignedSeatIds.length}석 배정을 취소했습니다.`);
      }
      setSelectedSeatIds(new Set());
      setConfirmAction(null);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : confirmAction === 'assign'
            ? '회원 좌석배정에 실패했습니다.'
            : '배정 취소를 실패했습니다.',
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const confirmGroups = groupSelectedSeats(
    floors,
    confirmAction === 'cancel' ? new Set(assignedSeatIds) : selectedSeatIds,
  );

  return (
    <div className="flex h-full overflow-hidden">
      <Tabs
        className={cn(pageContentClass, 'flex min-h-0 flex-1 flex-col overflow-hidden')}
        value={String(selectedFloorId)}
        onValueChange={(v) => setSelectedFloorId(Number(v))}
      >
        <div className="flex items-center justify-between">
          <TabsList variant="default">
            {floors.map((floor) => (
              <TabsTrigger variant="default" key={floor.id} value={String(floor.id)}>
                {floor.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Zoom controls */}
          <ZoomControl scale={currentScale} onZoomIn={zoomIn} onZoomOut={zoomOut} />
        </div>

        {/* 좌측 메인 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {floors.map((floor) => (
            <SeatAssignGrid
              key={floor.id}
              floor={floor}
              stagePosition={venue?.stagePosition ?? 'front'}
              isBulkEditMode={isBulkEditMode}
              selectedSeatIds={selectedSeatIds}
              onSeatClick={handleSingleSeatClick}
              onSeatMouseDown={handleSeatMouseDown}
              onSeatMouseEnter={handleSeatMouseEnter}
              isSpacePressed={isSpacePressed}
              topBar={
                bulkMember && (
                  <BulkAssignBar
                    memberName={bulkMember.name}
                    remainTickets={remainTickets}
                    assignedTickets={assignedCountMap[bulkMember.id] ?? 0}
                    allocatedTickets={bulkMember.allocatedTickets}
                    selectedCount={selectedSeatIds.size}
                    overwriteCount={assignedSeatIds.length}
                    onAssign={() => setConfirmAction('assign')}
                    onCancelAssign={() => setConfirmAction('cancel')}
                    onExit={exitBulkEditMode}
                  />
                )
              }
              transformRef={setTransformRef(floor.id)}
              onScaleChange={handleScaleChange}
            />
          ))}
        </div>
      </Tabs>
      <SeatAssignSidebar
        selectedMemberId={bulkMember?.id ?? null}
        onSelectMember={handleSelectMember}
      />

      {/* 단건 좌석 배정 모달 => 모달은 페이지(최상위)레벨에 배치 */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setSelectedSeatIds(new Set());
          }
        }}
      >
        <AssignMemberModal
          key={[...selectedSeatIds].join(',')}
          seatIds={selectedSeatIds}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSeatIds(new Set());
          }}
        />
      </Dialog>

      {/* 일괄 편집 모드 배정/배정취소 확인 */}
      <BulkAssignConfirmDialog
        action={confirmAction}
        member={bulkMember}
        members={members}
        groups={confirmGroups}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
}
