import { useState } from 'react';
import { X } from 'lucide-react';
import { EditLabelsModal } from './EditLabelsModal';

export interface ColorPreset {
  id: string;
  label: string;
  color: string;
  order_index: number;
}

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColorId: string | null;
  onSelect: (colorId: string) => void;
  colorPresets: ColorPreset[];
  onUpdateLabel: (colorId: string, newLabel: string) => void;
  onUpdateLabels: (presets: ColorPreset[]) => void;
}

export const ColorPickerModal = ({
  isOpen,
  onClose,
  selectedColorId,
  onSelect,
  colorPresets,
  onUpdateLabel,
  onUpdateLabels,
}: ColorPickerModalProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY !== null) {
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY > 0) {
        setCurrentY(deltaY);
      }
    }
  };

  const handleTouchEnd = () => {
    if (currentY !== null && currentY > 100) {
      handleClose();
    } else {
      setCurrentY(null);
    }
    setStartY(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startY !== null) {
      const deltaY = e.clientY - startY;
      if (deltaY > 0) {
        setCurrentY(deltaY);
      }
    }
  };

  const handleMouseUp = () => {
    if (currentY !== null && currentY > 100) {
      handleClose();
    } else {
      setCurrentY(null);
    }
    setStartY(null);
  };

  const handleClose = () => {
    setStartY(null);
    setCurrentY(null);
    onClose();
  };

  const handleSelect = (colorId: string) => {
    onSelect(colorId);
    handleClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black bg-opacity-50" onClick={handleClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col transition-transform border-t-2 border-[#FFA52F]/40"
        style={{ transform: currentY ? `translateY(${currentY}px)` : 'translateY(0)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-between px-6 py-4 border-b-2 border-white/80 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={startY !== null ? handleMouseMove : undefined}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <h3 className="text-lg font-bold text-gray-800">予定カラーリスト</h3>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <div className="space-y-2 px-4">
            {colorPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset.id)}
                className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 rounded-2xl transition-all shadow-sm hover:shadow-md border-2 border-transparent hover:border-[#FFA52F]/20"
              >
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 shadow-md border-2 border-white"
                  style={{ backgroundColor: preset.color }}
                />
                <div className="flex-1 text-left">
                  <p className="text-[15px] font-medium text-gray-800">{preset.label}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selectedColorId === preset.id ? 'border-[#FFA52F] bg-[#FFA52F]/10' : 'border-gray-300'
                }`}>
                  {selectedColorId === preset.id && (
                    <div className="w-3 h-3 rounded-full bg-[#FFA52F]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t-2 border-white/80">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full py-3.5 bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white text-base font-semibold hover:from-[#FF9520] hover:to-[#FF7A00] rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            ラベル名を変更
          </button>
        </div>
      </div>

      <EditLabelsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        colorPresets={colorPresets}
        onUpdateLabels={onUpdateLabels}
      />
    </>
  );
};
