import { Modal } from '@/components/ui/Modal';
import { TaskForm } from './TaskForm';
import type { Task } from '@/types/task';
import { useSettingsStore } from '@/store/settingsStore';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<Task>;
  onSave: (task: Task) => void;
}

export function TaskModal({ open, onClose, initialValues, onSave }: TaskModalProps) {
  const statuses = useSettingsStore((s) => s.settings.statuses);
  const defaultStatusId = useSettingsStore((s) => s.settings.defaultStatusId);

  const handleSave = (task: Task) => {
    onSave(task);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValues?.id ? 'Edit task' : 'New task'}
    >
      <TaskForm
        initialValues={initialValues}
        statuses={statuses}
        defaultStatusId={defaultStatusId}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
