import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';
import { CompanyMemo } from '../types/company';

interface MemoEditorPageProps {
  memo: CompanyMemo | null;
  category: string;
  companyId: string;
  companyName: string;
  onSave: (content: string) => Promise<void>;
  onBack: () => void | Promise<void>;
}

export const MemoEditorPage = ({
  memo,
  category,
  companyId,
  companyName,
  onSave,
  onBack,
}: MemoEditorPageProps) => {
  const [content, setContent] = useState(memo?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [initialMemoId] = useState(memo?.id);

  useEffect(() => {
    if (memo?.id !== initialMemoId) {
      setContent(memo?.content || '');
    }
  }, [memo, initialMemoId]);

  const handleBack = async () => {
    if (content !== (memo?.content || '')) {
      setIsSaving(true);
      try {
        await onSave(content);
      } catch (error) {
        console.error('保存エラー:', error);
      } finally {
        setIsSaving(false);
      }
    }
    await onBack();
  };

  const charCount = useMemo(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length;
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  useEffect(() => {
    const autoSaveTimer = setTimeout(async () => {
      if (content !== (memo?.content || '')) {
        setIsSaving(true);
        try {
          await onSave(content);
        } catch (error) {
          console.error('保存エラー:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, memo?.content, onSave]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{category}</h1>
            <p className="text-xs text-gray-500">{companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-xs text-[#FFA52F] font-medium">保存中...</span>
          )}
          <span className="text-xs text-gray-500">{charCount}文字</span>
        </div>
      </div>

      <div className="flex-1 bg-white mx-4 my-4 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <RichTextEditor
          key={memo?.id || 'new'}
          value={content}
          onChange={handleContentChange}
          placeholder="メモを入力..."
        />
      </div>
    </div>
  );
};
