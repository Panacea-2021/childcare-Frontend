import QRCode from 'qrcode';
import type { FormItem } from './types';

export function getFormSharePath(formId: string) {
  return `/forms/fill/${encodeURIComponent(formId)}`;
}

export function getFormShareUrl(formId: string) {
  if (typeof window === 'undefined') return getFormSharePath(formId);
  return `${window.location.origin}${getFormSharePath(formId)}`;
}

export async function copyFormShareLink(formId: string): Promise<string> {
  const url = getFormShareUrl(formId);
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
  return name.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'form';
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Generate and download a PNG QR that opens the shareable form URL. */
export async function downloadFormQr(form: Pick<FormItem, 'id' | 'name'>): Promise<string> {
  const url = getFormShareUrl(form.id);
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 512,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
  downloadDataUrl(dataUrl, `${safeFileName(form.name)}-qr.png`);
  return url;
}
