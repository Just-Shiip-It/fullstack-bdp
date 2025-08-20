'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getDonationHistory } from '@/lib/actions/donations';
import { useAuth } from '@/components/providers/AuthProvider';

export default function HistoryTab() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;

      try {
        setLoading(true);
        const donations = await getDonationHistory();
        setHistory(donations);
      } catch (err) {
        console.error('Error loading donation history:', err);
        setError('Failed to load donation history');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [user]);

  const downloadCert = (index: number) => {
    const entry = history[index];
    if (!entry || !user) return;

    const date = new Date(entry.donationDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const name = user.name || 'Donor';

    const certHtml = `<!doctype html><html><head><meta charset="utf-8"><title>LifeDrop Certificate</title>
      <style>body{font-family:system-ui;background:#0b0b10;color:#fff;margin:0;padding:40px} .card{max-width:800px;margin:0 auto;padding:40px;border-radius:24px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)} .title{font-size:28px;font-weight:800;margin:16px 0}</style><\/head>
      <body><div class="card"><h1>LifeDrop</h1><div class="title">Thank you, ${name}!</div>
      <p>This certifies your ${entry.donationType || 'Blood'} donation on ${date} at ${entry.location || '-'}. Your generosity saves lives.</p>
      <p>Certificate ID: ${entry.id}</p>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div><\/body><\/html>`;

    const blob = new Blob([certHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifedrop-certificate-${date.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    if (history.length === 0) return;

    if (!user) return;

    const parts = history.map((entry, i) => {
      const date = new Date(entry.donationDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const name = user.name || 'Donor';
      return `<section style="margin:20px 0;padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)">
        <h2>Certificate ${i + 1}</h2>
        <p><strong>Thank you, ${name}!</strong></p>
        <p>This certifies your ${entry.donationType || 'Blood'} donation on ${date} at ${entry.location || '-'}.</p>
        <p>Certificate ID: ${entry.id}</p>
      </section>`;
    }).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>LifeDrop — All Certificates</title><\/head><body style="background:#0b0b10;color:#fff;font-family:system-ui,sans-serif;padding:24px">${parts}<\/body><\/html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lifedrop-certificates.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
            <p className="mt-2 text-slate-300">Loading donation history...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-6">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">Donation history</h3>
            <Button variant="outline" onClick={downloadAll} disabled={history.length === 0}>
              Download all
            </Button>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Type</th>
                  <th className="text-left px-4 py-2">Location</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="px-4 py-2">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      No donations yet.
                    </td>
                  </tr>
                ) : (
                  history.map((entry, index) => {
                    const date = new Date(entry.donationDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    return (
                      <tr key={entry.id}>
                        <td className="px-4 py-2">{date}</td>
                        <td className="px-4 py-2 capitalize">{entry.donationType || 'Blood'}</td>
                        <td className="px-4 py-2">{entry.location || '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${entry.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : entry.status === 'deferred'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                            }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadCert(index)}
                            disabled={entry.status !== 'completed'}
                          >
                            Download
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Timeline</h3>
          <div className="mt-3">
            {history.length === 0 ? (
              <div className="text-sm text-slate-400">No history yet.</div>
            ) : (
              history.map((entry, index) => {
                const date = new Date(entry.donationDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                return (
                  <div key={entry.id} className="relative pl-6 py-3">
                    <div className={`absolute left-0 top-4 w-3 h-3 rounded-full ${entry.status === 'completed'
                        ? 'bg-gradient-to-tr from-blood-500 to-rose-500'
                        : entry.status === 'deferred'
                          ? 'bg-gradient-to-tr from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-tr from-gray-500 to-slate-500'
                      }`}></div>
                    <div className="text-sm text-slate-300">{date}</div>
                    <div className="font-semibold capitalize">{entry.donationType || 'Blood'} • {entry.location || '-'}</div>
                    {entry.status !== 'completed' && (
                      <div className="text-xs text-slate-400 mt-1">Status: {entry.status}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
