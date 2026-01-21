import { useState } from 'react';
import { Pencil, ChevronRight, Plus } from 'lucide-react';
import { CompanyMemo } from '../../types/company';

interface CompanyMemosBlockProps {
  memos: CompanyMemo[];
  onSelectMemo: (memo: CompanyMemo | null, category: string) => void;
}

type Category = '企業研究' | '面接対策' | 'ES';

const fixedCategories: Category[] = ['企業研究', '面接対策', 'ES'];

export const CompanyMemosBlock = ({
  memos,
  onSelectMemo,
}: CompanyMemosBlockProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMemoTitle, setNewMemoTitle] = useState('');

  const getPreviewText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.trim();
  };

  const getMemoForCategory = (category: string): CompanyMemo | undefined => {
    return memos.find((m) => m.category === category && !m.is_deleted);
  };

  const customMemos = memos.filter(
    (m) => !fixedCategories.includes(m.category as Category) && !m.is_deleted
  );

  const handleAddNewMemo = () => {
    if (newMemoTitle.trim()) {
      onSelectMemo(null, newMemoTitle.trim());
      setNewMemoTitle('');
      setIsAddingNew(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">選考対策メモ</h3>
        <button
          onClick={() => setIsAddingNew(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Plus size={18} className="text-[#FFA52F]" />
        </button>
      </div>

      <div className="p-4 space-y-2">
        {fixedCategories.map((category) => {
          const memo = getMemoForCategory(category);
          const previewText = memo ? getPreviewText(memo.content) : '';

          return (
            <button
              key={category}
              onClick={() => onSelectMemo(memo || null, category)}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-[#FFA52F] hover:bg-orange-50 transition-all text-left group"
            >
              <Pencil size={20} className="text-[#FFA52F] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">{category}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {previewText || 'メモを追加...'}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0 group-hover:text-[#FFA52F] transition-colors" />
            </button>
          );
        })}

        {customMemos.map((memo) => {
          const previewText = getPreviewText(memo.content);

          return (
            <button
              key={memo.id}
              onClick={() => onSelectMemo(memo, memo.category)}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-[#FFA52F] hover:bg-orange-50 transition-all text-left group"
            >
              <Pencil size={20} className="text-[#FFA52F] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">{memo.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {previewText || 'メモを追加...'}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0 group-hover:text-[#FFA52F] transition-colors" />
            </button>
          );
        })}

        {isAddingNew && (
          <div className="border border-[#FFA52F] rounded-xl p-3 bg-orange-50">
            <input
              type="text"
              placeholder="メモのタイトルを入力"
              value={newMemoTitle}
              onChange={(e) => setNewMemoTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddNewMemo();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA52F] focus:border-transparent mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewMemoTitle('');
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddNewMemo}
                disabled={!newMemoTitle.trim()}
                className="flex-1 px-3 py-2 bg-[#FFA52F] text-white rounded-lg text-sm font-medium hover:bg-[#FF8F0F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                作成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
