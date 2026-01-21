import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarGrid } from './components/CalendarGrid';
import { AddEventModal } from './components/AddEventModal';
import { DayEventsSheet } from './components/DayEventsSheet';
import { EventDetailModal } from './components/EventDetailModal';
import { YearMonthSelector } from './components/YearMonthSelector';
import { BottomNavigation } from './components/BottomNavigation';
import { CompaniesListPage } from './pages/CompaniesListPage';
import { CompanyNotePage } from './pages/CompanyNotePage';
import { Event } from './types/event';
import { ColorPreset } from './components/ColorPickerModal';
import { supabase } from './lib/supabase';
import { registerServiceWorker, requestNotificationPermission, scheduleEventNotifications, cancelEventNotifications } from './lib/notifications';

type Page = 'calendar' | 'notes';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('calendar');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDayEventsSheet, setShowDayEventsSheet] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [isYearMonthSelectorOpen, setIsYearMonthSelectorOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
  const [events, setEvents] = useState<Event[]>([]);
  const [colorPresets, setColorPresets] = useState<ColorPreset[]>([]);

  const fetchEvents = async () => {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*');

    if (eventsData && !eventsError) {
      const eventsWithDates = await Promise.all(
        eventsData.map(async (event) => {
          const { data: prepDates } = await supabase
            .from('preparation_dates')
            .select('*')
            .eq('event_id', event.id);

          return {
            ...event,
            preparation_dates: prepDates || [],
          };
        })
      );

      setEvents(eventsWithDates);

      eventsWithDates.forEach((event) => {
        scheduleEventNotifications(event);
      });
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await registerServiceWorker();
        await requestNotificationPermission();
      } catch (error) {
        console.warn('Failed to initialize notifications:', error);
      }
    };

    const fetchColorPresets = async () => {
      const { data, error } = await supabase
        .from('color_presets')
        .select('*')
        .order('order_index');

      if (data && !error) {
        setColorPresets(data);
      }
    };

    initializeApp();
    fetchColorPresets();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentPage === 'calendar') {
      fetchEvents();
    }
  }, [currentPage]);

  const colorMap = colorPresets.reduce((acc, preset) => {
    acc[preset.id] = preset.color;
    return acc;
  }, {} as Record<string, string>);

  const colorMapWithLabel = colorPresets.reduce((acc, preset) => {
    acc[preset.id] = { color: preset.color, label: preset.label };
    return acc;
  }, {} as Record<string, { color: string; label: string }>);

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id'>) => {
    const { preparation_dates, ...eventDataWithoutDates } = eventData;

    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert([eventDataWithoutDates])
      .select()
      .single();

    if (newEvent && !eventError) {
      let eventWithDates: Event;

      if (preparation_dates && preparation_dates.length > 0) {
        const prepDatesToInsert = preparation_dates.map((pd) => ({
          event_id: newEvent.id,
          date: pd.date,
          end_date: pd.end_date,
          title: pd.title,
        }));

        const { data: insertedPrepDates } = await supabase
          .from('preparation_dates')
          .insert(prepDatesToInsert)
          .select();

        eventWithDates = { ...newEvent, preparation_dates: insertedPrepDates || [] };
        setEvents([...events, eventWithDates]);
      } else {
        eventWithDates = { ...newEvent, preparation_dates: [] };
        setEvents([...events, eventWithDates]);
      }

      scheduleEventNotifications(eventWithDates);
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    const { preparation_dates, ...eventDataWithoutDates } = updatedEvent;

    const { error: updateError } = await supabase
      .from('events')
      .update(eventDataWithoutDates)
      .eq('id', updatedEvent.id);

    if (!updateError) {
      await supabase
        .from('preparation_dates')
        .delete()
        .eq('event_id', updatedEvent.id);

      cancelEventNotifications(updatedEvent.id);

      let finalEvent: Event;

      if (preparation_dates && preparation_dates.length > 0) {
        const prepDatesToInsert = preparation_dates.map((pd) => ({
          event_id: updatedEvent.id,
          date: pd.date,
          end_date: pd.end_date,
          title: pd.title,
        }));

        const { data: insertedPrepDates } = await supabase
          .from('preparation_dates')
          .insert(prepDatesToInsert)
          .select();

        finalEvent = { ...updatedEvent, preparation_dates: insertedPrepDates || [] };
        setEvents(events.map(event =>
          event.id === updatedEvent.id ? finalEvent : event
        ));
      } else {
        finalEvent = { ...updatedEvent, preparation_dates: [] };
        setEvents(events.map(event =>
          event.id === updatedEvent.id ? finalEvent : event
        ));
      }

      scheduleEventNotifications(finalEvent);
      setEditingEvent(undefined);
      setShowEventDetail(false);
      setSelectedEvent(finalEvent);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (!error) {
      cancelEventNotifications(eventId);
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDayEventsSheet(true);
  };

  const handleEventClick = (event: Event & { originalId?: string }) => {
    // If this is a pseudo-event (prep date or deadline), find the original event
    if (event.originalId) {
      const originalEvent = events.find(e => e.id === event.originalId);
      if (originalEvent) {
        setSelectedEvent(originalEvent);
      } else {
        setSelectedEvent(event);
      }
    } else {
      setSelectedEvent(event);
    }
    setShowEventDetail(true);
  };

  const handleEditEvent = (event: Event) => {
    setShowEventDetail(false);
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleAddEventFromSheet = () => {
    setShowDayEventsSheet(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  const handleCloseDayEventsSheet = () => {
    setShowDayEventsSheet(false);
  };

  const renderPage = () => {
    if (currentPage === 'notes') {
      if (selectedCompanyId) {
        return (
          <CompanyNotePage
            companyId={selectedCompanyId}
            onBack={() => setSelectedCompanyId(null)}
          />
        );
      }
      return (
        <CompaniesListPage
          onCompanySelect={(companyId) => setSelectedCompanyId(companyId)}
        />
      );
    }

    return (
      <>
        <Header
          currentDate={currentDate}
          onDateSelect={handleDateChange}
          onTodayClick={handleToday}
          onYearMonthClick={() => setIsYearMonthSelectorOpen(true)}
        />

        <div className="flex-1 overflow-hidden pb-16">
          <div className="h-full">
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleDateChange}
              events={events}
              colorMap={colorMap}
            />
          </div>
        </div>

        <DayEventsSheet
          isOpen={showDayEventsSheet}
          onClose={handleCloseDayEventsSheet}
          selectedDate={selectedDate}
          events={events}
          onEventClick={handleEventClick}
          onAddEvent={handleAddEventFromSheet}
          colorMap={colorMapWithLabel}
        />

        <EventDetailModal
          isOpen={showEventDetail}
          onClose={() => setShowEventDetail(false)}
          event={selectedEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />

        <AddEventModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onUpdate={handleUpdateEvent}
          initialDate={selectedDate || undefined}
          editingEvent={editingEvent}
        />

        <YearMonthSelector
          isOpen={isYearMonthSelectorOpen}
          onClose={() => setIsYearMonthSelectorOpen(false)}
          currentDate={currentDate}
          onSelectDate={handleDateChange}
        />
      </>
    );
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {renderPage()}
      <BottomNavigation
        currentPage={currentPage}
        onAddClick={() => setIsModalOpen(true)}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSelectedCompanyId(null);
        }}
      />
    </div>
  );
}

export default App;
