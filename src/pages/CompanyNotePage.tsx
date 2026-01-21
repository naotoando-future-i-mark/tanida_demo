import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Company, CompanyNote, CompanyMemo, SelectionEvent, SelectionProgress, ReferenceSite } from '../types/company';
import { supabase } from '../lib/supabase';
import { MemoTab } from '../components/jobhunting/MemoTab';
import { SelectionTab } from '../components/jobhunting/SelectionTab';
import { JobPostingsTab } from '../components/jobhunting/JobPostingsTab';
import { MemoEditorPage } from './MemoEditorPage';

interface CompanyNotePageProps {
  companyId: string;
  onBack: () => void;
}

type TabType = 'postings' | 'memo' | 'selection';

export const CompanyNotePage = ({ companyId, onBack }: CompanyNotePageProps) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [companyNote, setCompanyNote] = useState<CompanyNote | null>(null);
  const [companyMemos, setCompanyMemos] = useState<CompanyMemo[]>([]);
  const [selectionEvents, setSelectionEvents] = useState<SelectionEvent[]>([]);
  const [selectionProgress, setSelectionProgress] = useState<SelectionProgress[]>([]);
  const [referenceSites, setReferenceSites] = useState<ReferenceSite[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('memo');
  const [editingMemo, setEditingMemo] = useState<{ memo: CompanyMemo | null; category: string } | null>(null);

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyData) {
      setCompany(companyData);
    }

    const { data: noteData } = await supabase
      .from('company_notes')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (noteData) {
      setCompanyNote(noteData);

      const { data: memosData } = await supabase
        .from('company_memos')
        .select('*')
        .eq('company_note_id', noteData.id)
        .order('created_at', { ascending: false });

      if (memosData) {
        setCompanyMemos(memosData);
      }

      const { data: eventsData } = await supabase
        .from('selection_events')
        .select('*')
        .eq('company_note_id', noteData.id)
        .order('deadline_date', { ascending: true });

      if (eventsData) {
        setSelectionEvents(eventsData);
      }

      const { data: progressData } = await supabase
        .from('selection_progress')
        .select('*')
        .eq('company_note_id', noteData.id)
        .order('passed_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (progressData) {
        setSelectionProgress(progressData);
      }

      const { data: sitesData } = await supabase
        .from('company_reference_sites')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (sitesData) {
        setReferenceSites(sitesData);
      }
    } else {
      const { data: newNote, error } = await supabase
        .from('company_notes')
        .insert([{ company_id: companyId }])
        .select()
        .single();

      if (newNote && !error) {
        setCompanyNote(newNote);
      }
    }
  };

  const handleUpdateNote = async (updates: Partial<CompanyNote>) => {
    if (!companyNote) return;

    const { error } = await supabase
      .from('company_notes')
      .update(updates)
      .eq('company_id', companyId);

    if (!error) {
      setCompanyNote({ ...companyNote, ...updates });
    }
  };

  const handleAddMemo = async (memo: Omit<CompanyMemo, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('company_memos')
      .insert([memo])
      .select()
      .single();

    if (data && !error) {
      setCompanyMemos([data, ...companyMemos]);
    }
  };

  const handleUpdateMemo = async (memoId: string, updates: Partial<CompanyMemo>) => {
    const { error } = await supabase
      .from('company_memos')
      .update(updates)
      .eq('id', memoId);

    if (!error) {
      setCompanyMemos(companyMemos.map(m => m.id === memoId ? { ...m, ...updates } : m));
    }
  };

  const handleDeleteMemo = async (memoId: string) => {
    await handleUpdateMemo(memoId, { is_deleted: true });
  };

  const handleRestoreMemo = async (memoId: string) => {
    await handleUpdateMemo(memoId, { is_deleted: false });
  };

  const handleAddEvent = async (event: Omit<SelectionEvent, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    const { data, error } = await supabase
      .from('selection_events')
      .insert([event])
      .select()
      .single();

    if (data && !error) {
      setSelectionEvents([...selectionEvents, data].sort((a, b) => {
        const aDate = a.deadline_date || a.start_date || '';
        const bDate = b.deadline_date || b.start_date || '';
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      }));
      return data.id;
    }
    return null;
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<SelectionEvent>) => {
    const { error } = await supabase
      .from('selection_events')
      .update(updates)
      .eq('id', eventId);

    if (!error) {
      setSelectionEvents(selectionEvents.map(e => e.id === eventId ? { ...e, ...updates } : e));
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('selection_events')
      .delete()
      .eq('id', eventId);

    if (!error) {
      setSelectionEvents(selectionEvents.filter(e => e.id !== eventId));
    }
  };

  const handleAddProgress = async (progress: Omit<SelectionProgress, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('selection_progress')
      .insert([progress])
      .select()
      .single();

    if (data && !error) {
      setSelectionProgress([data, ...selectionProgress].sort((a, b) => {
        const dateCompare = new Date(b.passed_date).getTime() - new Date(a.passed_date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }));
    }
  };

  const handleUpdateProgress = async (progressId: string, updates: Partial<SelectionProgress>) => {
    const { error } = await supabase
      .from('selection_progress')
      .update(updates)
      .eq('id', progressId);

    if (!error) {
      const updated = selectionProgress.map(p => p.id === progressId ? { ...p, ...updates } : p);
      setSelectionProgress(updated.sort((a, b) => {
        const dateCompare = new Date(b.passed_date).getTime() - new Date(a.passed_date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }));
    }
  };

  const handleDeleteProgress = async (progressId: string) => {
    const { error } = await supabase
      .from('selection_progress')
      .delete()
      .eq('id', progressId);

    if (!error) {
      setSelectionProgress(selectionProgress.filter(p => p.id !== progressId));
    }
  };

  const handleAddSite = async (name: string, url: string) => {
    const { data, error } = await supabase
      .from('company_reference_sites')
      .insert([{
        company_id: companyId,
        name,
        url,
      }])
      .select()
      .single();

    if (data && !error) {
      setReferenceSites([data, ...referenceSites]);
    }
  };

  const handleUpdateSite = async (site: ReferenceSite) => {
    const { error } = await supabase
      .from('company_reference_sites')
      .update({
        name: site.name,
        url: site.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    if (!error) {
      setReferenceSites(referenceSites.map(s => s.id === site.id ? site : s));
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    const { error } = await supabase
      .from('company_reference_sites')
      .delete()
      .eq('id', siteId);

    if (!error) {
      setReferenceSites(referenceSites.filter(s => s.id !== siteId));
    }
  };

  const handleSelectMemo = (memo: CompanyMemo | null, category: string) => {
    setEditingMemo({ memo, category });
  };

  const handleSaveMemoContent = async (content: string) => {
    if (!editingMemo) return;

    if (editingMemo.memo) {
      const memoId = editingMemo.memo.id;
      const { error } = await supabase
        .from('company_memos')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', memoId);

      if (!error) {
        const updatedMemo = { ...editingMemo.memo, content, updated_at: new Date().toISOString() };
        setCompanyMemos(companyMemos.map(m =>
          m.id === memoId ? updatedMemo : m
        ));
        setEditingMemo({ ...editingMemo, memo: updatedMemo });
      }
    } else {
      if (!companyNote) return;

      const { data, error } = await supabase
        .from('company_memos')
        .insert([{
          company_note_id: companyNote.id,
          category: editingMemo.category,
          title: editingMemo.category,
          content,
          is_deleted: false,
        }])
        .select()
        .single();

      if (data && !error) {
        setCompanyMemos([data, ...companyMemos]);
        setEditingMemo({ ...editingMemo, memo: data });
      }
    }
  };

  if (!company || !companyNote) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (editingMemo) {
    return (
      <MemoEditorPage
        memo={editingMemo.memo}
        category={editingMemo.category}
        companyId={companyId}
        companyName={company.name}
        onSave={handleSaveMemoContent}
        onBack={async () => {
          await fetchCompanyData();
          setEditingMemo(null);
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate flex-1">
            {company.name}
          </h1>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('postings')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'postings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            企業求人
          </button>
          <button
            onClick={() => setActiveTab('memo')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'memo'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            メモ帳
          </button>
          <button
            onClick={() => setActiveTab('selection')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'selection'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            選考状況
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'postings' && <JobPostingsTab />}
        {activeTab === 'memo' && (
          <MemoTab
            companyNote={companyNote}
            companyMemos={companyMemos}
            referenceSites={referenceSites}
            onUpdateNote={handleUpdateNote}
            onSelectMemo={handleSelectMemo}
            onAddSite={handleAddSite}
            onUpdateSite={handleUpdateSite}
            onDeleteSite={handleDeleteSite}
          />
        )}
        {activeTab === 'selection' && companyNote && (
          <SelectionTab
            companyNoteId={companyNote.id}
            companyName={company.name}
            events={selectionEvents}
            progress={selectionProgress}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddProgress={handleAddProgress}
            onUpdateProgress={handleUpdateProgress}
            onDeleteProgress={handleDeleteProgress}
          />
        )}
      </div>
    </div>
  );
};
