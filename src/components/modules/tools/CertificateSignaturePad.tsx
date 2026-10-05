'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Upload } from 'lucide-react';

type Props = {
  signatureType: 'digital' | 'upload' | 'none';
  imageDataUrl: string | null;
  onTypeChange: (type: 'digital' | 'upload' | 'none') => void;
  onImageChange: (dataUrl: string | null) => void;
  onDone?: () => void;
};

export function CertificateSignaturePad({
  signatureType,
  imageDataUrl,
  onTypeChange,
  onImageChange,
  onDone,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [hasStroke, setHasStroke] = useState(Boolean(imageDataUrl));

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = 120;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2.2;
    if (imageDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = imageDataUrl;
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }, [imageDataUrl]);

  useEffect(() => {
    if (signatureType !== 'digital') return;
    resizeCanvas();
    const onResize = () => resizeCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [signatureType, resizeCanvas]);

  const pointerPos = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasStroke(true);
  };

  const onPointerUp = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasStroke(false);
    onImageChange(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const commitDigital = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke) {
      onDone?.();
      return;
    }
    onImageChange(canvas.toDataURL('image/png'));
    onDone?.();
  };

  const onFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      onImageChange(result);
      setHasStroke(Boolean(result));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="cert-sign-tools">
      <div className="ui-field">
        <label className="ui-label" htmlFor="cert-sign-type">
          Signature Type <span className="cert-optional-tag">Optional</span>
        </label>
        <select
          id="cert-sign-type"
          className="ui-input ui-select"
          value={signatureType}
          onChange={(e) => {
            const next = e.target.value as 'digital' | 'upload' | 'none';
            onTypeChange(next);
            if (next === 'none') onImageChange(null);
          }}
        >
          <option value="none">None — label only</option>
          <option value="digital">Digital Signature — draw</option>
          <option value="upload">Upload Signature — image (optional)</option>
        </select>
        <p className="cert-sign-hint">You can skip this — certificates work without a signature image.</p>
      </div>

      {signatureType === 'digital' ? (
        <>
          <div className="cert-sign-pad-wrap">
            <canvas
              ref={canvasRef}
              className="cert-sign-pad"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
            {!hasStroke && !imageDataUrl ? (
              <span className="cert-sign-pad-hint">Draw your signature here</span>
            ) : null}
          </div>
          <div className="cert-sign-pad-actions">
            <button type="button" className="ui-btn ui-btn-primary" onClick={commitDigital}>
              Done
            </button>
            <button type="button" className="ui-btn ui-btn-outline" onClick={clear}>
              Clear signature
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-secondary"
              onClick={() => {
                clear();
                onTypeChange('none');
              }}
            >
              Skip signature
            </button>
          </div>
        </>
      ) : null}

      {signatureType === 'upload' ? (
        <>
          <div className="cert-sign-upload">
            {imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageDataUrl} alt="Uploaded signature preview" className="cert-sign-upload-preview" />
            ) : (
              <button
                type="button"
                className="cert-sign-upload-btn"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={18} />
                <span>Upload signature image</span>
                <small>PNG, JPG, WebP · optional — skip anytime</small>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="cert-sign-pad-actions">
            {imageDataUrl ? (
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => fileRef.current?.click()}
              >
                Replace
              </button>
            ) : null}
            <button type="button" className="ui-btn ui-btn-outline" onClick={clear}>
              Clear signature
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-secondary"
              onClick={() => {
                clear();
                onTypeChange('none');
              }}
            >
              Skip signature
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
