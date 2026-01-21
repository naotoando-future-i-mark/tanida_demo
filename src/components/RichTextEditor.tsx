import { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Type, Palette, Check } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');

  const colors = [
    '#000000', '#4B5563', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  ];

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    // Enable styleWithCSS for better color handling
    document.execCommand('styleWithCSS', false, 'true');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showColorPicker && !target.closest('.color-picker-container')) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  const updateFormatStates = () => {
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
    } catch (e) {
      // queryCommandState may fail in some cases
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && editor.contains(selection.anchorNode)) {
        updateFormatStates();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateFormatStates();
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
    updateFormatStates();
  };

  const toggleFontSize = (size: 'small' | 'normal' | 'large') => {
    setFontSize(size);
    const sizeValue = {
      small: '1',
      normal: '3',
      large: '5',
    };
    applyFormat('fontSize', sizeValue[size]);
  };

  const applyColor = (color: string) => {
    setCurrentColor(color);
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);

    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
    setShowColorPicker(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className={`p-2 rounded-lg transition-colors ${
            isBold
              ? 'bg-[#FFA52F] text-white'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="太字"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className={`p-2 rounded-lg transition-colors ${
            isItalic
              ? 'bg-[#FFA52F] text-white'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="イタリック"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('underline')}
          className={`p-2 rounded-lg transition-colors ${
            isUnderline
              ? 'bg-[#FFA52F] text-white'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="下線"
        >
          <Underline size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          <Type size={18} className="text-gray-700" />
          <select
            value={fontSize}
            onChange={(e) => toggleFontSize(e.target.value as 'small' | 'normal' | 'large')}
            className="text-sm border-none bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="small">小</option>
            <option value="normal">標準</option>
            <option value="large">大</option>
          </select>
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <div className="relative color-picker-container">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors relative"
            title="文字色"
          >
            <Palette size={18} className="text-gray-700" />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: currentColor }}
            />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-colors relative ${
                      currentColor === color
                        ? 'border-[#FFA52F] ring-2 ring-[#FFA52F] ring-opacity-30'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {currentColor === color && (
                      <Check
                        size={16}
                        className="absolute inset-0 m-auto text-white drop-shadow-lg"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && currentColor !== '#000000') {
            // After Enter, immediately apply the color to the new line
            setTimeout(() => {
              document.execCommand('styleWithCSS', false, 'true');
              document.execCommand('foreColor', false, currentColor);
              if (editorRef.current) {
                editorRef.current.focus();
              }
            }, 0);
          }
        }}
        className="flex-1 p-4 pb-[25vh] focus:outline-none overflow-y-auto"
        style={{ minHeight: '200px' }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        [contenteditable] {
          line-height: 1.6;
        }
        [contenteditable] * {
          line-height: inherit;
        }
      `}</style>
    </div>
  );
};
