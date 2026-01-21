import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const EditModal = ({ isOpen, onClose, title, children, footer }: EditModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50">
      <div
        className="w-full bg-white rounded-t-3xl shadow-xl flex flex-col"
        style={{ height: '95%' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="border-t border-gray-200 p-4 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
