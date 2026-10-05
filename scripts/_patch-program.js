const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'components', 'modules', 'ProgramPage.tsx');
let s = fs.readFileSync(file, 'utf8');
const nl = s.includes('\r\n') ? '\r\n' : '\n';
const start = s.indexOf("  if (view === 'add') {");
const listNeedle =
  nl + '  return (' + nl + '    <div className={`mod-page $' + '{styles.page}`}>';
const listReturn = s.indexOf(listNeedle, start);
if (start < 0 || listReturn < 0) {
  console.error('failed', { start, listReturn, nl: JSON.stringify(nl) });
  process.exit(1);
}
const replacement = [
  "  if (view === 'add') {",
  '    return (',
  '      <ProgramAddWizard',
  "        onBack={() => setView('list')}",
  '        onCreated={(record) => {',
  '          setPrograms((items) => [record, ...items]);',
  "          setView('list');",
  '          setPage(1);',
  "          setStatusFilter('Active');",
  "          setToast('Program created successfully');",
  '        }}',
  '      />',
  '    );',
  '  }',
  '',
].join(nl);
s = s.slice(0, start) + replacement + s.slice(listReturn + nl.length);
if (!s.includes('styles.toast')) {
  const ambient = '      <div className={styles.ambient} aria-hidden />' + nl + nl + '      <div className={styles.head}>';
  const toastBlock = [
    '      <div className={styles.ambient} aria-hidden />',
    '      {toast ? (',
    '        <div className={styles.toast} role="status">',
    '          <span aria-hidden>✓</span>',
    '          <span>{toast}</span>',
    "          <button type=\"button\" aria-label=\"Dismiss\" onClick={() => setToast('')}>",
    '            ×',
    '          </button>',
    '        </div>',
    '      ) : null}',
    '',
    '      <div className={styles.head}>',
  ].join(nl);
  if (!s.includes(ambient)) {
    console.error('ambient not found');
    process.exit(1);
  }
  s = s.replace(ambient, toastBlock);
}
fs.writeFileSync(file, s);
console.log('patched ok');
