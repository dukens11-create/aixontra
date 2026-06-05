import {
  getFlaggedContent,
  getModerationAuditTrail,
  getModerationQueue,
  getUserReports,
  getWarnings,
} from '@/lib/moderation/moderationService';

export default function AdminPage() {
  const moderationQueue = getModerationQueue().slice(0, 5);
  const reports = getUserReports().slice(0, 5);
  const flaggedContent = getFlaggedContent().slice(0, 5);
  const warnings = getWarnings().slice(0, 5);
  const auditTrail = getModerationAuditTrail().slice(0, 5);

  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Admin Ops Dashboard</h1><p className="muted">Moderation and platform operations controls.</p></section>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="card bg-black/30"><h2>Users</h2><p className="muted mt-2">Manage users, bans, and account reviews.</p></div>
        <div className="card bg-black/30"><h2>Creators</h2><p className="muted mt-2">Creator approvals and verification queue.</p></div>
        <div className="card bg-black/30"><h2>Songs</h2><p className="muted mt-2">Moderation actions: approve/reject/take down.</p></div>
        <div className="card bg-black/30"><h2>Reports</h2><p className="muted mt-2">Copyright, impersonation, and unsafe-content reports.</p></div>
        <div className="card bg-black/30"><h2>DMCA claims</h2><p className="muted mt-2">DMCA intake and takedown workflows.</p></div>
        <div className="card bg-black/30"><h2>Voice models</h2><p className="muted mt-2">Consent/proof validation and approval queue.</p></div>
        <div className="card bg-black/30"><h2>Verification requests</h2><p className="muted mt-2">Review artist verification submissions.</p></div>
        <div className="card bg-black/30"><h2>Marketplace items</h2><p className="muted mt-2">Manage listings and licensing products.</p></div>
        <div className="card bg-black/30"><h2>Transactions & payouts</h2><p className="muted mt-2">Credit ledger, purchases, and payout placeholders.</p></div>
      </section>
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="card bg-black/30">
          <h2>Moderation queue</h2>
          {moderationQueue.length === 0 ? (
            <p className="muted mt-2">No pending moderation flags.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {moderationQueue.map((item) => (
                <li key={item.id} className="muted">{item.type} · {item.severity} · {item.reason}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="card bg-black/30">
          <h2>User reports</h2>
          {reports.length === 0 ? (
            <p className="muted mt-2">No open user reports.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {reports.map((report) => (
                <li key={report.id} className="muted">{report.category} · {report.targetType}:{report.targetId}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="card bg-black/30">
          <h2>Flagged content review</h2>
          {flaggedContent.length === 0 ? (
            <p className="muted mt-2">No flagged content yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {flaggedContent.map((flag) => (
                <li key={flag.id} className="muted">{flag.status} · {flag.type} · {flag.targetId ?? 'n/a'}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="card bg-black/30">
          <h2>Automated warning system</h2>
          {warnings.length === 0 ? (
            <p className="muted mt-2">No automated warnings issued.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {warnings.map((warning) => (
                <li key={warning.id} className="muted">User {warning.userId} · {warning.action} · strike {warning.strikeCount}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className="card bg-black/30">
        <h2>Moderation audit trail</h2>
        {auditTrail.length === 0 ? (
          <p className="muted mt-2">No moderation actions logged.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {auditTrail.map((log) => (
              <li key={log.id} className="muted">{log.action} · actor {log.actorId} · {new Date(log.createdAt).toLocaleString()}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
