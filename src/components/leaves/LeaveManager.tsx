import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Mail, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  User, 
  Info, 
  ExternalLink,
  Sparkles,
  Shield,
  Layers
} from 'lucide-react';
import { LeaveRequest, LeaveType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

export const LeaveManager: React.FC = () => {
  const { currentUser, isAdmin, canReviewLeaves, usersList } = useAuth();
  
  const [leaves, setLeaves] = useState<LeaveRequest[]>(storage.getLeaveRequests());
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(storage.getLeaveTypes());
  
  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeaveForEmail, setSelectedLeaveForEmail] = useState<LeaveRequest | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  // Apply Form
  const [applyForm, setApplyForm] = useState({
    leaveTypeId: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    reason: '',
    additionalEmail: '',
  });

  // Review Modal state
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  React.useEffect(() => {
    const unsub = storage.subscribe(() => {
      setLeaves(storage.getLeaveRequests());
      setLeaveTypes(storage.getLeaveTypes());
    });
    return () => unsub();
  }, []);

  // Filter leaves: Regular employee sees ONLY their own leaves; Admin sees all
  const visibleLeaves = useMemo(() => {
    return leaves.filter(l => {
      if (!isAdmin && currentUser) {
        return l.userId === currentUser.id;
      }
      return true;
    });
  }, [leaves, isAdmin, currentUser]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!applyForm.leaveTypeId || !applyForm.startDate || !applyForm.endDate || !applyForm.reason.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const additionalEmails = applyForm.additionalEmail
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    const result = storage.createLeaveRequest({
      userId: currentUser.id,
      leaveTypeId: applyForm.leaveTypeId,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      reason: applyForm.reason.trim(),
      shareEmailAddresses: additionalEmails,
    });

    if (result.success && result.leaveRequest) {
      setShowApplyModal(false);
      setSelectedLeaveForEmail(result.leaveRequest);
      setApplyForm({
        leaveTypeId: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        reason: '',
        additionalEmail: '',
      });
    }
  };

  const handleReviewAction = (status: 'approved' | 'rejected') => {
    if (!reviewingLeave) return;
    storage.updateLeaveStatus(reviewingLeave.id, status, reviewRemarks);
    setReviewingLeave(null);
    setReviewRemarks('');
  };

  const generateEmailContent = (leave: LeaveRequest) => {
    const subject = `[Leave Request ${leave.requestNumber}] ${leave.userName} - ${leave.leaveTypeName} (${leave.totalDays} Day${leave.totalDays > 1 ? 's' : ''})`;
    const body = `Dear Team / HR Management,

This is a formal leave notification submitted by ${leave.userName}:

---------------------------------------------------------
LEAVE REQUEST DETAILS
---------------------------------------------------------
- Request ID: ${leave.requestNumber}
- Employee Name: ${leave.userName} (User ID: ${leave.userId})
- Department: ${leave.department}
- Leave Category: ${leave.leaveTypeName}
- Duration: ${leave.startDate} to ${leave.endDate} (${leave.totalDays} Day${leave.totalDays > 1 ? 's' : ''})
- Reason: ${leave.reason}
- Status: ${leave.status.toUpperCase()}
- Submitted At: ${new Date(leave.appliedAt).toLocaleString()}
---------------------------------------------------------

Notification shared to registered email IDs:
${leave.emailSentTo ? leave.emailSentTo.join('\n') : leave.userEmail}

Regards,
${leave.userName}
${leave.userEmail}`;

    return { subject, body };
  };

  const handleCopyEmail = (leave: LeaveRequest) => {
    const { subject, body } = generateEmailContent(leave);
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleOpenMailto = (leave: LeaveRequest) => {
    const { subject, body } = generateEmailContent(leave);
    const to = leave.emailSentTo && leave.emailSentTo.length > 0 ? leave.emailSentTo.join(',') : leave.userEmail;
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-green-600" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
            <XCircle className="w-2.5 h-2.5 text-red-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* High Density Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Leave Management & Email Share
            </h1>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Email Dispatch Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'Review employee leave requests and share notification records directly to email addresses.'
              : `Submit time-off applications and automatically dispatch notifications to email addresses.`}
          </p>
        </div>

        <button
          id="btn-apply-leave"
          onClick={() => {
            setApplyForm({
              leaveTypeId: leaveTypes[0]?.id || '',
              startDate: new Date().toISOString().slice(0, 10),
              endDate: new Date().toISOString().slice(0, 10),
              reason: '',
              additionalEmail: '',
            });
            setShowApplyModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ APPLY FOR LEAVE</span>
        </button>
      </div>

      {/* Leave Balance Quotas Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {leaveTypes.map((lt) => (
          <div key={lt.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lt.color || '#3b82f6' }} />
              <span className="font-mono text-[10px] font-bold text-slate-700">{lt.code}</span>
            </div>
            <p className="font-bold text-slate-900 text-xs mt-1 truncate">{lt.name}</p>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
              <span>Allowance:</span>
              <span className="font-bold text-slate-800">{lt.quotaDays} days</span>
            </div>
          </div>
        ))}
      </div>

      {/* Requests Ledger Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Leave Applications & Email Broadcasts</h3>
            <p className="text-[10px] text-slate-400">
              {isAdmin ? 'All employee submissions' : `Submissions by ${currentUser?.name} (${currentUser?.id})`}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {visibleLeaves.length} {visibleLeaves.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {visibleLeaves.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold text-slate-600">No leave requests found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "Apply for Leave" to create a new leave application.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleLeaves.map((leave) => (
              <div key={leave.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-2.5 text-xs">
                
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {leave.requestNumber}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {leave.leaveTypeName}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      • {leave.totalDays} Day{leave.totalDays > 1 ? 's' : ''} ({leave.startDate} to {leave.endDate})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(leave.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Employee</span>
                    <p className="font-bold text-slate-900">{leave.userName} <span className="font-mono text-slate-500 font-normal text-[10px]">({leave.userId})</span></p>
                    <p className="text-slate-500 text-[10px]">{leave.department}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Reason for Leave</span>
                    <p className="text-slate-800 text-xs">{leave.reason}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Email Dispatch</span>
                    <p className="text-slate-700 font-mono text-[10px] truncate">
                      {leave.emailSentTo ? leave.emailSentTo.join(', ') : leave.userEmail}
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Submitted: {new Date(leave.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {leave.reviewerRemarks && (
                  <div className="text-xs bg-slate-100 p-2 rounded border border-slate-200 text-slate-700">
                    <span className="font-bold text-slate-900">Admin/Manager Remarks:</span> {leave.reviewerRemarks}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1.5 text-xs">
                    <button
                      onClick={() => setSelectedLeaveForEmail(leave)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 text-[10px] font-bold shadow-2xs transition-colors"
                    >
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>View Email Template</span>
                    </button>
                    <button
                      onClick={() => handleOpenMailto(leave)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 text-[10px] font-bold shadow-2xs transition-colors"
                    >
                      <Send className="w-3 h-3 text-blue-600" />
                      <span>Open Mail Client</span>
                    </button>
                  </div>

                  {canReviewLeaves && leave.status === 'pending' && (
                    <button
                      onClick={() => {
                        setReviewingLeave(leave);
                        setReviewRemarks('');
                      }}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold shadow-2xs transition-colors"
                    >
                      Review & Decide
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL: APPLY LEAVE --- */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Submit Leave Application</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Leave Category *
                </label>
                <select
                  required
                  value={applyForm.leaveTypeId}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white outline-none"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.code} - {lt.quotaDays} days/yr - {lt.isPaid ? 'Paid' : 'Unpaid'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Time Off *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain the purpose of your leave request..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                  Email Dispatch / Notification Recipients
                </label>
                <input
                  type="text"
                  placeholder="manager@company.com, hr@company.com"
                  value={applyForm.additionalEmail}
                  onChange={(e) => setApplyForm({ ...applyForm, additionalEmail: e.target.value })}
                  className="w-full px-3 py-1.5 border border-blue-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="text-[10px] text-blue-700 mt-1 block">
                  Leave notification is shared to each user email ID automatically upon submission.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs"
                >
                  Submit & Share Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EMAIL SHARE & PREVIEW --- */}
      {selectedLeaveForEmail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Email Notification Share</h3>
              </div>
              <button
                onClick={() => setSelectedLeaveForEmail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[11px] space-y-2 select-all overflow-x-auto">
                <p className="text-blue-400 font-bold border-b border-slate-800 pb-1">
                  Subject: {generateEmailContent(selectedLeaveForEmail).subject}
                </p>
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300">
                  {generateEmailContent(selectedLeaveForEmail).body}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleCopyEmail(selectedLeaveForEmail)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold transition-colors"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Template'}</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenMailto(selectedLeaveForEmail)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send in Email App</span>
                  </button>
                  <button
                    onClick={() => setSelectedLeaveForEmail(null)}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: REVIEW LEAVE --- */}
      {reviewingLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">Review Leave Application</h3>
            <p className="text-xs text-slate-500 mt-1">
              Applicant: <strong>{reviewingLeave.userName}</strong> ({reviewingLeave.userId})
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p><strong>Category:</strong> {reviewingLeave.leaveTypeName}</p>
                <p><strong>Dates:</strong> {reviewingLeave.startDate} to {reviewingLeave.endDate} ({reviewingLeave.totalDays} Days)</p>
                <p><strong>Reason:</strong> {reviewingLeave.reason}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reviewer Remarks / Feedback
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional approval or rejection remarks..."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingLeave(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('rejected')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('approved')}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold shadow-xs"
                >
                  Approve Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
