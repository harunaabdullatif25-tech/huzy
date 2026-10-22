'use client';

import React, { useEffect, useState } from 'react';
import { Truck, MessageSquare, Settings as SettingsIcon } from 'lucide-react';

export default function DashboardSettingsPage() {
  const [baseDeliveryRate, setBaseDeliveryRate] = useState<number>(35.0);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // WhatsApp Broadcast state
  const [phoneNumbersText, setPhoneNumbersText] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.baseDeliveryRate !== undefined) {
            setBaseDeliveryRate(data.baseDeliveryRate);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseDeliveryRate: Number(baseDeliveryRate) }),
      });
      if (!res.ok) throw new Error('Failed to update platform settings');
      setSettingsMsg({ type: 'success', text: 'Delivery and fee matrix settings saved successfully.' });
    } catch (err: any) {
      setSettingsMsg({ type: 'error', text: err.message || 'Error saving settings' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const numbers = phoneNumbersText
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 5);

    if (numbers.length === 0) {
      alert('Please enter at least one valid phone number (with country code).');
      return;
    }
    if (!broadcastMessage.trim()) {
      alert('Please enter the message text to broadcast.');
      return;
    }

    setSendingBroadcast(true);
    setBroadcastResult(null);

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: numbers,
          message: broadcastMessage,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBroadcastResult(data);
      } else {
        alert(data.error || 'Failed to dispatch WhatsApp broadcast');
      }
    } catch (err) {
      console.error('Broadcast error:', err);
      alert('Network or server error sending WhatsApp broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-10 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Platform Settings &amp; Delivery Controls</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Configure financial rules, dynamic delivery urgency surcharge tiers, and WhatsApp merchant communications.
        </p>
      </div>

      {/* Section 1: Delivery Urgency Fee Matrix */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-1 flex items-center gap-2">
          <Truck className="w-5 h-5 text-stone-900 dark:text-white" /> Dynamic Delivery Urgency Fee Matrix
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
          Checkout lead time dynamically calculates customer shipping fees based on proximity to preferred delivery date.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Base Delivery Rate (GH₵)
            </label>
            <div className="relative rounded-lg shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 dark:text-stone-500 font-semibold text-xs">
                GH₵
              </div>
              <input
                type="number"
                step="0.50"
                min="0"
                required
                value={baseDeliveryRate}
                onChange={e => setBaseDeliveryRate(parseFloat(e.target.value) || 0)}
                className="w-full pl-12 pr-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 dark:text-stone-100 font-medium transition-colors"
              />
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Standard 4+ day ground rate applied as baseline in Cedis.</p>
          </div>

          {/* Matrix Breakdown Preview */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <div className="bg-stone-50 dark:bg-stone-800/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              Live Calculated Fee Matrix
            </div>
            <div className="divide-y divide-stone-200 dark:divide-stone-800 text-sm">
              <div className="px-4 py-3 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20">
                <div>
                  <span className="font-semibold text-red-900 dark:text-red-300">Same-Day Express (0 days)</span>
                  <p className="text-xs text-red-600 dark:text-red-400">Rush same-day dispatch &amp; courier surge</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/60 text-xs font-bold rounded mr-2">
                    2.0x (+100%)
                  </span>
                  <span className="font-bold text-stone-900 dark:text-white font-mono text-base">
                    GH₵{(baseDeliveryRate * 2.0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
                <div>
                  <span className="font-semibold text-amber-900 dark:text-amber-300">Next-Day Express (1 day)</span>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Priority overnight production queue</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold rounded mr-2">
                    1.5x (+50%)
                  </span>
                  <span className="font-bold text-stone-900 dark:text-white font-mono text-base">
                    GH₵{(baseDeliveryRate * 1.5).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20">
                <div>
                  <span className="font-semibold text-indigo-900 dark:text-indigo-300">Priority Scheduled (2–3 days)</span>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Expedited routing &amp; staging</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold rounded mr-2">
                    1.2x (+20%)
                  </span>
                  <span className="font-bold text-stone-900 dark:text-white font-mono text-base">
                    GH₵{(baseDeliveryRate * 1.2).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between bg-white dark:bg-stone-900">
                <div>
                  <span className="font-semibold text-stone-900 dark:text-white">Standard Delivery (4+ days)</span>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Standard factory batch fulfillment</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-bold rounded mr-2">
                    1.0x (Standard)
                  </span>
                  <span className="font-bold text-stone-900 dark:text-white font-mono text-base">
                    GH₵{(baseDeliveryRate * 1.0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {settingsMsg && (
            <div
              className={`p-3 rounded-lg text-sm ${
                settingsMsg.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}
            >
              {settingsMsg.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Urgency Matrix'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Admin Bulk WhatsApp Messaging Tool */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-1 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" /> Admin Bulk WhatsApp Broadcast Tool
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
          Broadcast packaging announcements, seasonal discounts, or production updates directly to registered customer phone numbers via Meta WhatsApp Business API.
        </p>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Target Phone Numbers (separated by commas or new lines, including international country code)
            </label>
            <textarea
              rows={3}
              required
              value={phoneNumbersText}
              onChange={e => setPhoneNumbersText(e.target.value)}
              placeholder="+233201234567, +2348012345678, +14155552671"
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg font-mono text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Broadcast Message Content
            </label>
            <textarea
              rows={4}
              required
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              placeholder="Hi there! Get 15% off custom corrugated mailer boxes this week with code PACKFAST. Reorder anytime from your account dashboard."
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          {broadcastResult && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-900 dark:text-blue-300">
              <span className="font-bold">Broadcast Dispatch Completed:</span> {broadcastResult.sent} messages sent successfully, {broadcastResult.failed} failed.
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={sendingBroadcast}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-medium rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
              </svg>
              {sendingBroadcast ? 'Dispatching Broadcast...' : 'Send WhatsApp Broadcast'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Merchant Integration Handles */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-1 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-stone-900 dark:text-white" /> Merchant Channels &amp; Payment Gateway Configuration
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          Environment variables active for Paystack and merchant social channels. Set these in your <code className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1 py-0.5 rounded text-xs text-amber-600 dark:text-amber-400">.env.local</code> file.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="font-semibold text-stone-800 dark:text-stone-200">Floating WhatsApp Widget</span>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">NEXT_PUBLIC_WHATSAPP_NUMBER</div>
            <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
              {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890 (Default)'}
            </div>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="font-semibold text-stone-800 dark:text-stone-200">Official TikTok Showcase</span>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">NEXT_PUBLIC_TIKTOK_HANDLE</div>
            <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
              {process.env.NEXT_PUBLIC_TIKTOK_HANDLE || '@packagingsolutions (Default)'}
            </div>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="font-semibold text-stone-800 dark:text-stone-200">Paystack Checkout Processing</span>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</div>
            <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              Configured via /api/paystack/initialize
            </div>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="font-semibold text-stone-800 dark:text-stone-200">Database Engine</span>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">MONGODB_URI</div>
            <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              MongoDB Atlas with Mongoose ODM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
