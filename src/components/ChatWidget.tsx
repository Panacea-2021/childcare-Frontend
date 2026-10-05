export function ChatWidget() {
  return (
    <button
      aria-label="Open chat"
      className="ui-chat-fab"
      style={{
        position: 'fixed',
        right: 22,
        bottom: 22,
        width: 56,
        height: 56,
        borderRadius: 16,
        border: 'none',
        background: 'var(--color-lavender)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 50,
        display: 'grid',
        placeItems: 'center',
        transition: 'var(--transition)',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5v-7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
        />
      </svg>
    </button>
  );
}
