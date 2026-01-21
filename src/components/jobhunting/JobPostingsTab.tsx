import { Briefcase } from 'lucide-react';

export const JobPostingsTab = () => {
  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFA52F] to-[#FF8F0F] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Briefcase size={40} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          企業求人情報
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          企業の求人情報やリンクを管理する機能です。
          今後のアップデートで企業データベースと連携予定です。
        </p>
      </div>
    </div>
  );
};
