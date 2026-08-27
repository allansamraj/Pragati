'use client';
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Lock, FileText, Pill, Activity, ArrowRightLeft } from 'lucide-react';

const patients = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  token: `T-${100 + i}`,
  name: ['Rajesh Kumar', 'Priya Singh', 'Anil Das', 'Kavita Patel', 'Mohd Tariq', 'Sneha Reddy', 'Vikram Singh', 'Pooja Sharma', 'Arun V', 'Deepa K', 'Manoj Tiwari', 'Rekha M'][i],
  age: 25 + (i * 3),
  abha: `91-XXXX-XXXX-${1000 + i}`,
  specialty: ['General', 'Cardiology', 'Pediatrics', 'Orthopedics'][i % 4],
  status: i < 3 ? 'completed' : i === 3 ? 'in-consultation' : 'waiting',
  history: {
    note: 'Patient reported mild fever and body ache since 2 days.',
    prescriptions: ['Paracetamol 500mg (SOS)', 'Vitamin C 500mg'],
    diagnostics: ['Complete Blood Count (CBC) - Pending'],
    referrals: 'Referred from PHC City Center last week.'
  }
}));

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.token.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-primary">Today's Patients</h1>
          <p className="text-sm text-ink-secondary mt-1">Manage outpatient queue and patient records.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or token..."
            className="w-full pl-9 pr-4 py-2 rounded-[12px] border border-gray-200 text-sm focus:outline-none focus:border-burgundy-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-[12px] p-3 flex items-center gap-2">
        <Lock className="w-4 h-4 text-blue-600 shrink-0" />
        <p className="text-xs text-blue-800">
          Records accessed with patient consent. Audit logged.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[14px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[13px] text-ink-secondary">
                <th className="px-6 py-3 font-medium">Token</th>
                <th className="px-6 py-3 font-medium">Patient Details</th>
                <th className="px-6 py-3 font-medium">Specialty</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((p) => (
                <React.Fragment key={p.id}>
                  <tr 
                    className={`text-[13px] hover:bg-gray-50 cursor-pointer transition-colors ${expandedId === p.id ? 'bg-gray-50' : ''}`}
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  >
                    <td className="px-6 py-4 font-semibold text-ink-primary">{p.token}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink-primary">{p.name}</div>
                      <div className="text-xs text-ink-secondary">{p.age} yrs • ABHA: {p.abha}</div>
                    </td>
                    <td className="px-6 py-4">{p.specialty}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'completed' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                        p.status === 'in-consultation' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {p.status === 'in-consultation' ? 'In Consultation' : 
                         p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        {expandedId === p.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr className="bg-blush-surface border-b border-gray-200">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                           <div className="space-y-3">
                             <div>
                               <h4 className="flex items-center gap-2 text-xs font-semibold text-ink-secondary uppercase mb-1">
                                 <FileText size={14} /> Last Consultation Note
                               </h4>
                               <p className="text-ink-primary">{p.history.note}</p>
                             </div>
                             <div>
                               <h4 className="flex items-center gap-2 text-xs font-semibold text-ink-secondary uppercase mb-1">
                                 <ArrowRightLeft size={14} /> Referral History
                               </h4>
                               <p className="text-ink-primary">{p.history.referrals}</p>
                             </div>
                           </div>
                           <div className="space-y-3">
                             <div>
                               <h4 className="flex items-center gap-2 text-xs font-semibold text-ink-secondary uppercase mb-1">
                                 <Pill size={14} /> Current Prescriptions (2)
                               </h4>
                               <ul className="list-disc list-inside text-ink-primary pl-1">
                                 {p.history.prescriptions.map((med, i) => <li key={i}>{med}</li>)}
                               </ul>
                             </div>
                             <div>
                               <h4 className="flex items-center gap-2 text-xs font-semibold text-ink-secondary uppercase mb-1">
                                 <Activity size={14} /> Recent Diagnostics (1)
                               </h4>
                               <ul className="list-disc list-inside text-ink-primary pl-1">
                                 {p.history.diagnostics.map((diag, i) => <li key={i}>{diag}</li>)}
                               </ul>
                             </div>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
