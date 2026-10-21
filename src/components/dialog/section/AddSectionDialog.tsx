import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconPlus } from '@tabler/icons-react';
import useFloorStore from '@/store/floorStore.ts';
import useAddSectionForm from '@/hooks/use-add-section-form.ts';
import AddSectionStepHeader from '@/components/dialog/section/AddSectionStepHeader.tsx';
import SectionBasicInfoStep from '@/components/dialog/section/SectionBasicInfoStep.tsx';
import SectionRowDetailStep from '@/components/dialog/section/SectionRowDetailStep.tsx';
import AddSectionFooter from '@/components/dialog/section/AddSectionFooter.tsx';

interface Props {
  floorId: number;
  onConfirm: () => void;
}

export default function AddSectionDialog({ floorId, onConfirm }: Props) {
  const { floors, addSectionWithRows } = useFloorStore();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useAddSectionForm();

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) form.reset();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addSectionWithRows(floorId, {
        sectionName: form.sectionName,
        rowConfig: form.rowConfigs,
        targetFloorRowId: form.selectRowId,
      });
      onConfirm(); // 콜백 실행
      setOpen(false); // 다이얼로그 닫기
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="base">
          <IconPlus stroke={2} />
          구역 추가
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] min-w-150 grid-rows-[auto_minmax(0,1fr)_auto]">
        <AddSectionStepHeader step={form.step} />

        {form.step === 1 ? (
          <SectionBasicInfoStep
            floor={floors.find((f) => f.id === floorId)}
            sectionName={form.sectionName}
            onSectionNameChange={form.setSectionName}
            selectRowId={form.selectRowId}
            onSelectRowIdChange={form.setSelectRowId}
            rowCount={form.rowCount}
            onRowCountChange={form.setRowCount}
            defaultSeatCount={form.defaultSeatCount}
            onDefaultSeatCountChange={form.setDefaultSeatCount}
            rowNameType={form.rowNameType}
            onRowNameTypeChange={form.changeRowNameType}
            startValue={form.startValue}
            onStartValueChange={form.setStartValue}
            previewNames={form.previewNames}
          />
        ) : (
          <SectionRowDetailStep
            sectionName={form.sectionName}
            rowCount={form.rowCount}
            rowNameType={form.rowNameType}
            bulkCount={form.bulkCount}
            onBulkCountChange={form.setBulkCount}
            onApplyBulk={form.applyBulkSeatCount}
            rowConfigs={form.rowConfigs}
            onRowSeatCountChange={form.updateRowSeatCount}
          />
        )}

        <AddSectionFooter
          step={form.step}
          isSubmitting={isSubmitting}
          totalSeatCount={form.totalSeatCount}
          onPrevious={form.goPrevious}
          onNext={form.goNext}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
