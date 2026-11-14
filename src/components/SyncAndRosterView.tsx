import React, { useMemo, useState } from 'react';
import {
  Download,
  Upload,
  Check,
  Copy,
  RotateCcw,
  Database,
  FileText
} from 'lucide-react';
import {
  AppExportPayload,
  PlayerRosterItem
} from '../data/initialData';
import { generateFullChatGptReport } from '../utils/reportGenerator';

interface SyncAndRosterViewProps {
  roster: PlayerRosterItem[];
  setRoster: React.Dispatch<React.SetStateAction<PlayerRosterItem[]>>;
  activePlayerIds: string[];
  onToggleActivePlayer: (playerId: string) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  onExportJsonPayload: () => AppExportPayload;
  onImportJsonPayload: (rawJson: string) => { ok: boolean; message: string };
  onResetToFactoryData: () => void;
}

export const SyncAndRosterView: React.FC<SyncAndRosterViewProps> = ({
  onExportJsonPayload,
  onImportJsonPayload,
  onResetToFactoryData
}) => {
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [copiedClipboard, setCopiedClipboard] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedChatGptReport, setCopiedChatGptReport] = useState(false);
  const [showFullReportText, setShowFullReportText] = useState(true);
  const [preloadedHtml, setPreloadedHtml] = useState<string>('');

  const fullChatGptReport = useMemo(() => {
    const payload = onExportJsonPayload();
    return generateFullChatGptReport({
      history: payload.history || [],
      bag: payload.bag || [],
      courses: payload.courses || [],
      roster: payload.roster || [],
      roundState: payload.roundState
    });
  }, [onExportJsonPayload]);

  React.useEffect(() => {
    fetch('./github-standalone-index.html')
      .then((r) => (r.ok ? r.text() : ''))
      .then((txt) => {
        if (txt && txt.includes('<!doctype html>')) setPreloadedHtml(txt);
      })
      .catch(() => {});
  }, []);

  const copyTextReliably = async (text: string): Promise<boolean> => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) return true;
    } catch {
      // fallback to navigator.clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyChatGptReport = async () => {
    const ok = await copyTextReliably(fullChatGptReport);
    setCopiedChatGptReport(true);
    setStatusMessage({
      type: ok ? 'success' : 'error',
      text: ok
        ? 'Copied Full Detailed Gemini Report to clipboard! Ready to paste into Google Gemini.'
        : 'Select the report text below and press Ctrl+C / Cmd+C to copy.'
    });
    setTimeout(() => setCopiedChatGptReport(false), 3500);
  };

  const handleDownloadChatGptReport = () => {
    const blob = new Blob([fullChatGptReport], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DG_Full_Gemini_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({
      type: 'success',
      text: 'Downloaded Full Detailed Gemini Report (.txt)!'
    });
  };

  const handleCopyStandaloneHtml = async () => {
    try {
      let htmlText = preloadedHtml;
      if (!htmlText) {
        const res = await fetch('./github-standalone-index.html');
        if (!res.ok) throw new Error('Standalone HTML not found');
        htmlText = await res.text();
      }
      const ok = await copyTextReliably(htmlText);
      if (!ok) throw new Error('Clipboard write blocked');
      setCopiedHtml(true);
      setStatusMessage({
        type: 'success',
        text: 'Copied index.html to clipboard!'
      });
      setTimeout(() => setCopiedHtml(false), 3500);
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Clipboard blocked — use Download HTML instead.'
      });
    }
  };

  const handleDownloadStandaloneHtml = async () => {
    try {
      const res = await fetch('./github-standalone-index.html');
      const htmlText = await res.text();
      const blob = new Blob([htmlText], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({
        type: 'success',
        text: 'Downloaded index.html!'
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Could not download HTML.'
      });
    }
  };

  const handleDownloadJson = () => {
    const payload = onExportJsonPayload();
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DG_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'Downloaded JSON backup file.' });
  };

  const handleCopyJson = async () => {
    const payload = onExportJsonPayload();
    const jsonString = JSON.stringify(payload, null, 2);
    await copyTextReliably(jsonString);
    setCopiedClipboard(true);
    setStatusMessage({
      type: 'success',
      text: 'Copied JSON data to clipboard!'
    });
    setTimeout(() => setCopiedClipboard(false), 3500);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const result = onImportJsonPayload(importText);
    setStatusMessage({
      type: result.ok ? 'success' : 'error',
      text: result.message
    });
    if (result.ok) {
      setImportText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      const result = onImportJsonPayload(content);
      setStatusMessage({
        type: result.ok ? 'success' : 'error',
        text: result.message
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
              : 'bg-[#FF2E93]/15 border-[#FF2E93] text-[#FF2E93]'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* FULL DETAILED GOOGLE GEMINI STATS, BAG & ROUND REPORT */}
      <div className="neon-card rounded-2xl p-5 border-2 border-[#00F0FF] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#00F0FF] text-slate-950 text-xs font-extrabold uppercase tracking-wide">
              Google Gemini Analysis Dossier
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Complete Stats, All Discs &amp; Round Logs Report (For Google Gemini)
            </h2>
            <p className="text-xs text-slate-300">
              Formatted plain-text/Markdown master dossier containing all career stats, head-to-head rivalry, every disc&apos;s flight numbers/plastic/weight/telemetry, course hole-by-hole splits, and every round voice log.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyChatGptReport}
              className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap neon-border-lime"
            >
              {copiedChatGptReport ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied Full Report!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Report for Gemini</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadChatGptReport}
              className="px-3.5 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Download .TXT Report</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFullReportText((v) => !v)}
              className="px-3.5 py-2.5 rounded-xl bg-[#080B14] hover:border-[#00F0FF] text-white border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-[#00F0FF]" />
              <span>{showFullReportText ? 'Hide Report Text' : 'Show Report Text'}</span>
            </button>
          </div>
        </div>

        {showFullReportText && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Master Report Output ({fullChatGptReport.length.toLocaleString()} chars):</span>
              <span className="text-[#39FF14] font-bold">Click inside box to auto-select all text</span>
            </div>
            <textarea
              readOnly
              value={fullChatGptReport}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              rows={18}
              className="w-full p-3 rounded-xl border border-slate-700 bg-[#080B14] font-mono text-xs text-slate-200 focus:outline-none focus:border-[#00F0FF]"
            />
          </div>
        )}
      </div>

      {/* Clean HTML & JSON Copy / Download Box */}
      <div className="neon-card rounded-2xl p-5 border-2 border-[#39FF14] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-white">
          HTML &amp; JSON Data Export
        </h2>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyStandaloneHtml}
            className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap"
          >
            {copiedHtml ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied HTML!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy HTML</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap"
          >
            {copiedClipboard ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied JSON Data!</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Copy JSON Data</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadStandaloneHtml}
            className="px-3.5 py-2.5 rounded-xl bg-[#080B14] hover:border-[#39FF14] text-white border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#39FF14]" />
            <span>Download HTML</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-3.5 py-2.5 rounded-xl bg-[#080B14] hover:border-[#00F0FF] text-white border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#00F0FF]" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      {/* JSON Restore / Import Box */}
      <div className="neon-card border border-[#FF2E93]/40 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            Import / Restore JSON Data
          </h3>

          <label className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-700 bg-[#080B14] hover:border-[#FF2E93] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
            <Upload className="w-3.5 h-3.5 text-[#FF2E93]" />
            <span>Upload .JSON File</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <textarea
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste exported JSON data here to restore or merge..."
            className="w-full p-3 rounded-xl border border-slate-700 bg-[#080B14] font-mono-tabular text-xs text-white"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={!importText.trim()}
              className="px-4 py-2 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/85 disabled:opacity-40 text-slate-950 text-xs font-bold"
            >
              Import Pasted JSON
            </button>

            <button
              type="button"
              onClick={onResetToFactoryData}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-[#FF2E93] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Default Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
