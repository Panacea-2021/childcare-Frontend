import QRCode from 'qrcode';

export type AdmissionFillParams = {
  processId: string;
  enquiryId?: string;
  studentId?: string;
};

export function getAdmissionFillPath({ processId, enquiryId, studentId }: AdmissionFillParams) {
  const base = `/forms/admission-fill/${encodeURIComponent(processId)}`;
  const qs = new URLSearchParams();
  if (enquiryId) qs.set('enquiry', enquiryId);
  if (studentId) qs.set('student', studentId);
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}

export function getAdmissionFillUrl(params: AdmissionFillParams) {
  if (typeof window === 'undefined') return getAdmissionFillPath(params);
  return `${window.location.origin}${getAdmissionFillPath(params)}`;
}

export async function copyAdmissionFillLink(params: AdmissionFillParams): Promise<string> {
  const url = getAdmissionFillUrl(params);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  } else {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  return url;
}

function safeFileName(name: string) {
  return name.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'admission';
}

export async function downloadAdmissionQr(
  processName: string,
  params: AdmissionFillParams,
): Promise<string> {
  const url = getAdmissionFillUrl(params);
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 512,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${safeFileName(processName)}-admission-qr.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return url;
}
