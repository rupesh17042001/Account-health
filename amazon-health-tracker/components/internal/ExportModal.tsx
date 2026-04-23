'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/export/csv');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded!');
      onClose();
    } catch {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/export/csv');
      if (!res.ok) throw new Error('Export failed');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      toast.success('CSV copied to clipboard!');
    } catch {
      toast.error('Copy failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data">
      <div className="space-y-4">
        <p className="text-sm text-[#94a3b8]">
          Export all brands&apos; health data, violations, and suppressed listings as a CSV file.
        </p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleDownload} loading={loading} className="flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download CSV
          </Button>
          <Button variant="secondary" onClick={handleCopy} loading={loading} className="flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copy to Clipboard
          </Button>
        </div>
      </div>
    </Modal>
  );
}
