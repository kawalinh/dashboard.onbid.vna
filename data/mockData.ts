
import { 
  Asset, AuctionSession, ApprovalDocument, 
  AssetType, SessionStatus, SessionResult, ApprovalStatus 
} from '../types';
import { subMonths, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';

const OWNERS = [
  { id: 'O1', name: 'Sở Tài Nguyên & Môi Trường' },
  { id: 'O2', name: 'Ngân hàng Vietinbank' },
  { id: 'O3', name: 'Tập đoàn EVN' },
  { id: 'O4', name: 'Bộ Công An' },
  { id: 'O5', name: 'Viettel Telecom' }
];

const ASSET_TYPES = [AssetType.BDS, AssetType.SIM, AssetType.PLATE, AssetType.OTHER];
const GROUPS = ['Nhóm Nghiệp vụ 1', 'Ban Giám đốc', 'QA Vận hành'];

export const generateMockData = () => {
  const assets: Asset[] = [];
  const sessions: AuctionSession[] = [];
  const docs: ApprovalDocument[] = [];

  // Generate 24 months of data
  for (let i = 0; i < 500; i++) {
    const owner = OWNERS[Math.floor(Math.random() * OWNERS.length)];
    const type = ASSET_TYPES[Math.floor(Math.random() * ASSET_TYPES.length)];
    const dateCreated = subDays(new Date(), Math.floor(Math.random() * 730));
    
    const asset: Asset = {
      asset_id: `ASSET-${i}`,
      asset_name: `Tài sản đấu giá mẫu ${i}`,
      asset_type: type,
      owner_id: owner.id,
      owner_name: owner.name,
      start_price: Math.floor(Math.random() * 1000000000) + 10000000,
      reserve_price: Math.floor(Math.random() * 900000000) + 5000000,
      created_at: dateCreated
    };
    assets.push(asset);

    // Create a session for most assets
    if (Math.random() > 0.1) {
      const isPast = dateCreated < subDays(new Date(), 30);
      let status = SessionStatus.ENDED;
      if (!isPast) {
        status = Math.random() > 0.3 ? SessionStatus.ONGOING : SessionStatus.CANCELED;
      }
      
      const result = status === SessionStatus.ENDED 
        ? (Math.random() > 0.4 ? SessionResult.SUCCESS : SessionResult.FAIL)
        : SessionResult.NA;

      const winningPrice = result === SessionResult.SUCCESS ? asset.start_price * (1 + Math.random() * 0.5) : 0;

      sessions.push({
        session_id: `SESS-${i}`,
        asset_id: asset.asset_id,
        session_title: `Phiên đấu giá ${asset.asset_name}`,
        session_status: status,
        session_result: result,
        start_time: dateCreated,
        end_time: addDays(dateCreated, 7),
        winning_price: winningPrice,
        revenue: result === SessionResult.SUCCESS ? winningPrice * 0.05 : 0, // 5% fee
        registrations_count: Math.floor(Math.random() * 50) + 1
      });
    }

    // Create approval documents
    const submittedDate = subDays(new Date(), Math.floor(Math.random() * 60));
    const isApproved = Math.random() > 0.2;
    docs.push({
      doc_id: `DOC-${i}`,
      asset_id: asset.asset_id,
      submitted_at: submittedDate,
      due_date: addDays(submittedDate, 3),
      approved_at: isApproved ? addDays(submittedDate, Math.random() * 5) : null,
      status: isApproved ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
      approver_group: GROUPS[Math.floor(Math.random() * GROUPS.length)],
      sla_hours: 72
    });
  }

  return { assets, sessions, docs, owners: OWNERS };
};
