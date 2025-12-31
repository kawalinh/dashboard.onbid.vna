
export enum AssetType {
  BDS = 'Bất động sản',
  SIM = 'Sim số',
  PLATE = 'Biển số xe',
  OTHER = 'Khác'
}

export enum SessionStatus {
  ONGOING = 'Đang diễn ra',
  ENDED = 'Đã kết thúc',
  CANCELED = 'Bị hủy'
}

export enum SessionResult {
  SUCCESS = 'Thành công',
  FAIL = 'Thất bại',
  NA = 'N/A'
}

export enum ApprovalStatus {
  PENDING = 'Chờ duyệt',
  APPROVED = 'Đã duyệt',
  REJECTED = 'Từ chối'
}

export interface Asset {
  asset_id: string;
  asset_name: string;
  asset_type: AssetType;
  owner_id: string;
  owner_name: string;
  start_price: number;
  reserve_price: number;
  created_at: Date;
}

export interface AuctionSession {
  session_id: string;
  asset_id: string;
  session_title: string;
  session_status: SessionStatus;
  session_result: SessionResult;
  start_time: Date;
  end_time: Date;
  winning_price: number;
  revenue: number;
  registrations_count: number;
}

export interface ParticipantRegistration {
  registration_id: string;
  session_id: string;
  participant_id: string;
  registered_at: Date;
  status: 'valid' | 'pending' | 'cancelled';
}

export interface ApprovalDocument {
  doc_id: string;
  asset_id: string;
  submitted_at: Date;
  due_date: Date;
  approved_at: Date | null;
  status: ApprovalStatus;
  approver_group: string;
  sla_hours: number;
}

export interface FilterState {
  dateRange: {
    start: Date;
    end: Date;
  };
  assetType: AssetType[];
  ownerId: string[];
  sessionStatus: SessionStatus[];
}
