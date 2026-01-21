import { useState } from 'react';
import { Pencil, Save, Plus, Trash2 } from 'lucide-react';
import { CompanyNote, CustomField } from '../../types/company';

interface CustomFieldsBlockProps {
  companyNote: CompanyNote;
  onUpdate: (updates: Partial<CompanyNote>) => void;
}

export const CustomFieldsBlock = ({ companyNote, onUpdate }: CustomFieldsBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState<CustomField[]>(
    companyNote.custom_fields || []
  );

  const handleSave = () => {
    onUpdate({ custom_fields: fields });
    setIsEditing(false);
  };

  const handleAddField = () => {
    if (fields.length >= 4) return;
    setFields([...fields, { label: '', value: '' }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleUpdateField = (
    index: number,
    key: 'label' | 'value',
    value: string
  ) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">独自項目</h3>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isEditing ? (
            <Save size={18} className="text-[#FFA52F]" />
          ) : (
            <Pencil size={18} className="text-gray-500" />
          )}
        </button>
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) =>
                      handleUpdateField(index, 'label', e.target.value)
                    }
                    placeholder="項目名"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA52F] focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) =>
                      handleUpdateField(index, 'value', e.target.value)
                    }
                    placeholder="値"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA52F] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => handleRemoveField(index)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors self-start"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            ))}
            {fields.length < 4 && (
              <button
                onClick={handleAddField}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#FFA52F] hover:text-[#FFA52F] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                項目を追加 ({fields.length}/4)
              </button>
            )}
          </div>
        ) : fields.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            独自項目が設定されていません
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index}>
                <p className="text-xs text-gray-500 mb-1">{field.label || '項目名なし'}</p>
                <p className="text-sm text-gray-900">{field.value || '値なし'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
