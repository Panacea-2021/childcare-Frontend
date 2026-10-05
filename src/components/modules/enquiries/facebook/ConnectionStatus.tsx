'use client';

type Props = {
  status?: 'not_connected' | 'connected';
  label?: string;
};

export function ConnectionStatus({
  status = 'not_connected',
  label,
}: Props) {
  const isConnected = status === 'connected';
  const value = label ?? (isConnected ? 'Connected' : 'Not Connected');

  return (
    <div
      className={`fb-status${isConnected ? ' is-connected' : ''}`}
      role="status"
      aria-label={`Connection status: ${value}`}
    >
      <span className="fb-status-dot" aria-hidden />
      <span className="fb-status-label">Status</span>
      <span className="fb-status-value">{value}</span>
    </div>
  );
}
