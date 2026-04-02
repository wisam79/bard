import React from 'react';
import { Users, Plus, Edit2, KeyRound } from 'lucide-react';
import { Staff } from '@/types';
import Button from '@/components/ui/Button';

interface StaffSettingsProps {
  staffs: Staff[];
  setEditingStaff: (staff: Staff | null) => void;
  setShowStaffModal: (show: boolean) => void;
  isLoading: boolean;
}

const StaffSettings: React.FC<StaffSettingsProps> = ({ staffs, setEditingStaff, setShowStaffModal, isLoading }) => {
  return (
    <div className="space-y-6 animate-fade-in dark:text-white text-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black dark:text-white text-gray-900 flex items-center gap-3">
          <Users className="text-primary-400" />
          إدارة الموظفين
        </h3>
        <Button
          onClick={() => {
            setEditingStaff(null);
            setShowStaffModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> إضافة موظف
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {isLoading ? (
          <div className="text-brand-accent/60">جاري التحميل...</div>
        ) : staffs.map(staff => (
          <div key={staff.id} className="bg-brand-dark rounded-2xl p-6 border border-brand-border hover:border-primary-500/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg dark:text-white text-gray-900">{staff.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    staff.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-primary-500/20 text-primary-400'
                  }`}>
                    {staff.role === 'admin' ? 'مدير نظام' : 'كاشير'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    staff.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {staff.status === 'active' ? 'نشط' : 'موقوف'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingStaff(staff);
                  setShowStaffModal(true);
                }}
                className="w-8 h-8 rounded-full bg-brand-dark/50 flex items-center justify-center text-brand-accent hover:dark:text-white text-gray-900 hover:bg-brand-accent/20 transition-all"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="space-y-2 mt-4 text-sm text-brand-accent/80 font-medium">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary-400/70" />
                <span>المبيعات: {staff.metrics?.totalSalesCount || 0} عملية</span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound size={14} className="text-primary-400/70" />
                <span>رمز الدخول: {staff.pinCode ? 'سري' : 'لم يحدد'}</span>
              </div>
            </div>
          </div>
        ))}

        {staffs.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center text-brand-accent/60 font-medium bg-brand-dark/20 rounded-2xl border border-dashed border-brand-border">
            لم يتم إضافة موظفين بعد
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffSettings;
