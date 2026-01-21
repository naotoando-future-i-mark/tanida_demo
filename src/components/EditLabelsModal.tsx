import { useState, useEffect, useCallback } from 'react';
import { X, GripVertical } from 'lucide-react';
import { ColorPreset } from './ColorPickerModal';

interface EditLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorPresets: ColorPreset[];
  onUpdateLabels: (presets: ColorPreset[]) => void;
}

export const EditLabelsModal = ({
  isOpen,
  onClose,
  colorPresets,
  onUpdateLabels,
}: EditLabelsModalProps) => {
  const [editedPresets, setEditedPresets] = useState<ColorPreset[]>(colorPresets);
  const [modalStartY, setModalStartY] = useState<number | null>(null);
  const [modalCurrentY, setModalCurrentY] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedY, setDraggedY] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleItemMouseMove = useCallback((e: MouseEvent) => {
    if (draggedIndex === null || !isDragging) return;

    const currentY = e.clientY;
    const deltaY = currentY - startY;
    setDraggedY(deltaY);

    const itemHeight = 60;
    const items = editedPresets.length;

    for (let i = 0; i < items; i++) {
      const itemTop = i * itemHeight;
      const itemBottom = itemTop + itemHeight;
      const draggedItemCenter = draggedIndex * itemHeight + deltaY + itemHeight / 2;

      if (draggedItemCenter >= itemTop && draggedItemCenter < itemBottom && i !== draggedIndex) {
        const newPresets = [...editedPresets];
        const [draggedItem] = newPresets.splice(draggedIndex, 1);
        newPresets.splice(i, 0, draggedItem);
        setEditedPresets(newPresets);
        setDraggedIndex(i);
        setStartY(currentY);
        setDraggedY(0);
        break;
      }
    }
  }, [draggedIndex, isDragging, startY, editedPresets]);

  const handleItemMouseUp = useCallback(() => {
    setDraggedIndex(null);
    setDraggedY(0);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleItemMouseMove);
      window.addEventListener('mouseup', handleItemMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleItemMouseMove);
        window.removeEventListener('mouseup', handleItemMouseUp);
      };
    }
  }, [isDragging, handleItemMouseMove, handleItemMouseUp]);

  if (!isOpen) return null;

  const handleModalTouchStart = (e: React.TouchEvent) => {
    setModalStartY(e.touches[0].clientY);
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    if (modalStartY !== null) {
      const deltaY = e.touches[0].clientY - modalStartY;
      if (deltaY > 0) {
        setModalCurrentY(deltaY);
      }
    }
  };

  const handleModalTouchEnd = () => {
    if (modalCurrentY !== null && modalCurrentY > 100) {
      handleClose();
    } else {
      setModalCurrentY(null);
    }
    setModalStartY(null);
  };

  const handleModalMouseDown = (e: React.MouseEvent) => {
    setModalStartY(e.clientY);
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (modalStartY !== null) {
      const deltaY = e.clientY - modalStartY;
      if (deltaY > 0) {
        setModalCurrentY(deltaY);
      }
    }
  };

  const handleModalMouseUp = () => {
    if (modalCurrentY !== null && modalCurrentY > 100) {
      handleClose();
    } else {
      setModalCurrentY(null);
    }
    setModalStartY(null);
  };

  const handleClose = () => {
    setModalStartY(null);
    setModalCurrentY(null);
    setDraggedIndex(null);
    setEditedPresets(colorPresets);
    onClose();
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setEditedPresets((prev) =>
      prev.map((preset) =>
        preset.id === id ? { ...preset, label: newLabel } : preset
      )
    );
  };

  const handleItemMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedIndex(index);
    setStartY(e.clientY);
    setDraggedY(0);
    setIsDragging(true);
  };

  const handleItemTouchStart = (e: React.TouchEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
    setStartY(e.touches[0].clientY);
    setDraggedY(0);
    setIsDragging(true);
  };

  const handleItemTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || !isDragging) return;
    e.preventDefault();

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    setDraggedY(deltaY);

    const itemHeight = 60;
    const items = editedPresets.length;

    for (let i = 0; i < items; i++) {
      const itemTop = i * itemHeight;
      const itemBottom = itemTop + itemHeight;
      const draggedItemCenter = draggedIndex * itemHeight + deltaY + itemHeight / 2;

      if (draggedItemCenter >= itemTop && draggedItemCenter < itemBottom && i !== draggedIndex) {
        const newPresets = [...editedPresets];
        const [draggedItem] = newPresets.splice(draggedIndex, 1);
        newPresets.splice(i, 0, draggedItem);
        setEditedPresets(newPresets);
        setDraggedIndex(i);
        setStartY(currentY);
        setDraggedY(0);
        break;
      }
    }
  };

  const handleItemTouchEnd = () => {
    setDraggedIndex(null);
    setDraggedY(0);
    setIsDragging(false);
  };

  const handleSave = () => {
    const updatedPresets = editedPresets.map((preset, index) => ({
      ...preset,
      order_index: index,
    }));
    onUpdateLabels(updatedPresets);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black bg-opacity-50" onClick={handleClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-[80] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col transition-transform border-t-2 border-[#FFA52F]/40"
        style={{ transform: modalCurrentY ? `translateY(${modalCurrentY}px)` : 'translateY(0)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-between px-6 py-4 border-b-2 border-white/80 cursor-grab active:cursor-grabbing"
          onTouchStart={handleModalTouchStart}
          onTouchMove={handleModalTouchMove}
          onTouchEnd={handleModalTouchEnd}
          onMouseDown={handleModalMouseDown}
          onMouseMove={modalStartY !== null ? handleModalMouseMove : undefined}
          onMouseUp={handleModalMouseUp}
          onMouseLeave={handleModalMouseUp}
        >
          <h3 className="text-lg font-bold text-gray-800">ラベルを編集</h3>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-3 relative px-4">
            {editedPresets.map((preset, index) => (
              <div
                key={preset.id}
                className={`p-4 flex items-center gap-3 transition-all bg-gray-50 rounded-2xl shadow-sm hover:shadow-md border-2 border-transparent ${
                  draggedIndex === index
                    ? 'opacity-70 z-10 scale-105 border-[#FFA52F]/40'
                    : 'hover:border-[#FFA52F]/20'
                }`}
                style={{
                  transform: draggedIndex === index ? `translateY(${draggedY}px)` : 'translateY(0)',
                  transition: draggedIndex === index ? 'none' : 'transform 0.2s',
                }}
              >
                <div
                  className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#FFA52F] transition-colors p-2 rounded-lg hover:bg-white"
                  onMouseDown={(e) => handleItemMouseDown(e, index)}
                  onTouchStart={(e) => handleItemTouchStart(e, index)}
                  onTouchMove={handleItemTouchMove}
                  onTouchEnd={handleItemTouchEnd}
                >
                  <GripVertical size={20} />
                </div>
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 shadow-md border-2 border-white"
                  style={{ backgroundColor: preset.color }}
                />
                <input
                  type="text"
                  value={preset.label}
                  onChange={(e) => handleLabelChange(preset.id, e.target.value)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-[#FFA52F] focus:ring-2 focus:ring-[#FFA52F]/20 text-[15px] font-medium bg-white shadow-sm transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t-2 border-white/80 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3.5 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-white/60 hover:border-gray-400 transition-all font-semibold shadow-sm hover:shadow-md"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3.5 bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white rounded-2xl hover:from-[#FF9520] hover:to-[#FF7A00] transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
};
