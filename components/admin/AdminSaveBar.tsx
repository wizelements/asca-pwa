import AdminActionButton from './AdminActionButton';

export interface AdminSaveBarProps {
  onCancel?: () => void;
  onReset?: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  saving?: boolean;
  disabled?: boolean;
  hasChanges?: boolean;
}

export default function AdminSaveBar({
  onCancel,
  onReset,
  onSave,
  onPreview,
  saving,
  disabled,
  hasChanges,
}: AdminSaveBarProps) {
  return (
    <div className="sticky bottom-0 z-40 border-t border-admin-border-subtle bg-admin-surface p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {onCancel && (
            <AdminActionButton variant="secondary" size="sm" onClick={onCancel} disabled={saving}>
              Cancel
            </AdminActionButton>
          )}
          {onReset && (
            <AdminActionButton variant="secondary" size="sm" onClick={onReset} disabled={saving}>
              Reset
            </AdminActionButton>
          )}
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <AdminActionButton variant="secondary" size="sm" onClick={onPreview} disabled={saving}>
              Preview
            </AdminActionButton>
          )}
          {onSave && (
            <AdminActionButton
              variant="primary"
              size="sm"
              onClick={onSave}
              loading={saving}
              disabled={disabled || (!hasChanges && !saving)}
            >
              Save
            </AdminActionButton>
          )}
        </div>
      </div>
    </div>
  );
}
