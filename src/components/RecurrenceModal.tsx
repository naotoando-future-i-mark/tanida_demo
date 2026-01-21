import { useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';

export interface RecurrenceConfig {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  customType?: 'day' | 'week' | 'month' | 'year';
  days?: number[];
  monthlyType?: 'day_of_month' | 'day_of_week';
  monthlyDay?: number;
  monthlyWeekday?: number;
  endType: 'never' | 'count' | 'date';
  endCount?: number;
  endDate?: string;
}

interface RecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RecurrenceConfig;
  onSave: (config: RecurrenceConfig) => void;
  startDate?: string;
}

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];
const CUSTOM_TYPES = [
  { value: 'day', label: '日' },
  { value: 'week', label: '週' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];

export const RecurrenceModal = ({ isOpen, onClose, config, onSave, startDate }: RecurrenceModalProps) => {
  const [localConfig, setLocalConfig] = useState<RecurrenceConfig>(config);
  const [showCustom, setShowCustom] = useState(config.type === 'custom');

  if (!isOpen) return null;

  const getDateInfo = () => {
    if (!startDate) return { dayOfMonth: 1, weekday: 0, weekOfMonth: 1 };

    const date = new Date(startDate);
    const dayOfMonth = date.getDate();
    const weekday = (date.getDay() + 6) % 7;
    const weekOfMonth = Math.ceil(dayOfMonth / 7);

    return { dayOfMonth, weekday, weekOfMonth };
  };

  const { dayOfMonth, weekday, weekOfMonth } = getDateInfo();

  const handleTypeSelect = (type: RecurrenceConfig['type']) => {
    if (type === 'custom') {
      setShowCustom(true);
      const newConfig: RecurrenceConfig = { ...localConfig, type, customType: 'day' };
      setLocalConfig(newConfig);
    } else {
      setLocalConfig({ ...localConfig, type });
      if (type !== 'custom') {
        onSave({ ...localConfig, type });
        onClose();
      }
    }
  };

  const handleCustomTypeChange = (customType: 'day' | 'week' | 'month' | 'year') => {
    const newConfig = { ...localConfig, customType };
    if (customType === 'week' && (!localConfig.days || localConfig.days.length === 0)) {
      newConfig.days = [weekday];
    }
    setLocalConfig(newConfig);
  };

  const handleCustomSave = () => {
    onSave(localConfig);
    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    const days = localConfig.days || [];
    const newDays = days.includes(dayIndex)
      ? days.filter(d => d !== dayIndex)
      : [...days, dayIndex].sort();
    setLocalConfig({ ...localConfig, days: newDays });
  };

  const handleClose = () => {
    setShowCustom(false);
    onClose();
  };

  const getIntervalText = () => {
    const interval = localConfig.interval;
    const type = localConfig.customType || 'day';
    const labels: Record<string, string> = {
      day: '日',
      week: '週',
      month: 'か月',
      year: '年',
    };
    return `${interval}${labels[type]}ごと`;
  };

  if (showCustom) {
    return (
      <>
        <div className="fixed inset-0 z-[90] bg-black bg-opacity-50" onClick={handleClose} />
        <div
          className="fixed inset-x-0 bottom-0 z-[90] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col border-t-2 border-[#FFA52F]/40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex items-center justify-between px-6 py-4 border-b-2 border-gray-100">
            <button onClick={() => setShowCustom(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
              <ChevronLeft size={22} />
            </button>
            <h3 className="text-lg font-bold text-gray-800">繰り返し</h3>
            <button
              onClick={handleCustomSave}
              className="px-4 py-2 text-[#FFA52F] font-semibold hover:bg-orange-50 rounded-xl transition-all"
            >
              保存
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="inline-block bg-gray-200 rounded-full p-1">
              <span className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-white rounded-full shadow-sm">
                カスタム
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pb-4">
              <div className="grid grid-cols-4 gap-2 mb-6">
                {CUSTOM_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleCustomTypeChange(type.value as any)}
                    className={`py-2.5 rounded-xl font-medium transition-all ${
                      localConfig.customType === type.value
                        ? 'bg-[#FFA52F] text-white shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FFA52F]/40'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">頻度</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLocalConfig({ ...localConfig, interval: Math.max(1, localConfig.interval - 1) })}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border-2 border-gray-200 text-gray-700 hover:border-[#FFA52F] transition-all"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-gray-900 min-w-[80px] text-center">{getIntervalText()}</span>
                    <button
                      onClick={() => setLocalConfig({ ...localConfig, interval: localConfig.interval + 1 })}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border-2 border-gray-200 text-gray-700 hover:border-[#FFA52F] transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {localConfig.customType === 'week' && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">間隔</div>
                  <div className="grid grid-cols-7 gap-2">
                    {WEEKDAYS.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => toggleDay(index)}
                        className={`w-10 h-10 rounded-full font-medium transition-all ${
                          localConfig.days?.includes(index)
                            ? 'bg-[#FFA52F] text-white shadow-md'
                            : 'bg-white text-gray-700 border-2 border-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {localConfig.customType === 'month' && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">基準</div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setLocalConfig({ ...localConfig, monthlyType: 'day_of_month', monthlyDay: dayOfMonth })}
                      className={`w-full p-3 text-left rounded-xl transition-all flex items-center justify-between ${
                        localConfig.monthlyType === 'day_of_month'
                          ? 'bg-white border-2 border-[#FFA52F]'
                          : 'bg-white border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className="text-sm text-gray-700">毎月{dayOfMonth}日に繰り返す</span>
                      {localConfig.monthlyType === 'day_of_month' && (
                        <div className="text-[#FFA52F]">✓</div>
                      )}
                    </button>
                    <button
                      onClick={() => setLocalConfig({ ...localConfig, monthlyType: 'day_of_week', monthlyDay: weekOfMonth, monthlyWeekday: weekday })}
                      className={`w-full p-3 text-left rounded-xl transition-all flex items-center justify-between ${
                        localConfig.monthlyType === 'day_of_week' && localConfig.monthlyDay !== -1
                          ? 'bg-white border-2 border-[#FFA52F]'
                          : 'bg-white border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className="text-sm text-gray-700">毎月第{weekOfMonth}{WEEKDAYS[weekday]}曜日に繰り返す</span>
                      {localConfig.monthlyType === 'day_of_week' && localConfig.monthlyDay !== -1 && (
                        <div className="text-[#FFA52F]">✓</div>
                      )}
                    </button>
                    <button
                      onClick={() => setLocalConfig({ ...localConfig, monthlyType: 'day_of_week', monthlyDay: -1, monthlyWeekday: weekday })}
                      className={`w-full p-3 text-left rounded-xl transition-all flex items-center justify-between ${
                        localConfig.monthlyType === 'day_of_week' && localConfig.monthlyDay === -1
                          ? 'bg-white border-2 border-[#FFA52F]'
                          : 'bg-white border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className="text-sm text-gray-700">毎月最終{WEEKDAYS[weekday]}曜日に繰り返す</span>
                      {localConfig.monthlyType === 'day_of_week' && localConfig.monthlyDay === -1 && (
                        <div className="text-[#FFA52F]">✓</div>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 px-1">
                    {dayOfMonth > 28 && '日付がない月は最終日に繰り返されます'}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm font-medium text-gray-700 mb-3">期限</div>
                <div className="space-y-3">
                  <button
                    onClick={() => setLocalConfig({ ...localConfig, endType: 'never', endCount: undefined, endDate: undefined })}
                    className={`w-full p-3 text-left rounded-xl transition-all flex items-center justify-between ${
                      localConfig.endType === 'never'
                        ? 'bg-white border-2 border-[#FFA52F]'
                        : 'bg-white border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <span className="text-sm text-gray-700">なし</span>
                    {localConfig.endType === 'never' && (
                      <div className="text-[#FFA52F]">✓</div>
                    )}
                  </button>

                  <div>
                    <button
                      onClick={() => setLocalConfig({ ...localConfig, endType: 'count', endCount: localConfig.endCount || 10, endDate: undefined })}
                      className={`w-full p-3 text-left rounded-xl transition-all flex items-center justify-between ${
                        localConfig.endType === 'count'
                          ? 'bg-white border-2 border-[#FFA52F]'
                          : 'bg-white border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className="text-sm text-gray-700">繰り返し回数を指定する</span>
                      {localConfig.endType === 'count' && (
                        <div className="text-[#FFA52F]">✓</div>
                      )}
                    </button>
                    {localConfig.endType === 'count' && (
                      <div className="mt-2 px-3 py-2 bg-white rounded-xl border-2 border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">回数</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setLocalConfig({ ...localConfig, endCount: Math.max(1, (localConfig.endCount || 10) - 1) })}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-[#FFA52F] transition-all"
                            >
                              −
                            </button>
                            <span className="text-sm font-medium text-gray-900 min-w-[60px] text-center">{localConfig.endCount || 10}回</span>
                            <button
                              onClick={() => setLocalConfig({ ...localConfig, endCount: (localConfig.endCount || 10) + 1 })}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-[#FFA52F] transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        const defaultDate = new Date();
                        defaultDate.setMonth(defaultDate.getMonth() + 1);
                        const dateStr = defaultDate.toISOString().split('T')[0];
                        setLocalConfig({ ...localConfig, endType: 'date', endDate: localConfig.endDate || dateStr, endCount: undefined });
                      }}
                      className={`w-full p-3 text-left rounded-xl transition-all flex items-center justify-between ${
                        localConfig.endType === 'date'
                          ? 'bg-white border-2 border-[#FFA52F]'
                          : 'bg-white border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className="text-sm text-gray-700">終了日を指定する</span>
                      {localConfig.endType === 'date' && (
                        <div className="text-[#FFA52F]">✓</div>
                      )}
                    </button>
                    {localConfig.endType === 'date' && (
                      <div className="mt-2 px-3 py-2 bg-white rounded-xl border-2 border-gray-200">
                        <input
                          type="date"
                          value={localConfig.endDate || ''}
                          onChange={(e) => setLocalConfig({ ...localConfig, endDate: e.target.value })}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#FFA52F] focus:ring-2 focus:ring-[#FFA52F]/20 transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black bg-opacity-50" onClick={handleClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-[90] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col border-t-2 border-[#FFA52F]/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-between px-6 py-4 border-b-2 border-gray-100">
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
            <X size={22} />
          </button>
          <h3 className="text-lg font-bold text-gray-800">繰り返し</h3>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-[#FFA52F] font-semibold hover:bg-orange-50 rounded-xl transition-all"
          >
            保存
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <div className="space-y-2 px-4">
            <button
              onClick={() => handleTypeSelect('none')}
              className={`w-full px-5 py-3.5 text-left rounded-2xl transition-all flex items-center justify-between ${
                localConfig.type === 'none'
                  ? 'bg-orange-50 border-2 border-[#FFA52F]'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <span className="text-[15px] font-medium text-gray-800">しない</span>
            </button>
            <button
              onClick={() => handleTypeSelect('daily')}
              className={`w-full px-5 py-3.5 text-left rounded-2xl transition-all flex items-center justify-between ${
                localConfig.type === 'daily'
                  ? 'bg-orange-50 border-2 border-[#FFA52F]'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <span className="text-[15px] font-medium text-gray-800">毎日</span>
            </button>
            <button
              onClick={() => handleTypeSelect('weekly')}
              className={`w-full px-5 py-3.5 text-left rounded-2xl transition-all flex items-center justify-between ${
                localConfig.type === 'weekly'
                  ? 'bg-orange-50 border-2 border-[#FFA52F]'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <span className="text-[15px] font-medium text-gray-800">毎週</span>
            </button>
            <button
              onClick={() => handleTypeSelect('monthly')}
              className={`w-full px-5 py-3.5 text-left rounded-2xl transition-all flex items-center justify-between ${
                localConfig.type === 'monthly'
                  ? 'bg-orange-50 border-2 border-[#FFA52F]'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <span className="text-[15px] font-medium text-gray-800">毎月</span>
            </button>
            <button
              onClick={() => handleTypeSelect('yearly')}
              className={`w-full px-5 py-3.5 text-left rounded-2xl transition-all flex items-center justify-between ${
                localConfig.type === 'yearly'
                  ? 'bg-orange-50 border-2 border-[#FFA52F]'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <span className="text-[15px] font-medium text-gray-800">毎年</span>
            </button>
            <div className="h-8" />
            <button
              onClick={() => handleTypeSelect('custom')}
              className={`w-full px-5 py-3.5 text-left rounded-2xl transition-all flex items-center justify-between ${
                localConfig.type === 'custom'
                  ? 'bg-orange-50 border-2 border-[#FFA52F]'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <span className="text-[15px] font-medium text-gray-800">カスタム</span>
              {localConfig.type === 'custom' && (
                <div className="text-[#FFA52F]">✓</div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
