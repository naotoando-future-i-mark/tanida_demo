import { useState } from 'react';
import { Link, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { ReferenceSite } from '../../types/company';

interface ReferenceSitesBlockProps {
  sites: ReferenceSite[];
  onAddSite: (name: string, url: string) => void;
  onUpdateSite: (site: ReferenceSite) => void;
  onDeleteSite: (siteId: string) => void;
}

export const ReferenceSitesBlock = ({
  sites,
  onAddSite,
  onUpdateSite,
  onDeleteSite,
}: ReferenceSitesBlockProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSite, setEditingSite] = useState<ReferenceSite | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleAddNewSite = () => {
    if (name.trim() && url.trim()) {
      onAddSite(name.trim(), url.trim());
      setName('');
      setUrl('');
      setIsAddingNew(false);
    }
  };

  const handleEditSite = (site: ReferenceSite) => {
    setEditingSite(site);
    setName(site.name);
    setUrl(site.url);
  };

  const handleUpdateSite = () => {
    if (editingSite && name.trim() && url.trim()) {
      onUpdateSite({
        ...editingSite,
        name: name.trim(),
        url: url.trim(),
      });
      setEditingSite(null);
      setName('');
      setUrl('');
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingSite(null);
    setName('');
    setUrl('');
  };

  const handleOpenUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">参照サイト</h3>
        <button
          onClick={() => setIsAddingNew(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Plus size={18} className="text-[#FFA52F]" />
        </button>
      </div>

      <div className="p-4 space-y-2">
        {sites.map((site) => (
          <div
            key={site.id}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-[#FFA52F] hover:bg-orange-50 transition-all group"
          >
            <Link size={20} className="text-[#FFA52F] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-1">{site.name}</h4>
              <p className="text-xs text-gray-500 truncate">{site.url}</p>
            </div>
            <button
              onClick={(e) => handleOpenUrl(site.url, e)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="サイトを開く"
            >
              <ExternalLink size={16} className="text-gray-400 group-hover:text-[#FFA52F] transition-colors" />
            </button>
            <button
              onClick={() => handleEditSite(site)}
              className="px-3 py-1 text-xs font-medium text-[#FFA52F] hover:bg-white rounded-lg transition-colors"
            >
              編集
            </button>
            <button
              onClick={() => onDeleteSite(site.id)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="削除"
            >
              <Trash2 size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
            </button>
          </div>
        ))}

        {sites.length === 0 && !isAddingNew && !editingSite && (
          <p className="text-sm text-gray-400 text-center py-4">
            参照サイトがありません
          </p>
        )}

        {(isAddingNew || editingSite) && (
          <div className="border border-[#FFA52F] rounded-xl p-3 bg-orange-50 space-y-3">
            <input
              type="text"
              placeholder="サイト名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA52F] focus:border-transparent"
              autoFocus
            />
            <input
              type="url"
              placeholder="URL (例: https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA52F] focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={editingSite ? handleUpdateSite : handleAddNewSite}
                disabled={!name.trim() || !url.trim()}
                className="flex-1 px-3 py-2 bg-[#FFA52F] text-white rounded-lg text-sm font-medium hover:bg-[#FF8F0F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSite ? '更新' : '追加'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
