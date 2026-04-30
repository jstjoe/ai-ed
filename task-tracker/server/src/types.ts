export type TimeEstimate = '5m' | '15m' | '30m' | '1h' | '2h' | '3h+' | 'unknown';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Status {
  id: number;
  name: string;
  color: string;
  position: number;
  is_done: number;
  is_terminal: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status_id: number;
  time_estimate: TimeEstimate;
  priority: Priority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  status_name?: string;
  status_color?: string;
  status_is_done?: number;
  status_is_terminal?: number;
}
