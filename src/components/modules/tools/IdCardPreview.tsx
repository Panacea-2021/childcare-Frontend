'use client';

import type { ReactNode } from 'react';
import type { IdCardTemplate, MockStudent } from './toolsData';

type Props = {
  template: IdCardTemplate;
  student?: MockStudent;
  schoolName?: string;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
  showBlood?: boolean;
  showQr?: boolean;
  roleLabel?: string;
  displayFields?: string[];
  backFields?: string[];
  nameFontSize?: number;
  typeFontSize?: number;
  textColor?: string;
  bodyFontSize?: number;
  fontFamily?: string;
  backTextColor?: string;
  backFontSize?: number;
  backFontFamily?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  showParentPhotos?: boolean;
  previewSide?: 'front' | 'back' | 'both';
};

function QrBlock({ large }: { large?: boolean }) {
  return (
    <div className={`idc-qr ${large ? 'is-large' : ''}`} aria-hidden>
      {Array.from({ length: 36 }).map((_, i) => (
        <i key={i} className={i % 3 === 0 || i % 5 === 0 ? 'on' : ''} />
      ))}
    </div>
  );
}

function SchoolMark() {
  return (
    <span className="idc-logo" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 40 40">
        <path d="M20 4 L34 14 L28 32 L12 32 L6 14 Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M20 10 L28 16 L20 28 L12 16 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

function AccentBar() {
  return <div className="idc-accent-bar" aria-hidden />;
}

function Avatar({ name, round = true }: { name: string; round?: boolean }) {
  return (
    <div className={`idc-photo ${round ? 'is-round' : 'is-square'}`} aria-hidden>
      <span>{name.charAt(0)}</span>
    </div>
  );
}

function ParentChip({
  label,
  name,
  phone,
  showPhoto,
}: {
  label: string;
  name: string;
  phone?: string;
  showPhoto?: boolean;
}) {
  return (
    <div className="idc-parent-chip">
      {showPhoto !== false ? (
        <div className="idc-parent-avatar" aria-hidden>
          {name.charAt(0)}
        </div>
      ) : null}
      <div>
        <strong>{label}</strong>
        <span>{name}</span>
        {phone ? <em className="idc-parent-phone">{phone}</em> : null}
      </div>
    </div>
  );
}

function DynamicFields({
  fields,
  values,
  showBlood,
  light,
}: {
  fields: string[];
  values: Record<string, string>;
  showBlood?: boolean;
  light?: boolean;
}) {
  const list = fields.length
    ? fields
    : ['admission', ...(showBlood ? ['blood'] : []), 'dob'];

  const labels: Record<string, string> = {
    admission: 'Admission No.',
    blood: 'Blood Group',
    dob: 'Date of Birth',
    motherPhone: "Mother's No.",
    fatherPhone: "Father's No.",
    emergency: 'Emergency No.',
    admissionDate: 'Admission Date',
    allergies: 'Allergies',
  };

  return (
    <dl className={`idc-meta stacked idc-info-rows ${light ? 'light' : ''}`}>
      {list.map((id) => (
        <div key={id}>
          <dt>{labels[id] ?? id}</dt>
          <dd>{values[id] ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function CardDecor({ variant }: { variant: 'festive' | 'geo' }) {
  if (variant === 'geo') {
    return (
      <div className="idc-decor idc-decor-geo" aria-hidden>
        <span className="corner tl" />
        <span className="corner br" />
      </div>
    );
  }
  return (
    <div className="idc-decor idc-decor-festive" aria-hidden>
      <span className="dot d1" />
      <span className="dot d2" />
      <span className="dot d3" />
      <span className="arc" />
    </div>
  );
}

export function IdCardPreview({
  template,
  student,
  schoolName = 'Panacea | Childcare',
  selected,
  onSelect,
  compact,
  showBlood = true,
  showQr = true,
  roleLabel,
  displayFields = ['admission', 'blood', 'dob'],
  backFields = ['motherName', 'motherPhone', 'fatherName', 'fatherPhone', 'schoolAddress', 'schoolPhone', 'schoolEmail'],
  nameFontSize,
  typeFontSize,
  textColor,
  bodyFontSize,
  fontFamily,
  backTextColor,
  backFontSize,
  backFontFamily,
  schoolAddress = '12 Park Lane, Childcare Campus',
  schoolPhone = '+91 80 4000 1200',
  schoolEmail = 'hello@panacea.care',
  showParentPhotos = true,
  previewSide = 'both',
}: Props) {
  const name = student?.name ?? template.sampleName;
  const role = roleLabel ?? template.sampleRole;
  const admission =
    student?.admissionNo ??
    (template.theme === 'wave' || template.theme === 'landscape' ? 'STF-204' : 'ADM-1024');
  const blood = student?.bloodGroup ?? 'B+';
  const dob = student?.dob ?? '08/08/2020';
  const father = student?.father ?? 'James Harden';
  const mother = student?.mother ?? 'Olivia Wilson';
  const phone = student?.phone ?? '+91 98765 43210';
  const email = student?.email ?? 'hello@panacea.care';
  const joinDate = student?.joinDate ?? '01 Jun 2023';
  const isStaff = template.theme === 'wave' || template.theme === 'landscape';

  const fieldValues: Record<string, string> = {
    admission,
    blood,
    dob,
    motherPhone: phone,
    fatherPhone: phone,
    emergency: phone,
    admissionDate: joinDate,
    allergies: 'None',
  };

  const poppins = 'var(--font-body), Poppins, sans-serif';
  void fontFamily;
  void backFontFamily;
  const nameStyle = {
    fontSize: nameFontSize ? `${Math.max(12, nameFontSize * 0.32)}px` : undefined,
    color: textColor,
    fontFamily: poppins,
  };
  const roleStyle = {
    fontSize: typeFontSize ? `${Math.max(10, typeFontSize * 0.28)}px` : undefined,
    fontFamily: poppins,
  };
  const metaStyle = {
    fontSize: bodyFontSize ? `${Math.max(9, bodyFontSize * 0.28)}px` : undefined,
    color: textColor,
    fontFamily: poppins,
  };
  const backStyle = {
    fontSize: backFontSize ? `${Math.max(9, backFontSize * 0.28)}px` : undefined,
    color: backTextColor || textColor,
    fontFamily: poppins,
  };

  const show = (id: string) => backFields.includes(id);

  const backPanel = (opts?: { light?: boolean; qrFirst?: boolean }) => (
    <div className="idc-back-inner" style={backStyle}>
      {opts?.qrFirst && showQr ? (
        <>
          <h5 className={opts.light ? 'light' : undefined}>Attendance QR Code</h5>
          <QrBlock large />
        </>
      ) : (
        <h5 className={opts?.light ? 'light' : undefined}>Parent Details</h5>
      )}

      {(show('motherName') || show('motherPhone') || show('fatherName') || show('fatherPhone')) && !opts?.qrFirst ? (
        <div className="idc-parents">
          {show('motherName') || show('motherPhone') ? (
            <ParentChip
              label="Mother's Name"
              name={mother}
              phone={show('motherPhone') ? phone : undefined}
              showPhoto={showParentPhotos}
            />
          ) : null}
          {show('fatherName') || show('fatherPhone') ? (
            <ParentChip
              label="Father's Name"
              name={father}
              phone={show('fatherPhone') ? phone : undefined}
              showPhoto={showParentPhotos}
            />
          ) : null}
        </div>
      ) : null}

      {!opts?.qrFirst && showQr && (template.theme === 'geo' || isStaff) ? <QrBlock large /> : null}

      {show('schoolAddress') || show('schoolPhone') || show('schoolEmail') || show('website') ? (
        <div className={`idc-address soft ${opts?.light ? 'light' : ''}`}>
          {show('schoolAddress') ? (
            <>
              <p>
                <strong>School Address</strong>
              </p>
              <p>{schoolAddress}</p>
            </>
          ) : null}
          {show('schoolPhone') ? <p>☎ {schoolPhone}</p> : null}
          {show('schoolEmail') ? <p>✉ {schoolEmail}</p> : null}
          {show('website') ? <p>🌐 panacea.childcare</p> : null}
        </div>
      ) : null}
      <p className={`idc-powered ${opts?.light ? 'light' : ''}`}>Powered by Panacea</p>
    </div>
  );

  let front: ReactNode;
  let back: ReactNode;

  if (template.theme === 'festive') {
    front = (
      <div className="idc-side idc-front festive-front">
        <CardDecor variant="festive" />
        <div className="idc-card-banner festive-banner">
          <div className="idc-brand-row light">
            <SchoolMark />
            <p className="idc-school">{schoolName}</p>
          </div>
          <span className="idc-banner-tag">STUDENT ID</span>
        </div>
        <div className="idc-card-body">
          <div className="idc-avatar-ring">
            <Avatar name={name} />
          </div>
          <h4 className="idc-name" style={nameStyle}>
            {name}
          </h4>
          <p className="idc-role pill" style={roleStyle}>
            {role}
          </p>
          <div className="idc-info-panel" style={metaStyle}>
            <DynamicFields fields={displayFields} values={fieldValues} showBlood={showBlood} />
          </div>
          <div className="idc-front-foot">
            {showQr ? <QrBlock /> : null}
            <span>panacea.childcare</span>
          </div>
        </div>
      </div>
    );
    back = (
      <div className="idc-side idc-back festive-back">
        <div className="idc-card-banner festive-banner slim">
          <p className="idc-school light-inline">{schoolName}</p>
        </div>
        <div className="idc-card-body">{backPanel()}</div>
      </div>
    );
  } else if (template.theme === 'crimson') {
    front = (
      <div className="idc-side idc-front crimson-front">
        <div className="idc-card-banner crimson-banner">
          <div className="idc-brand-row light">
            <SchoolMark />
            <p className="idc-school">{schoolName}</p>
          </div>
          <span className="idc-banner-tag">IDENTITY CARD</span>
        </div>
        <div className="idc-card-body">
          <div className="idc-avatar-ring">
            <Avatar name={name} />
          </div>
          <h4 className="idc-name" style={nameStyle}>
            {name}
          </h4>
          <p className="idc-role pill" style={roleStyle}>
            {role}
          </p>
          <div className="idc-info-panel" style={metaStyle}>
            <DynamicFields fields={displayFields} values={fieldValues} showBlood={showBlood} />
          </div>
          <div className="idc-front-foot">
            {showQr ? <QrBlock /> : null}
            <span>panacea.childcare</span>
          </div>
        </div>
      </div>
    );
    back = (
      <div className="idc-side idc-back crimson-back">
        <div className="idc-card-banner crimson-banner slim">
          <p className="idc-school light-inline">{schoolName}</p>
        </div>
        <div className="idc-card-body">{backPanel()}</div>
      </div>
    );
  } else if (template.theme === 'geo') {
    front = (
      <div className="idc-side idc-front geo-front">
        <CardDecor variant="geo" />
        <div className="idc-card-banner geo-banner">
          <div className="idc-brand-row">
            <SchoolMark />
            <p className="idc-school">{schoolName}</p>
          </div>
          <span className="idc-banner-tag geo-tag">STUDENT ID</span>
        </div>
        <div className="idc-card-body">
          <div className="idc-avatar-ring">
            <Avatar name={name} />
          </div>
          <h4 className="idc-name" style={nameStyle}>
            {name}
          </h4>
          <p className="idc-role pill aqua" style={roleStyle}>
            {role}
          </p>
          <div className="idc-info-panel" style={metaStyle}>
            <DynamicFields fields={displayFields} values={fieldValues} showBlood={showBlood} />
          </div>
          <div className="idc-front-foot">
            {showQr ? <QrBlock /> : null}
            <span>panacea.childcare</span>
          </div>
        </div>
      </div>
    );
    back = (
      <div className="idc-side idc-back geo-back">
        <CardDecor variant="geo" />
        <div className="idc-card-banner geo-banner slim">
          <p className="idc-school">Attendance</p>
        </div>
        <div className="idc-card-body">{backPanel({ qrFirst: true })}</div>
      </div>
    );
  } else if (template.theme === 'wave') {
    front = (
      <div className="idc-side idc-front wave-front">
        <div className="idc-wave-top">
          <div className="idc-brand-row light">
            <SchoolMark />
            <p className="idc-school">{schoolName}</p>
          </div>
        </div>
        <div className="idc-wave-body">
          <div className="idc-avatar-ring">
            <Avatar name={name} />
          </div>
          <h4 className="idc-name">{name}</h4>
          <p className="idc-role navy">{role}</p>
          <dl className="idc-meta stacked idc-info-rows">
            <div>
              <dt>Staff ID</dt>
              <dd>{admission}</dd>
            </div>
            <div>
              <dt>Join Date</dt>
              <dd>{joinDate}</dd>
            </div>
            <div>
              <dt>Phone No</dt>
              <dd>{phone}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{email}</dd>
            </div>
          </dl>
        </div>
        <div className="idc-wave-bottom" aria-hidden />
      </div>
    );
    back = (
      <div className="idc-side idc-back wave-back">
        <AccentBar />
        {backPanel({ qrFirst: true })}
      </div>
    );
  } else {
    front = (
      <div className="idc-side idc-front landscape-front">
        <div className="idc-land-accent" aria-hidden />
        <div className="idc-land-row">
          <Avatar name={name} round={false} />
          <div className="idc-land-info">
            <p className="idc-school sm">{schoolName}</p>
            <h4 className="idc-name left">{name}</h4>
            <p className="idc-role left muted">{role}</p>
            <dl className="idc-meta stacked tight">
              <div>
                <dt>Staff ID</dt>
                <dd>{admission}</dd>
              </div>
              <div>
                <dt>Join Date</dt>
                <dd>{joinDate}</dd>
              </div>
              <div>
                <dt>Phone No</dt>
                <dd>{phone}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
    back = (
      <div className="idc-side idc-back landscape-back">
        <div className="idc-land-accent" aria-hidden />
        {backPanel({ qrFirst: true })}
      </div>
    );
  }

  const content = (
    <div
      className={`idc-pair theme-${template.theme} orient-${template.orientation} ${compact ? 'is-compact' : ''} ${isStaff ? 'is-staff' : ''} side-${previewSide}`}
    >
      {previewSide !== 'back' ? front : null}
      {previewSide !== 'front' ? back : null}
    </div>
  );

  if (!onSelect) return content;

  return (
    <button
      type="button"
      className={`idc-template-btn ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="idc-template-name">{template.name}</span>
      {content}
    </button>
  );
}
