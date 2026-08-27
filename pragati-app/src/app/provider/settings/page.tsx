'use client';
import { useState } from 'react';
import { Building2, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  const [toggles, setToggles] = useState({
    queue: true,
    stock: true,
    referral: true,
    daily: false,
  });

  const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: () => void, label: string }) => (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-sm text-ink-primary font-medium">{label}</span>
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-burgundy-700' : 'bg-gray-200'}`} onClick={onChange}>
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
      </div>
    </label>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">Settings</h1>
        <p className="text-sm text-ink-secondary mt-1">Manage facility profile and your preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Facility Profile */}
        <div className="bg-white border border-gray-200 rounded-[14px] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
            <Building2 className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-ink-primary text-base">Facility Profile</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Facility Name</label>
              <input type="text" readOnly value="PHC Ramnagar" className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Facility Type</label>
              <input type="text" readOnly value="Primary Health Centre" className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">District</label>
              <input type="text" readOnly value="North District" className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Number of Beds</label>
              <input type="text" readOnly value="10" className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-gray-600 outline-none" />
            </div>
          </div>
        </div>

        {/* Provider Profile */}
        <div className="bg-white border border-gray-200 rounded-[14px] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-ink-primary text-base">Provider Profile</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Name</label>
              <input type="text" readOnly value="Dr. Ramesh Sharma" className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Role</label>
              <input type="text" readOnly value="Medical Officer" className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Department</label>
              <input type="text" readOnly value="General Medicine" className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Email</label>
              <input type="text" readOnly value="ramesh.s@pragati.demo" className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-gray-600 outline-none" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-[14px] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-ink-primary text-base">Notification Settings</h2>
          </div>
          <div className="p-5 space-y-2 divide-y divide-gray-100">
            <Toggle label="Queue alerts" checked={toggles.queue} onChange={() => setToggles({...toggles, queue: !toggles.queue})} />
            <Toggle label="Low stock alerts" checked={toggles.stock} onChange={() => setToggles({...toggles, stock: !toggles.stock})} />
            <Toggle label="Referral notifications" checked={toggles.referral} onChange={() => setToggles({...toggles, referral: !toggles.referral})} />
            <Toggle label="Daily report email" checked={toggles.daily} onChange={() => setToggles({...toggles, daily: !toggles.daily})} />
          </div>
        </div>
      </div>

      <div className="text-center pt-8 text-xs text-gray-400 space-y-1">
        <p>Authentication: Microsoft Entra ID (future)</p>
        <p>Session: Demo prototype</p>
      </div>
    </div>
  );
}
