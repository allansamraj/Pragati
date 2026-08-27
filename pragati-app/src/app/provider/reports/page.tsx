'use client';
import { FileText, Download, Activity, Users, Pill, Stethoscope, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

const reports = [
  { id: 1, title: 'OPD Summary', description: 'Patient footfall, demographics, and average consultation times.', range: 'Today', icon: Users },
  { id: 2, title: 'Medicine Inventory', description: 'Current stock levels, consumption rates, and near-expiry alerts.', range: 'This Week', icon: Pill },
  { id: 3, title: 'Doctor Availability', description: 'Attendance logs and scheduled vs actual active hours.', range: 'This Week', icon: Stethoscope },
  { id: 4, title: 'Diagnostics', description: 'Test volume, turnaround times, and equipment utilization.', range: 'This Month', icon: Activity },
  { id: 5, title: 'Referral Summary', description: 'Inbound and outbound referral tracking and outcomes.', range: 'This Month', icon: ArrowRightLeft },
  { id: 6, title: 'Patient Load', description: 'Peak hours analysis and department-wise distribution.', range: 'This Week', icon: FileText },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-primary">Reports & Analytics</h1>
          <p className="text-sm text-ink-secondary mt-1">View facility performance and export operational data.</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[12px] p-3 text-sm text-gray-600 flex justify-center">
        <strong>DEMO DATA — exports are not functional in prototype.</strong>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white border border-gray-200 rounded-[14px] p-5 shadow-sm flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blush-surface rounded-xl text-burgundy-700">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-primary text-base">{report.title}</h3>
                  <p className="text-sm text-ink-secondary mt-1">{report.description}</p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                  {report.range}
                </span>
                <div className="flex gap-2">
                  <Link href="#" className="text-burgundy-700 hover:text-burgundy-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors border border-red-100">
                    View Report
                  </Link>
                  <Link href="#" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors">
                    <Download size={14} /> Export CSV
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
