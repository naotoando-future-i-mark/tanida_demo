import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Calendar, Clock, Pencil, Trash2, CalendarPlus, CheckCircle2, X } from 'lucide-react';
import { SelectionEvent, SelectionProgress } from '../../types/company';
import { AddEventModal } from '../AddEventModal';
import { Event } from '../../types/event';
import { supabase } from '../../lib/supabase';

interface SelectionTabProps {
  companyNoteId: string;
  companyName: string;
  events: SelectionEvent[];
  progress: SelectionProgress[];
  onAddEvent: (event: Omit<SelectionEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<string | null>;
  onUpdateEvent: (eventId: string, updates: Partial<SelectionEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddProgress: (progress: Omit<SelectionProgress, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateProgress: (progressId: string, updates: Partial<SelectionProgress>) => void;
  onDeleteProgress: (progressId: string) => void;
}

type Track = 'intern' | 'fulltime';

const getStorageKey = (companyNoteId: string) => `selection-tab-${companyNoteId}`;

export const SelectionTab = ({
  companyNoteId,
  companyName,
  events,
  progress,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddProgress,
  onUpdateProgress,
  onDeleteProgress,
}: SelectionTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track>(() => {
    const saved = localStorage.getItem(getStorageKey(companyNoteId));
    return (saved === 'fulltime' ? 'fulltime' : 'intern') as Track;
  });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingProgressId, setEditingProgressId] = useState<string | null>(null);
  const [dateType, setDateType] = useState<'deadline' | 'schedule'>('schedule');
  const [formData, setFormData] = useState({
    event_type: '',
    title: '',
    deadline_date: '',
    deadline_time: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    status: 'pending' as 'pending' | 'completed',
    memo: '',
    calendar_event_id: '',
  });
  const [progressFormData, setProgressFormData] = useState({
    stage: '',
  });
  const [createCalendarEvent, setCreateCalendarEvent] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [existingCalendarEvent, setExistingCalendarEvent] = useState<Event | undefined>(undefined);
  const [newlyCreatedEventId, setNewlyCreatedEventId] = useState<string | null>(null);
  const [timeDiffMinutes, setTimeDiffMinutes] = useState<number>(60);
  const [defaultColorId, setDefaultColorId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem(getStorageKey(companyNoteId), selectedTrack);
  }, [selectedTrack, companyNoteId]);

  useEffect(() => {
    const fetchDefaultColor = async () => {
      const { data, error } = await supabase
        .from('color_presets')
        .select('id')
        .order('order_index')
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setDefaultColorId(data.id);
      }
    };

    fetchDefaultColor();
  }, []);

  const handleAddEvent = async () => {
    if (!formData.title.trim()) return;
    if (dateType === 'deadline' && !formData.deadline_date) return;
    if (dateType === 'schedule' && (!formData.start_date || !formData.end_date)) return;

    const newEventId = await onAddEvent({
      company_note_id: companyNoteId,
      track_type: selectedTrack,
      event_type: formData.event_type,
      title: formData.title,
      date_type: dateType,
      deadline_date: formData.deadline_date || undefined,
      deadline_time: formData.deadline_time || undefined,
      start_date: formData.start_date || undefined,
      start_time: formData.start_time || undefined,
      end_date: formData.end_date || undefined,
      end_time: formData.end_time || undefined,
      status: formData.status,
      memo: formData.memo,
    });

    if (createCalendarEvent && newEventId) {
      setNewlyCreatedEventId(newEventId);
      setShowAddModal(false);
      setShowLoadingModal(true);
      setTimeout(() => {
        setShowLoadingModal(false);
        setShowCalendarModal(true);
      }, 800);
    } else {
      setFormData({
        event_type: '',
        title: '',
        deadline_date: '',
        deadline_time: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        status: 'pending',
        memo: '',
        calendar_event_id: '',
      });
      setCreateCalendarEvent(true);
      setShowAddModal(false);
    }
  };

  const handleEditEvent = (event: SelectionEvent) => {
    setEditingEventId(event.id);
    setSelectedTrack(event.track_type);
    setDateType(event.date_type || 'deadline');

    if (event.start_time && event.end_time) {
      const [startHours, startMinutes] = event.start_time.split(':').map(Number);
      const [endHours, endMinutes] = event.end_time.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const diff = endTotalMinutes - startTotalMinutes;
      setTimeDiffMinutes(diff > 0 ? diff : diff + 24 * 60);
    }

    setFormData({
      event_type: event.event_type,
      title: event.title,
      deadline_date: event.deadline_date,
      deadline_time: event.deadline_time || '',
      start_date: event.start_date || '',
      start_time: event.start_time || '',
      end_date: event.end_date || '',
      end_time: event.end_time || '',
      status: event.status,
      memo: event.memo,
      calendar_event_id: event.calendar_event_id || '',
    });
    setShowAddModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEventId) return;
    if (!formData.title.trim()) return;
    if (dateType === 'deadline' && !formData.deadline_date) return;
    if (dateType === 'schedule' && (!formData.start_date || !formData.end_date)) return;

    onUpdateEvent(editingEventId, {
      track_type: selectedTrack,
      event_type: formData.event_type,
      title: formData.title,
      date_type: dateType,
      deadline_date: formData.deadline_date || undefined,
      deadline_time: formData.deadline_time || undefined,
      start_date: formData.start_date || undefined,
      start_time: formData.start_time || undefined,
      end_date: formData.end_date || undefined,
      end_time: formData.end_time || undefined,
      status: formData.status,
      memo: formData.memo,
    });

    if (createCalendarEvent) {
      setShowAddModal(false);
      setShowLoadingModal(true);

      if (formData.calendar_event_id) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', formData.calendar_event_id)
          .single();

        if (!error && data) {
          const updatedEvent = { ...data } as Event;

          if (dateType === 'deadline') {
            updatedEvent.deadline_at = formData.deadline_date;
          } else {
            updatedEvent.start_at = formData.start_date + (formData.start_time ? `T${formData.start_time}` : '');
            updatedEvent.end_at = (formData.end_date || formData.start_date) + (formData.end_time ? `T${formData.end_time}` : '');
            updatedEvent.all_day = !formData.start_time && !formData.end_time;
          }

          updatedEvent.title = formData.title;
          updatedEvent.memo = formData.memo;

          setExistingCalendarEvent(updatedEvent);
        }
      } else {
        setExistingCalendarEvent(undefined);
      }

      setTimeout(() => {
        setShowLoadingModal(false);
        setShowCalendarModal(true);
      }, 800);
    } else {
      setEditingEventId(null);
      setTimeDiffMinutes(60);
      setFormData({
        event_type: '',
        title: '',
        deadline_date: '',
        deadline_time: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        status: 'pending',
        memo: '',
        calendar_event_id: '',
      });
      setCreateCalendarEvent(true);
      setShowAddModal(false);
    }
  };

  const handleSaveCalendarEvent = async (event: Omit<Event, 'id'>) => {
    const { preparation_dates, notifications, ...eventData } = event as any;

    const { error, data } = await supabase.from('events').insert([eventData]).select();

    if (!error && data) {
      const calendarEventId = data[0].id;

      if (preparation_dates && preparation_dates.length > 0) {
        await supabase.from('preparation_dates').insert(
          preparation_dates.map((pd: any) => ({
            event_id: calendarEventId,
            date: pd.date,
            title: pd.title,
          }))
        );
      }

      const eventIdToUpdate = editingEventId || newlyCreatedEventId;
      if (eventIdToUpdate) {
        await supabase
          .from('selection_events')
          .update({ calendar_event_id: calendarEventId })
          .eq('id', eventIdToUpdate);
      }

      setTimeDiffMinutes(60);
      setFormData({
        event_type: '',
        title: '',
        deadline_date: '',
        deadline_time: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        status: 'pending',
        memo: '',
        calendar_event_id: '',
      });
      setExistingCalendarEvent(undefined);
      setCreateCalendarEvent(true);
      setShowCalendarModal(false);
      setShowAddModal(false);
      setEditingEventId(null);
      setNewlyCreatedEventId(null);
    }
  };

  const handleUpdateCalendarEvent = async (event: Event) => {
    const { preparation_dates, ...eventData } = event as any;

    const { error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        start_at: eventData.start_at,
        end_at: eventData.end_at,
        all_day: eventData.all_day,
        color_id: eventData.color_id,
        event_type: eventData.event_type,
        company_name: eventData.company_name,
        deadline_at: eventData.deadline_at,
        location: eventData.location,
        meeting_url: eventData.meeting_url,
        memo: eventData.memo,
        recurrence_type: eventData.recurrence_type,
        recurrence_interval: eventData.recurrence_interval,
        recurrence_days: eventData.recurrence_days,
        recurrence_monthly_type: eventData.recurrence_monthly_type,
        recurrence_monthly_day: eventData.recurrence_monthly_day,
        recurrence_monthly_weekday: eventData.recurrence_monthly_weekday,
        recurrence_end_type: eventData.recurrence_end_type,
        recurrence_end_count: eventData.recurrence_end_count,
        recurrence_end_date: eventData.recurrence_end_date,
        notifications: eventData.notifications,
      })
      .eq('id', event.id);

    if (!error) {
      await supabase.from('preparation_dates').delete().eq('event_id', event.id);

      if (preparation_dates && preparation_dates.length > 0) {
        await supabase.from('preparation_dates').insert(
          preparation_dates.map((pd: any) => ({
            event_id: event.id,
            date: pd.date,
            title: pd.title,
          }))
        );
      }

      setTimeDiffMinutes(60);
      setFormData({
        event_type: '',
        title: '',
        deadline_date: '',
        deadline_time: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        status: 'pending',
        memo: '',
        calendar_event_id: '',
      });
      setExistingCalendarEvent(undefined);
      setCreateCalendarEvent(true);
      setShowCalendarModal(false);
      setShowAddModal(false);
      setEditingEventId(null);
    }
  };

  const handleCloseCalendarModal = () => {
    setShowCalendarModal(false);
    setTimeDiffMinutes(60);
    setFormData({
      event_type: '',
      title: '',
      deadline_date: '',
      deadline_time: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      status: 'pending',
      memo: '',
      calendar_event_id: '',
    });
    setExistingCalendarEvent(undefined);
    setCreateCalendarEvent(true);
    setShowAddModal(false);
    setEditingEventId(null);
    setNewlyCreatedEventId(null);
  };

  const handleAddProgress = () => {
    if (!progressFormData.stage.trim()) return;

    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    onAddProgress({
      company_note_id: companyNoteId,
      track_type: selectedTrack,
      stage: progressFormData.stage,
      passed_date: localDate,
      notes: '',
    });

    setProgressFormData({
      stage: '',
    });
    setShowAddProgressModal(false);
  };

  const handleEditProgress = (prog: SelectionProgress) => {
    setEditingProgressId(prog.id);
    setProgressFormData({
      stage: prog.stage,
    });
    setShowAddProgressModal(true);
  };

  const handleUpdateProgress = () => {
    if (!editingProgressId) return;
    if (!progressFormData.stage.trim()) return;

    onUpdateProgress(editingProgressId, {
      stage: progressFormData.stage,
    });

    setEditingProgressId(null);
    setProgressFormData({
      stage: '',
    });
    setShowAddProgressModal(false);
  };

  const internEvents = events.filter((e) => e.track_type === 'intern');
  const fulltimeEvents = events.filter((e) => e.track_type === 'fulltime');
  const currentTrackEvents = selectedTrack === 'intern' ? internEvents : fulltimeEvents;

  const internProgress = progress.filter((p) => p.track_type === 'intern');
  const fulltimeProgress = progress.filter((p) => p.track_type === 'fulltime');
  const currentTrackProgress = selectedTrack === 'intern' ? internProgress : fulltimeProgress;

  return (
    <div className="h-full overflow-y-auto px-4 py-4 pb-24">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedTrack('intern')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            selectedTrack === 'intern'
              ? 'bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          インターン
        </button>
        <button
          onClick={() => setSelectedTrack('fulltime')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            selectedTrack === 'fulltime'
              ? 'bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          本選考
        </button>
      </div>

      {/* Selection Progress Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">通過した選考</h3>
          <button
            onClick={() => setShowAddProgressModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus size={18} className="text-[#FFA52F]" />
          </button>
        </div>

        <div className="p-4">
          {currentTrackProgress.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              通過した選考がありません
            </p>
          ) : (
            <div className="relative space-y-0">
              {currentTrackProgress.map((prog, index) => {
                const isLatest = index === 0;
                const isLast = index === currentTrackProgress.length - 1;
                const passedDate = new Date(prog.passed_date);
                const formattedDate = `${passedDate.getMonth() + 1}/${passedDate.getDate()}`;

                return (
                  <div key={prog.id} className="group relative flex items-center gap-3 py-2.5">
                    {/* Timeline connector */}
                    <div className="relative flex flex-col items-center">
                      {/* Circle indicator */}
                      <div className={`relative z-10 flex items-center justify-center rounded-full transition-all ${
                        isLatest
                          ? 'w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 shadow-md shadow-green-200'
                          : 'w-5 h-5 bg-gradient-to-br from-gray-300 to-gray-400'
                      }`}>
                        <CheckCircle2
                          size={isLatest ? 16 : 12}
                          className="text-white"
                          strokeWidth={3}
                        />
                      </div>
                      {/* Vertical line */}
                      {!isLast && (
                        <div className={`absolute w-0.5 h-full top-7 ${
                          isLatest
                            ? 'bg-gradient-to-b from-green-300 to-gray-200'
                            : 'bg-gray-200'
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all ${
                      isLatest
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50/50'
                        : 'bg-gray-50/50'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`font-bold transition-all ${
                          isLatest ? 'text-gray-900 text-base' : 'text-gray-600 text-sm'
                        }`}>
                          {prog.stage}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isLatest
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {formattedDate}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteProgress(prog.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                      >
                        <span className="text-red-500 text-sm font-bold">&times;</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selection Events Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">次の選考</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus size={18} className="text-[#FFA52F]" />
          </button>
        </div>

        <div className="p-4">
          {currentTrackEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              予定がありません
            </p>
          ) : (
            <div className="space-y-3">
              {currentTrackEvents.map((event) => {
                const dateStr = event.date_type === 'schedule' ? event.start_date : event.deadline_date;
                const date = new Date(dateStr || event.deadline_date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const timeStr = event.date_type === 'schedule' ? event.start_time : null;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const eventDate = new Date(dateStr || event.deadline_date);
                eventDate.setHours(0, 0, 0, 0);
                const isCompleted = eventDate < today;

                return (
                  <div key={event.id} className="relative">
                    <div
                      className={`relative rounded-xl border p-3 transition-all ${
                        isCompleted
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : 'bg-gradient-to-br from-gray-50 to-white border-gray-300 hover:border-[#FFA52F] hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <div className="text-center">
                            <div className="text-[10px] text-gray-500 font-medium leading-tight">{year}</div>
                            <div className="flex items-center gap-0.5">
                              <span className="text-3xl font-bold text-gray-800 leading-none">{month}</span>
                              <span className="text-xl text-gray-400 font-light leading-none">/</span>
                              <span className="text-3xl font-bold text-gray-800 leading-none">{day}</span>
                            </div>
                            {timeStr && (
                              <div className="flex items-center gap-0.5 justify-center mt-0.5">
                                <Clock size={10} className="text-gray-400" />
                                <span className="text-[10px] text-gray-600 font-medium">{timeStr}</span>
                              </div>
                            )}
                          </div>
                          <div className={`w-1 h-14 rounded-full ${
                            event.date_type === 'schedule'
                              ? 'bg-gradient-to-b from-green-500 to-green-600'
                              : 'bg-gradient-to-b from-[#FFA52F] to-[#FF8C00]'
                          }`}></div>
                        </div>

                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                event.date_type === 'schedule'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-[#FFA52F] bg-opacity-10 text-[#FFA52F]'
                              }`}>
                                {event.date_type === 'schedule' ? '日程' : '締切'}
                              </span>
                              {event.event_type && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                                  {event.event_type}
                                </span>
                              )}
                            </div>
                            <h4 className={`font-bold text-lg leading-tight ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {event.title}
                            </h4>
                            {event.memo && (
                              <p className="text-xs text-gray-600 whitespace-pre-wrap mt-1 line-clamp-2">
                                {event.memo}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0 items-start">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Pencil size={14} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => onDeleteEvent(event.id)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => {
          setShowAddModal(false);
          setEditingEventId(null);
          setDateType('schedule');
          setTimeDiffMinutes(60);
          setCreateCalendarEvent(true);
          setFormData({
            event_type: '',
            title: '',
            deadline_date: '',
            deadline_time: '',
            start_date: '',
            start_time: '',
            end_date: '',
            end_time: '',
            status: 'pending',
            memo: '',
            calendar_event_id: '',
          });
        }}>
          <div className="bg-white w-full h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-100 bg-gradient-to-r from-white via-orange-50/30 to-white">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEventId(null);
                  setDateType('schedule');
                  setTimeDiffMinutes(60);
                  setCreateCalendarEvent(true);
                  setFormData({
                    event_type: '',
                    title: '',
                    deadline_date: '',
                    deadline_time: '',
                    start_date: '',
                    start_time: '',
                    end_date: '',
                    end_time: '',
                    status: 'pending',
                    memo: '',
                    calendar_event_id: '',
                  });
                }}
                className="text-gray-600 text-base font-medium hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                onClick={editingEventId ? handleUpdateEvent : handleAddEvent}
                disabled={
                  !formData.title.trim() ||
                  (dateType === 'deadline' && !formData.deadline_date) ||
                  (dateType === 'schedule' && (!formData.start_date || !formData.end_date))
                }
                className="relative text-white text-base font-semibold disabled:opacity-50 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] shadow-md hover:shadow-lg disabled:shadow-none transition-all disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
              >
                {editingEventId ? '更新' : '追加'}
              </button>
            </div>

            <div className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="divide-y divide-gray-100">
                <div className="px-6 py-4 bg-gradient-to-r from-orange-50/40 to-amber-50/40 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <CalendarPlus size={18} className="text-[#FFA52F]" />
                      </div>
                      <span className="text-gray-700 font-medium text-sm">カレンダーを同時作成</span>
                    </div>
                    <button
                      onClick={() => setCreateCalendarEvent(!createCalendarEvent)}
                      className={`w-12 h-7 rounded-full transition-all duration-300 shadow-sm ${
                        createCalendarEvent ? 'bg-gradient-to-r from-[#FFA52F] to-[#FF8C00]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                          createCalendarEvent ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    選考種別 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTrack('intern')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all shadow-sm ${
                        selectedTrack === 'intern'
                          ? 'bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      インターン
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTrack('fulltime')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all shadow-sm ${
                        selectedTrack === 'fulltime'
                          ? 'bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      本選考
                    </button>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    次の選考を入力 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="例: エントリーシート締切、一次面接"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA52F] focus:border-transparent shadow-sm transition-all"
                  />
                </div>

                <div className="px-6 pt-5">
                  <div className="flex gap-0">
                    <button
                      type="button"
                      onClick={() => setDateType('schedule')}
                      className={`flex-1 py-3.5 px-6 text-base font-bold transition-all duration-200 relative ${
                        dateType === 'schedule'
                          ? 'bg-[#6FB96F] text-white z-10'
                          : 'bg-[#D8D8D8] text-gray-600 hover:bg-[#C8C8C8]'
                      }`}
                      style={{
                        borderRadius: '8px 8px 0 0',
                      }}
                    >
                      日程
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateType('deadline')}
                      className={`flex-1 py-3.5 px-6 text-base font-bold transition-all duration-200 relative ${
                        dateType === 'deadline'
                          ? 'bg-[#5B9BD5] text-white z-10'
                          : 'bg-[#D8D8D8] text-gray-600 hover:bg-[#C8C8C8]'
                      }`}
                      style={{
                        borderRadius: '8px 8px 0 0',
                      }}
                    >
                      締切
                    </button>
                  </div>
                </div>

                {dateType === 'schedule' ? (
                  <div className="relative px-6 pt-5 pb-5 bg-gradient-to-br from-green-50/50 via-emerald-50/50 to-teal-50/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-transparent rounded-full blur-2xl"></div>
                    <div className="relative space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">開始日時</label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="relative p-2 bg-white rounded-lg shadow-sm">
                              <Calendar size={20} className="text-green-600" />
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => {
                                  const newStartDate = e.target.value;
                                  setFormData({
                                    ...formData,
                                    start_date: newStartDate,
                                    end_date: newStartDate,
                                  });
                                }}
                                className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white shadow-sm transition-all"
                              />
                              {formData.start_date && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, start_date: '' })}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <X size={16} className="text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="relative p-2 bg-white rounded-lg shadow-sm">
                              <Clock size={20} className="text-gray-400" />
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="time"
                                step="3600"
                                value={formData.start_time}
                                onFocus={(e) => {
                                  if (!formData.start_time) {
                                    const now = new Date();
                                    const hours = now.getHours().toString().padStart(2, '0');
                                    const startTime = `${hours}:00`;
                                    const newHour = (parseInt(hours) + 1) % 24;
                                    const endTime = `${newHour.toString().padStart(2, '0')}:00`;

                                    let newEndDate = formData.start_date;
                                    if (parseInt(hours) + 1 >= 24 && formData.start_date) {
                                      const startDate = new Date(formData.start_date);
                                      startDate.setDate(startDate.getDate() + 1);
                                      newEndDate = startDate.toISOString().split('T')[0];
                                    }

                                    setFormData({ ...formData, start_time: startTime, end_time: endTime, end_date: newEndDate });
                                  }
                                }}
                                onChange={(e) => {
                                  const startTime = e.target.value;
                                  if (!startTime) {
                                    setFormData({ ...formData, start_time: startTime });
                                    return;
                                  }

                                  if (!formData.start_date) {
                                    setFormData({ ...formData, start_time: startTime });
                                    return;
                                  }

                                  const [startHours, startMinutes] = startTime.split(':').map(Number);
                                  const startTotalMinutes = startHours * 60 + startMinutes;
                                  const endTotalMinutes = startTotalMinutes + timeDiffMinutes;

                                  const endHours = Math.floor(endTotalMinutes / 60) % 24;
                                  const endMinutes = endTotalMinutes % 60;
                                  const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

                                  let newEndDate = formData.start_date;
                                  if (endTotalMinutes >= 24 * 60) {
                                    const startDate = new Date(formData.start_date);
                                    startDate.setDate(startDate.getDate() + Math.floor(endTotalMinutes / (24 * 60)));
                                    newEndDate = startDate.toISOString().split('T')[0];
                                  }

                                  setFormData({ ...formData, start_time: startTime, end_time: endTime, end_date: newEndDate });
                                }}
                                className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white shadow-sm transition-all"
                              />
                              {formData.start_time && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, start_time: '' })}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <X size={16} className="text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">終了日時</label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="relative p-2 bg-white rounded-lg shadow-sm">
                              <Calendar size={20} className="text-green-600" />
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => {
                                  const newEndDate = e.target.value;

                                  if (formData.start_time && formData.end_time && formData.start_date && newEndDate) {
                                    const [startHours, startMinutes] = formData.start_time.split(':').map(Number);
                                    const [endHours, endMinutes] = formData.end_time.split(':').map(Number);

                                    const startDate = new Date(formData.start_date);
                                    const endDate = new Date(newEndDate);

                                    startDate.setHours(startHours, startMinutes, 0, 0);
                                    endDate.setHours(endHours, endMinutes, 0, 0);

                                    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
                                    if (diff > 0) {
                                      setTimeDiffMinutes(diff);
                                    }
                                  }

                                  setFormData({ ...formData, end_date: newEndDate });
                                }}
                                className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white shadow-sm transition-all"
                              />
                              {formData.end_date && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, end_date: '' })}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <X size={16} className="text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="relative p-2 bg-white rounded-lg shadow-sm">
                              <Clock size={20} className="text-gray-400" />
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="time"
                                step="3600"
                                value={formData.end_time}
                                onFocus={(e) => {
                                  if (!formData.end_time && formData.start_time && formData.start_date) {
                                    const [startHours, startMinutes] = formData.start_time.split(':').map(Number);
                                    const startTotalMinutes = startHours * 60 + startMinutes;
                                    const endTotalMinutes = startTotalMinutes + timeDiffMinutes;
                                    const endHours = Math.floor(endTotalMinutes / 60) % 24;
                                    const endMinutes = endTotalMinutes % 60;
                                    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

                                    let newEndDate = formData.start_date;
                                    if (endTotalMinutes >= 24 * 60) {
                                      const startDate = new Date(formData.start_date);
                                      startDate.setDate(startDate.getDate() + Math.floor(endTotalMinutes / (24 * 60)));
                                      newEndDate = startDate.toISOString().split('T')[0];
                                    }

                                    setFormData({ ...formData, end_time: endTime, end_date: newEndDate });
                                  } else if (!formData.end_time) {
                                    const now = new Date();
                                    const hours = now.getHours().toString().padStart(2, '0');
                                    setFormData({ ...formData, end_time: `${hours}:00` });
                                  }
                                }}
                                onChange={(e) => {
                                  const endTime = e.target.value;
                                  if (endTime && formData.start_time && formData.start_date && formData.end_date) {
                                    const [startHours, startMinutes] = formData.start_time.split(':').map(Number);
                                    const [endHours, endMinutes] = endTime.split(':').map(Number);

                                    const startDate = new Date(formData.start_date);
                                    const endDate = new Date(formData.end_date);

                                    startDate.setHours(startHours, startMinutes, 0, 0);
                                    endDate.setHours(endHours, endMinutes, 0, 0);

                                    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
                                    if (diff > 0) {
                                      setTimeDiffMinutes(diff);
                                    }
                                  }
                                  setFormData({ ...formData, end_time: endTime });
                                }}
                                className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white shadow-sm transition-all"
                              />
                              {formData.end_time && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, end_time: '' })}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <X size={16} className="text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative px-6 pt-5 pb-5 bg-gradient-to-br from-blue-50/50 via-sky-50/50 to-cyan-50/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
                    <div className="relative space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative p-2 bg-white rounded-lg shadow-sm">
                          <Calendar size={20} className="text-[#5B9BD5]" />
                        </div>
                        <span className="text-gray-700 font-medium flex-shrink-0 w-16">締切日</span>
                        <div className="relative flex-1">
                          <input
                            type="date"
                            value={formData.deadline_date}
                            onChange={(e) =>
                              setFormData({ ...formData, deadline_date: e.target.value })
                            }
                            className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/20 bg-white shadow-sm transition-all"
                          />
                          {formData.deadline_date && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, deadline_date: '' })}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <X size={16} className="text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="px-6 py-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative p-2 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg shadow-sm">
                      <Pencil size={20} className="text-amber-600" />
                    </div>
                    <span className="text-gray-700 font-medium">メモ</span>
                  </div>
                  <textarea
                    value={formData.memo}
                    onChange={(e) =>
                      setFormData({ ...formData, memo: e.target.value })
                    }
                    rows={4}
                    placeholder="備考やメモを入力"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-gray-400 shadow-sm transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showCalendarModal && createPortal(
        <AddEventModal
          isOpen={showCalendarModal}
          onClose={handleCloseCalendarModal}
          onSave={handleSaveCalendarEvent}
          onUpdate={handleUpdateCalendarEvent}
          initialDate={
            dateType === 'deadline'
              ? (formData.deadline_date ? new Date(formData.deadline_date) : new Date())
              : (formData.start_date ? new Date(formData.start_date) : new Date())
          }
          editingEvent={
            existingCalendarEvent
              ? existingCalendarEvent
              : (formData.title && (dateType === 'deadline' ? formData.deadline_date : formData.start_date)
                ? {
                    id: '',
                    title: formData.title,
                    start_at: dateType === 'deadline'
                      ? ''
                      : (formData.start_date + (formData.start_time ? `T${formData.start_time}` : '')),
                    end_at: dateType === 'deadline'
                      ? ''
                      : ((formData.end_date || formData.start_date) + (formData.end_time ? `T${formData.end_time}` : '')),
                    all_day: dateType === 'deadline' ? true : (!formData.start_time && !formData.end_time),
                    color_id: defaultColorId,
                    event_type: selectedTrack,
                    company_name: companyName,
                    deadline_at: dateType === 'deadline'
                      ? formData.deadline_date
                      : undefined,
                    memo: formData.memo,
                  }
                : undefined)
          }
        />,
        document.body
      )}

      {showAddProgressModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
          setShowAddProgressModal(false);
          setEditingProgressId(null);
          setProgressFormData({
            stage: '',
          });
        }}>
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  通過した選考を追加
                </h3>
                <button
                  onClick={() => {
                    setShowAddProgressModal(false);
                    setEditingProgressId(null);
                    setProgressFormData({
                      stage: '',
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl leading-none">&times;</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <input
                  type="text"
                  value={progressFormData.stage}
                  onChange={(e) => setProgressFormData({ ...progressFormData, stage: e.target.value })}
                  placeholder="ES通過、一次面接通過、内定など"
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder-gray-400 shadow-sm transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && progressFormData.stage.trim()) {
                      handleAddProgress();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddProgressModal(false);
                    setEditingProgressId(null);
                    setProgressFormData({
                      stage: '',
                    });
                  }}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddProgress}
                  disabled={!progressFormData.stage.trim()}
                  className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all ${
                    !progressFormData.stage.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-[1.02]'
                  }`}
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showLoadingModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#FFA52F] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">カレンダーを作成中...</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
