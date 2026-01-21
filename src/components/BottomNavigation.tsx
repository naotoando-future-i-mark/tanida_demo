import { Calendar, Settings, User, Plus, BookText } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: 'calendar' | 'notes';
  onAddClick: () => void;
  onPageChange: (page: 'calendar' | 'notes') => void;
}

export const BottomNavigation = ({ currentPage, onAddClick, onPageChange }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50">
      <div className="h-full flex items-center justify-around max-w-screen-xl mx-auto">
        <button
          onClick={() => onPageChange('calendar')}
          className="flex flex-col items-center justify-center flex-1 h-full transition-colors hover:bg-gray-50"
        >
          <Calendar size={22} className={currentPage === 'calendar' ? 'text-[#FFA52F] mb-1' : 'text-gray-400 mb-1'} />
          <span className={`text-[10px] font-medium ${currentPage === 'calendar' ? 'text-[#FFA52F]' : 'text-gray-400'}`}>カレンダー</span>
        </button>

        <button
          onClick={() => onPageChange('notes')}
          className="flex flex-col items-center justify-center flex-1 h-full transition-colors hover:bg-gray-50"
        >
          <BookText size={22} className={currentPage === 'notes' ? 'text-[#FFA52F] mb-1' : 'text-gray-400 mb-1'} />
          <span className={`text-[10px] font-medium ${currentPage === 'notes' ? 'text-[#FFA52F]' : 'text-gray-400'}`}>就活ノート</span>
        </button>

        <button
          onClick={onAddClick}
          className="flex flex-col items-center justify-center flex-1 h-full transition-colors hover:bg-gray-50"
        >
          <Plus size={22} className="text-[#FFA52F] mb-1" />
          <span className="text-[10px] font-medium text-[#FFA52F]">新規追加</span>
        </button>

        <button className="flex flex-col items-center justify-center flex-1 h-full transition-colors hover:bg-gray-50">
          <Settings size={22} className="text-gray-400 mb-1" />
          <span className="text-[10px] font-medium text-gray-400">設定</span>
        </button>
      </div>
    </div>
  );
};
