'use client';

import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Modal } from '@/components/ui/Modal';
import type { Student } from '@/lib/center-management/types';
import {
  DownloadActions,
  FloatingBackground,
  InstructionTimeline,
  QRCodePreviewCard,
  StatsCards,
  StudentInfoCard,
} from './student-kiosk-qr';
import './student-kiosk-qr/student-kiosk-qr.css';

type Props = {
  open: boolean;
  students: Student[];
  onClose: () => void;
  centerLabel?: string;
};

function kioskPayload(student: Student) {
  return `PANACEA-KIOSK:${student.id}:${student.kioskCode ?? student.admissionNumber ?? ''}`;
}

function safeFileName(name: string) {
  return name.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-');
}

async function qrDataUrl(student: Student) {
  return QRCode.toDataURL(kioskPayload(student), {
    margin: 1,
    width: 400,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/** Premium Student Kiosk QR Codes shell (logic unchanged). */
export function StudentKioskQrModal({
  open,
  students,
  onClose,
  centerLabel = 'Panacea | Daycare',
}: Props) {
  const [index, setIndex] = useState(0);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [dir, setDir] = useState(1);

  const total = students.length;
  const student = students[Math.min(index, Math.max(0, total - 1))];

  useEffect(() => {
    if (!open) return;
    setIndex(0);
  }, [open, students]);

  useEffect(() => {
    if (!open || !student) {
      setQrUrl('');
      return;
    }
    let alive = true;
    qrDataUrl(student).then((url) => {
      if (alive) setQrUrl(url);
    });
    return () => {
      alive = false;
    };
  }, [open, student]);

  const go = (next: number) => {
    if (next < 0 || next >= total) return;
    setDir(next > index ? 1 : -1);
    setIndex(next);
  };

  const downloadOne = async () => {
    if (!student) return;
    const url = qrUrl || (await qrDataUrl(student));
    downloadDataUrl(url, `${safeFileName(student.name)}-kiosk-qr.png`);
  };

  const downloadAll = async () => {
    if (!students.length || busy) return;
    setBusy(true);
    try {
      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const url = await qrDataUrl(s);
        downloadDataUrl(url, `${safeFileName(s.name)}-kiosk-qr.png`);
        await new Promise((r) => window.setTimeout(r, 180));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open && Boolean(student)}
      title="Student Kiosk QR Codes"
      subtitle="Print QR cards for student check-in."
      elevated
      xl
      autoHeight
      iconClose
      className="slq-modal"
      icon={<QrCode size={22} strokeWidth={1.75} />}
      onClose={onClose}
    >
      {student ? (
        <div className="slq-root">
          <FloatingBackground />
          <div className="slq-grid">
            <QRCodePreviewCard
              student={student}
              qrUrl={qrUrl}
              centerLabel={centerLabel}
              index={index}
              total={total}
              dir={dir}
              onPrev={() => go(index - 1)}
              onNext={() => go(index + 1)}
              onGo={go}
            />
            <div className="slq-right">
              <StudentInfoCard student={student} />
              <InstructionTimeline />
              <StatsCards selected={total} generated={total} schoolLabel="1" />
              <DownloadActions
                total={total}
                busy={busy}
                onDownloadOne={downloadOne}
                onDownloadAll={downloadAll}
              />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

/** Alias matching the QR redesign component name. */
export const QRCodeModal = StudentKioskQrModal;

/** Single-student wrapper used on Student Profile. */
export function StudentQrModal({
  open,
  student,
  onClose,
  centerLabel,
}: {
  open: boolean;
  student: Student;
  onClose: () => void;
  centerLabel?: string;
}) {
  return (
    <StudentKioskQrModal
      open={open}
      students={open ? [student] : []}
      onClose={onClose}
      centerLabel={centerLabel}
    />
  );
}
