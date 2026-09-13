import React, { useState } from 'react';
import { X, Store, Save, Percent } from 'lucide-react';
import { StoreProfile } from '../types';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeProfile: StoreProfile;
  taxRate: number;
  onSave: (profile: StoreProfile, taxRate: number) => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  storeProfile,
  taxRate,
  onSave,
}) => {
  const [profile, setProfile] = useState<StoreProfile>({ ...storeProfile });
  const [taxPercent, setTaxPercent] = useState<number>(taxRate * 100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile, (taxPercent || 0) / 100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-50 w-full max-w-lg rounded-xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Store & Receipt Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Store / Business Name
            </label>
            <input
              type="text"
              value={profile.storeName}
              onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Store Address
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Contact Phone / Mobile
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                STRN (Sales Tax No)
              </label>
              <input
                type="text"
                placeholder="STRN: 1234567-8"
                value={profile.strn}
                onChange={(e) => setProfile({ ...profile, strn: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                NTN (National Tax No)
              </label>
              <input
                type="text"
                placeholder="NTN: 1234567-8"
                value={profile.ntn}
                onChange={(e) => setProfile({ ...profile, ntn: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Sales Tax / GST Rate (%)
            </label>
            <div className="relative w-32">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Default is 5% matching standard billing system settings.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
