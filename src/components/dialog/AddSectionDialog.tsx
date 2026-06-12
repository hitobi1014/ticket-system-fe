import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { clsx } from 'clsx';

interface Props {
  floorId: number;
  floorRowId: number;
  onConfirm: () => void;
}

/**
 * 입력받은 숫자 또는 알파벳으로 순차적으로 값 생성
 * */
const generateRowNames = (
  type: 'number' | 'alpha' | 'custom',
  startValue: string,
  rowCount: number,
): string[] => {
  if (type === 'number') {
    return Array.from({ length: rowCount }, (_, i) => String(Number(startValue) + i));
  }
  if (type === 'alpha') {
    return Array.from({ length: rowCount }, (_, i) =>
      String.fromCharCode(startValue.charCodeAt(0) + i),
    );
  }
  return Array.from({ length: rowCount }, () => '');
};

export default function AddSectionDialog({ floorId, floorRowId, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // 1단계 상태
  const [sectionName, setSectionName] = useState('');
  const [rowCount, setRowCount] = useState(5);
  const [defaultSeatCount, setDefaultSeatCount] = useState(10);
  const [rowNameType, setRowNameType] = useState<'number' | 'alpha' | 'custom'>('number');
  const [startValue, setStartValue] = useState('1');

  // 2단계 상태
  const [rowConfigs, setRowConfigs] = useState<{ name: string; seatCount: number }[]>([]);

  const previewNames = generateRowNames(rowNameType, startValue, rowCount);
  const previewDisplay =
    previewNames.length > 4
      ? [...previewNames.slice(0, 3), '...', previewNames[previewNames.length - 1]]
      : previewNames;

  // 1단계 → 2단계 이동 시 rowConfigs 초기화
  const handleNextStep = () => {
    const names = generateRowNames(rowNameType, startValue, rowCount);
    setRowConfigs(names.map((name) => ({ name, seatCount: defaultSeatCount })));
    setStep(2);
  };

  // 2단계 > 1단계 이동
  const handlePreviousStep = () => {
    const names = generateRowNames(rowNameType, startValue, rowCount);
    // setRowConfigs(names.map((name) => ({ name, seatCount: defaultSeatCount })));
    setStep(1);
  };

  // Dialog 닫을 때 상태 초기화
  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setStep(1);
      setSectionName('');
      // 나머지 초기화...
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="base">
          <IconPlus stroke={2} />
          구역 추가
        </Button>
      </DialogTrigger>

      {/* 컨텐트 시작 */}
      <DialogContent className="secondary-bg">
        <DialogHeader className="pt-8">
          <DialogTitle className="primary-color flex items-center gap-x-2">
            {/* 스텝 프로그레스 */}
            <div className="flex flex-1 gap-x-2">
              <div
                className={clsx(
                  'h-1 flex-1 rounded-full',
                  step >= 1 ? 'bg-mist-50' : 'bg-mist-500',
                )}
              />
              <div
                className={clsx(
                  'h-1 flex-1 rounded-full',
                  step >= 2 ? 'bg-mist-50' : 'bg-mist-500',
                )}
              />
            </div>
          </DialogTitle>
          {step === 1 ? (
            <div>
              <h3 className="primary-color text-base">구역 추가</h3>
              <DialogDescription className="text-mist-400">
                구역 기본 정보를 입력하세요
              </DialogDescription>
            </div>
          ) : (
            <div>
              <h3 className="primary-color text-base">구역 추가-열 상세 설정</h3>
              <DialogDescription className="text-mist-400">
                각 열의 좌석 수를 조정하세요. 기본값은12석입니다.
              </DialogDescription>
            </div>
          )}
        </DialogHeader>

        {step === 1 ? (
          <div className="primary-color">
            <FieldGroup>
              {/*필드1: 구역명*/}
              <Field className="max-w-sm">
                <FieldLabel htmlFor="section-name">구역명</FieldLabel>
                <Input
                  id="section-name"
                  aria-label="section-name"
                  className="primary-bg border-0"
                  type="text"
                  placeholder="구역명을 입력해주세요."
                />
              </Field>

              {/*필드2: 열 수*/}
              {/*필드3: 기본좌석 수*/}
              <div className="flex gap-x-2">
                <Field className="max-w-sm">
                  <FieldLabel htmlFor="col-count">열 수</FieldLabel>
                  <Input
                    id="col-count"
                    aria-label="col-count"
                    className="primary-bg border-0
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  "
                    type="number"
                    placeholder="열의 수를 입력해주세요."
                  />
                </Field>
                <Field className="max-w-sm">
                  <FieldLabel htmlFor="base-seat-count">기본 좌석 수/열</FieldLabel>
                  <Input
                    id="base-seat-count"
                    aria-label="base-seat-count"
                    className="primary-bg border-0
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  "
                    type="number"
                    placeholder="좌석수를 입력해주세요"
                  />
                </Field>
              </div>
              <Field className="max-w-sm">
                <FieldLabel htmlFor="base-seat-count">열 이름 형식</FieldLabel>
                <Select
                  value={rowNameType}
                  onValueChange={(v) => setRowNameType(v as 'number' | 'alpha' | 'custom')}
                >
                  <SelectTrigger className="w-45 primary-bg primary-color border-0">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent className="primary-bg primary-color">
                    <SelectGroup>
                      <SelectItem value="number">숫자(1,2,3...)</SelectItem>
                      <SelectItem value="alpha">알파벳(A,B,C...)</SelectItem>
                      <SelectItem value="custom">커스텀(사용미정)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div>
                {rowNameType === 'number' ? <p>시작 번호</p> : <p>시작 알파벳</p>}
                <Input
                  aria-label="start-value"
                  className="primary-bg border-0"
                  type="text"
                  value={startValue}
                  onChange={(e) => setStartValue(e.target.value)}
                />
              </div>
              {/*미리보기*/}
              <div className="flex gap-x-1">
                <p>미리보기:</p>
                {previewDisplay.map((v, i) => (
                  <span key={i} className="sub-bg primary-color px-2 py-0.5 rounded text-xs">
                    {v === '...' ? '...' : `${v}열`}
                  </span>
                ))}
              </div>

              {/*구역명, 열 수, 예상좌석 표기*/}
              <div className="primary-bg flex justify-between text-center px-4 py-2 rounded-md">
                <div>
                  <p className="secondary-color text-xs">구역명</p>
                  <p className="text-base">{sectionName}</p>
                </div>
                <div>
                  <p className="secondary-color text-xs">열 수</p>
                  <p className="text-base">{rowCount}열</p>
                </div>
                <div>
                  <p className="secondary-color text-xs">예상 좌석</p>
                  <p className="text-base">{rowCount * defaultSeatCount}석</p>
                </div>
              </div>
            </FieldGroup>
          </div>
        ) : (
          <div>
            {/* step02-content-01*/}
            <div className="primary-color primary-bg flex gap-x-4 px-4 rounded-md">
              <div className="flex gap-x-2">
                <p className="secondary-color">구역</p>
                <p>{sectionName}</p>
              </div>
              <div className="flex gap-x-2">
                <p className="secondary-color">열 수</p>
                <p>{rowCount}</p>
              </div>
              <div className="flex gap-x-2">
                <p className="secondary-color">형식</p>
                <p>
                  {rowNameType === 'number' ? '숫자' : rowNameType === 'alpha' ? '알파벳' : '없음'}
                </p>
              </div>
            </div>
            {/* step02-content-02*/}
            <div className="flex justify-between">
              <div className="flex gap-x-4">
                <p className="primary-color">전체 일괄 적용</p>
                <Input
                  type="number"
                  aria-label="seat-count"
                  className="secondary-bg rounded-md
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                "
                />
                <Button variant="dialog" size="sm">
                  전체 적용
                </Button>
              </div>
              <p className="secondary-color">개별 수정도 가능</p>
            </div>
            {/* step02-content-03*/}
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <p>{i}열</p>
                  <div>
                    <Button variant="dialog">
                      <IconMinus stroke={2} />
                    </Button>
                    <Input
                      aria-label="seat-input"
                      type="number"
                      min={1}
                      value={10}
                      className="primary-bg
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    "
                    />
                    <Button variant="dialog">
                      <IconPlus stroke={2} />
                    </Button>
                  </div>

                  {/*TODO seat-input value 만큼 상자 그리기*/}
                  <div></div>
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter className="secondary-bg border-0 pb-2.5">
          <div
            className={clsx('w-full flex items-center gap-x-2', {
              'justify-between': step === 2,
              'justify-end': step === 1,
            })}
          >
            {step === 2 && (
              <Button variant="dialog" onClick={handlePreviousStep}>
                <IconArrowNarrowLeft stroke={2} />
                이전
              </Button>
            )}
            <div className="flex gap-x-2">
              <DialogClose asChild>
                <Button variant="dialog">취소</Button>
              </DialogClose>
              {step === 1 ? (
                <Button variant="dialog" onClick={handleNextStep}>
                  <IconArrowNarrowRight stroke={2} />
                  다음
                </Button>
              ) : (
                <Button
                  variant="dialog"
                  onClick={() => {
                    console.log('완료');
                    setOpen(false);
                  }}
                >
                  구역 추가 완료({defaultSeatCount})석
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
