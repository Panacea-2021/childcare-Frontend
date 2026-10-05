type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="ui-empty">
      <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>{title}</h3>
      {description ? <p style={{ margin: '0 0 16px' }}>{description}</p> : null}
      {action}
    </div>
  );
}
