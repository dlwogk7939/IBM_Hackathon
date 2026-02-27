type ShareIdModalProps = {
  studentId: string;
  onClose: () => void;
};

export function ShareIdModal({ studentId, onClose }: ShareIdModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">Share My ID</h3>
        <p className="mt-2 text-sm text-slate-600">
          This demo only displays your anonymized code. No data is sent anywhere.
        </p>
        <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-4 text-center">
          <p className="text-sm text-slate-600">Student ID</p>
          <p className="text-2xl font-bold text-brand-700">{studentId}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
