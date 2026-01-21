import { useState, useEffect } from 'react';
import { Plus, Building2, Search, Trash2 } from 'lucide-react';
import { Company, SelectionProgress } from '../types/company';
import { supabase } from '../lib/supabase';

interface CompaniesListPageProps {
  onCompanySelect: (companyId: string) => void;
}

interface CompanyWithProgress extends Company {
  latestProgress?: {
    trackType: 'intern' | 'fulltime';
    stage: string;
  };
}

export const CompaniesListPage = ({ onCompanySelect }: CompaniesListPageProps) => {
  const [companies, setCompanies] = useState<CompanyWithProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('updated_at', { ascending: false });

    if (companiesError || !companiesData) {
      return;
    }

    // Get company notes for all companies
    const { data: notesData, error: notesError } = await supabase
      .from('company_notes')
      .select('id, company_id')
      .in('company_id', companiesData.map(c => c.id));

    if (notesError || !notesData) {
      setCompanies(companiesData);
      return;
    }

    // Get all selection progress for these company notes
    const { data: progressData, error: progressError } = await supabase
      .from('selection_progress')
      .select('*')
      .in('company_note_id', notesData.map(n => n.id))
      .order('created_at', { ascending: false });

    if (progressError || !progressData) {
      setCompanies(companiesData);
      return;
    }

    // Map company_note_id to company_id
    const noteIdToCompanyId = new Map(notesData.map(n => [n.id, n.company_id]));

    // Group progress by company and find the most recent one
    const companyProgressMap = new Map<string, SelectionProgress>();

    progressData.forEach(progress => {
      const companyId = noteIdToCompanyId.get(progress.company_note_id);
      if (!companyId) return;

      const existing = companyProgressMap.get(companyId);
      if (!existing || new Date(progress.created_at) > new Date(existing.created_at)) {
        companyProgressMap.set(companyId, progress);
      }
    });

    // Combine companies with their latest progress
    const companiesWithProgress: CompanyWithProgress[] = companiesData.map(company => {
      const latestProgress = companyProgressMap.get(company.id);
      return {
        ...company,
        latestProgress: latestProgress ? {
          trackType: latestProgress.track_type,
          stage: latestProgress.stage,
        } : undefined,
      };
    });

    setCompanies(companiesWithProgress);
  };

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) return;

    const { data, error } = await supabase
      .from('companies')
      .insert([{ name: newCompanyName.trim() }])
      .select()
      .single();

    if (data && !error) {
      await supabase
        .from('company_notes')
        .insert([{ company_id: data.id }]);

      setCompanies([{ ...data, latestProgress: undefined }, ...companies]);
      setNewCompanyName('');
      setShowAddModal(false);
    }
  };

  const handleDeleteCompany = async (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('この企業を削除してもよろしいですか？すべての関連データも削除されます。')) {
      return;
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (!error) {
      setCompanies(companies.filter(c => c.id !== companyId));
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <img src="/syucalehub_logo.svg" alt="就活ノート" className="h-8" />
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-full bg-[#FFA52F] text-white flex items-center justify-center hover:bg-[#FF8F0F] transition-colors shadow-lg"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="企業名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA52F] focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-3">
        {filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Building2 size={64} className="mb-4 opacity-30" />
            <p className="text-center">
              {searchQuery ? '該当する企業が見つかりません' : '企業を追加してください'}
            </p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
              onClick={() => onCompanySelect(company.id)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFA52F] to-[#FF8F0F] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Building2 size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(company.updated_at).toLocaleDateString('ja-JP')} 更新
                    </p>
                    {company.latestProgress && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs font-medium text-gray-600">選考状況:</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm ${
                          company.latestProgress.trackType === 'intern'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-gradient-to-r from-[#FF8F0F] to-[#FFA52F] text-white'
                        }`}>
                          {company.latestProgress.trackType === 'intern' ? 'インターン' : '本選考'}
                        </span>
                        <span className="text-xs text-gray-700 font-semibold">
                          {company.latestProgress.stage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteCompany(company.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg h-1/2 animate-slide-up shadow-2xl pb-20">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">企業を追加</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCompanyName('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企業名
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="例: 株式会社○○"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA52F] focus:border-transparent"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCompany();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCompanyName('');
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddCompany}
                  disabled={!newCompanyName.trim()}
                  className="flex-1 px-3 py-2 bg-[#FFA52F] text-white rounded-xl font-medium hover:bg-[#FF8F0F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
