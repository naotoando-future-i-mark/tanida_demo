import { CompanyNote, CompanyMemo, ReferenceSite } from '../../types/company';
import { BasicInfoBlock } from './BasicInfoBlock';
import { MyPageInfoBlock } from './MyPageInfoBlock';
import { CompanyMemosBlock } from './CompanyMemosBlock';
import { ReferenceSitesBlock } from './ReferenceSitesBlock';

interface MemoTabProps {
  companyNote: CompanyNote;
  companyMemos: CompanyMemo[];
  referenceSites: ReferenceSite[];
  onUpdateNote: (updates: Partial<CompanyNote>) => void;
  onSelectMemo: (memo: CompanyMemo | null, category: string) => void;
  onAddSite: (name: string, url: string) => void;
  onUpdateSite: (site: ReferenceSite) => void;
  onDeleteSite: (siteId: string) => void;
}

export const MemoTab = ({
  companyNote,
  companyMemos,
  referenceSites,
  onUpdateNote,
  onSelectMemo,
  onAddSite,
  onUpdateSite,
  onDeleteSite,
}: MemoTabProps) => {
  return (
    <div className="h-full overflow-y-auto px-4 pt-4 pb-24 space-y-4">
      <BasicInfoBlock companyNote={companyNote} onUpdate={onUpdateNote} />
      <MyPageInfoBlock companyNote={companyNote} onUpdate={onUpdateNote} />
      <CompanyMemosBlock
        memos={companyMemos}
        onSelectMemo={onSelectMemo}
      />
      <ReferenceSitesBlock
        sites={referenceSites}
        onAddSite={onAddSite}
        onUpdateSite={onUpdateSite}
        onDeleteSite={onDeleteSite}
      />
    </div>
  );
};
