import { Briefcase } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Briefcase size={22} className="text-[#7c6af7]" />
        <h1 className="text-xl font-semibold text-white">Transactions</h1>
      </div>
      <div className="rounded-xl bg-[#13151c] border border-white/5 p-8 text-center">
        <p className="text-sm text-[#9aa3be]">No transactions yet.</p>
      </div>
    </div>
  );
}
