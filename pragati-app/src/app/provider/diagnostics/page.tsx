'use client';
import { useState } from 'react';
import { Save, Clock, AlertCircle } from 'lucide-react';

export default function DiagnosticsPage() {
  const [services, setServices] = useState([
    { id: 1, name: 'ECG', status: 'available', waitTime: 15, updated: '10 mins ago' },
    { id: 2, name: 'X-Ray', status: 'limited', waitTime: 45, updated: '1 hour ago' },
    { id: 3, name: 'CT Scan', status: 'unavailable', waitTime: 0, updated: '2 hours ago' },
    { id: 4, name: 'Blood Work', status: 'available', waitTime: 10, updated: '5 mins ago' },
    { id: 5, name: 'Ultrasound', status: 'available', waitTime: 20, updated: '15 mins ago' },
    { id: 6, name: 'MRI', status: 'unavailable', waitTime: 0, updated: '3 hours ago' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-primary">Diagnostics Management</h1>
          <p className="text-sm text-ink-secondary mt-1">Manage availability and wait times for diagnostics.</p>
        </div>
        <button className="flex items-center gap-2 bg-burgundy-700 hover:bg-burgundy-800 text-white px-4 py-2 rounded-[12px] font-medium transition-colors text-sm">
          <Save size={16} />
          Update All
        </button>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-[12px] p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Availability updates are visible to patients in real time.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[14px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[13px] text-ink-secondary">
                <th className="px-6 py-3 font-medium">Service Name</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Wait Time (mins)</th>
                <th className="px-6 py-3 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service, index) => (
                <tr key={service.id} className="text-[13px]">
                  <td className="px-6 py-4 font-medium text-ink-primary">{service.name}</td>
                  <td className="px-6 py-4">
                    <select
                      className={`text-xs px-2 py-1 rounded-full border outline-none font-medium ${
                        service.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                        service.status === 'limited' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}
                      value={service.status}
                      onChange={(e) => {
                        const newServices = [...services];
                        newServices[index].status = e.target.value;
                        setServices(newServices);
                      }}
                    >
                      <option value="available">Available</option>
                      <option value="limited">Limited</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <input
                        type="number"
                        className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-burgundy-700"
                        value={service.waitTime}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[index].waitTime = parseInt(e.target.value) || 0;
                          setServices(newServices);
                        }}
                        disabled={service.status === 'unavailable'}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ink-secondary text-xs">{service.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
