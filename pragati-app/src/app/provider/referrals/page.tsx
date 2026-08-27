'use client';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const incomingReferrals = [
  { id: 1, name: 'Arun Sundaram', age: 54, abha: '77-XXXX-XXXX-6734', from: 'Government UPHC Triplicane', specialty: 'Cardiology', urgency: 'high', status: 'pending' },
  { id: 2, name: 'Sundari Karthikeyan', age: 48, abha: '82-XXXX-XXXX-3312', from: 'Royapettah Urban Clinic', specialty: 'Gynaecology', urgency: 'medium', status: 'pending' },
  { id: 3, name: 'Anjalai Shanmugam', age: 39, abha: '61-XXXX-XXXX-4491', from: 'Park Town Dispensary', specialty: 'Orthopaedics', urgency: 'low', status: 'accepted' },
  { id: 4, name: 'Meenakshi Sundaram', age: 55, abha: '44-XXXX-XXXX-9023', from: 'Teynampet Health Post', specialty: 'Internal Medicine', urgency: 'medium', status: 'pending' },
];

const outgoingReferrals = [
  { id: 101, name: 'K. Soundararajan', age: 62, to: 'Omandurar Multi Super Speciality Hospital', specialty: 'Oncology', date: 'Today' },
  { id: 102, name: 'V. Balasubramanian', age: 40, to: 'Government Stanley Medical College Hospital', specialty: 'Neurology', date: 'Yesterday' },
];

export default function ReferralsPage() {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">Referrals Management</h1>
        <p className="text-sm text-ink-secondary mt-1">Manage incoming referrals and view outgoing requests.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium text-ink-primary">Incoming Referrals</h2>
        <div className="grid grid-cols-1 gap-4">
          {incomingReferrals.map((ref) => (
            <div key={ref.id} className="bg-white border border-gray-200 rounded-[14px] p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink-primary text-base">{ref.name}</h3>
                    <span className="text-sm text-ink-secondary">({ref.age} yrs)</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getUrgencyColor(ref.urgency)} uppercase font-semibold`}>
                      {ref.urgency} Priority
                    </span>
                  </div>
                  <div className="text-sm text-ink-secondary flex items-center gap-3">
                    <span>ABHA: {ref.abha}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>From: {ref.from}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="font-medium text-ink-primary">{ref.specialty}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {ref.status === 'accepted' ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-[12px] font-medium text-sm border border-green-200">
                      <CheckCircle2 size={16} />
                      Accepted
                    </div>
                  ) : (
                    <>
                      <button className="px-4 py-2 text-sm font-medium text-burgundy-700 bg-red-50 hover:bg-red-100 rounded-[12px] transition-colors border border-red-100">
                        Request More Info
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-burgundy-700 hover:bg-burgundy-800 rounded-[12px] transition-colors">
                        Accept Referral
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h2 className="text-lg font-medium text-ink-primary">Referrals Sent Out</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outgoingReferrals.map((ref) => (
            <div key={ref.id} className="bg-blush-surface border border-gray-200 rounded-[14px] p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-ink-primary">{ref.name} <span className="text-ink-secondary font-normal text-sm">({ref.age} yrs)</span></p>
                <div className="flex items-center gap-1 text-sm text-ink-secondary mt-1">
                  <span>To: {ref.to}</span>
                  <ArrowRight size={14} className="mx-1 text-gray-400" />
                  <span className="font-medium">{ref.specialty}</span>
                </div>
              </div>
              <div className="text-xs text-ink-secondary font-medium">
                {ref.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
