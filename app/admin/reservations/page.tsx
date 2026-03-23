import { Clock } from 'lucide-react';

export default function ReservationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Clock size={22} className="text-[#7c6af7]" />
        <h1 className="text-xl font-semibold text-white">Reservations</h1>
      </div>
      <div className="rounded-xl bg-[#13151c] border border-white/5 p-8 text-center">
        <p className="text-sm text-[#9aa3be]">No reservations yet.</p>
      </div>
    </div>
  );
}
