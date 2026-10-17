import React from 'react';
import { Printer, X, Church, ShieldCheck } from 'lucide-react';
import { Prize, Winner, DrawSettings, Language } from '../types';
import { formatToIST } from '../utils/timezone';

interface NoticeBoardPrintProps {
  prizes: Prize[];
  winners: Winner[];
  drawSettings: DrawSettings;
  language: Language;
  onClose: () => void;
}

export const NoticeBoardPrint: React.FC<NoticeBoardPrintProps> = ({
  prizes,
  winners,
  drawSettings,
  language,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Combine prizes with winners sorted by rank
  const resultsTable = prizes
    .map((prize) => {
      const winner = winners.find((w) => w.prizeId === prize.id);
      return { prize, winner };
    })
    .sort((a, b) => a.prize.rank - b.prize.rank);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-8 flex justify-center items-start">
      {/* Container */}
      <div className="bg-white text-black w-full max-w-4xl rounded-2xl shadow-2xl p-6 sm:p-10 space-y-6 my-auto">
        
        {/* Print Controls Header (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2 text-christmas-emerald font-bold">
            <Printer className="w-5 h-5 text-christmas-gold" />
            <span>Official Parish Notice Board Print Sheet</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-christmas-emerald hover:bg-christmas-darkGreen text-white font-bold text-sm flex items-center gap-2 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Content */}
        <div className="print-card space-y-6">
          
          {/* Parish Letterhead */}
          <div className="text-center border-b-2 border-black pb-4 space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold text-gray-700">
              <span>Diocese of Irinjalakuda</span>
              <span>•</span>
              <span>Kerala Catholic Youth Movement</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-wide text-black uppercase">
              KCYM • ST. MARY'S FORANE CHURCH, NELLAYI
            </h1>
            <p className="text-xs text-gray-700">
              Nellayi P.O., Thrissur District, Kerala - 680305 | Tel: {drawSettings.contactPhone}
            </p>
            <div className="pt-2">
              <span className="inline-block bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-wider rounded">
                OFFICIAL CHRISTMAS PRIZE COUPON DRAW 2026 – WINNERS LIST
              </span>
            </div>
          </div>

          {/* Meta Details */}
          <div className="flex flex-wrap justify-between text-xs text-gray-800 border-b border-gray-300 pb-2">
            <div>
              <strong>Draw Date:</strong> December 25, 2026 (12:00 AM IST)
            </div>
            <div>
              <strong>Venue:</strong> {drawSettings.drawVenue}
            </div>
            <div>
              <strong>Publication:</strong> {formatToIST(drawSettings.publishedAt || new Date())}
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-400 text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400 font-bold">
                  <th className="p-2.5 border border-gray-400 text-center w-12">#</th>
                  <th className="p-2.5 border border-gray-400">Prize Rank & Description</th>
                  <th className="p-2.5 border border-gray-400 text-center w-36">Winning Coupon</th>
                  <th className="p-2.5 border border-gray-400">Winner's Name & Ward</th>
                </tr>
              </thead>
              <tbody>
                {resultsTable.map(({ prize, winner }, idx) => (
                  <tr key={prize.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2.5 border border-gray-400 text-center font-bold">
                      {prize.rank}
                    </td>
                    <td className="p-2.5 border border-gray-400">
                      <div className="font-bold">{prize.title}</div>
                      <div className="text-[11px] text-gray-600 font-normal">{prize.categoryLabel}</div>
                    </td>
                    <td className="p-2.5 border border-gray-400 text-center font-mono font-black text-base">
                      {winner?.winningCouponNumber || '—'}
                    </td>
                    <td className="p-2.5 border border-gray-400">
                      <div className="font-bold text-gray-900">{winner?.winnerName || 'To be claimed'}</div>
                      {winner?.winnerLocation && (
                        <div className="text-[11px] text-gray-600">{winner.winnerLocation}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Claim Instructions */}
          <div className="text-[11px] text-gray-700 space-y-1 border-t border-gray-300 pt-3">
            <p className="font-bold">Important Instructions for Prize Claimants:</p>
            <p>1. Original winning coupon counterfoil must be presented within 30 days of the draw at St. Mary's Church Parish Office, Nellayi.</p>
            <p>2. Valid government-issued photo identity proof is mandatory for verification.</p>
            <p>3. In any dispute, the decision of the Parish Vicar and KCYM Committee will be final and binding.</p>
          </div>

          {/* Official Signatures Row */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs">
            <div className="border-t border-black pt-2">
              <p className="font-bold">Parish Vicar</p>
              <p className="text-[10px] text-gray-600">St. Mary's Forane Church, Nellayi</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">KCYM President</p>
              <p className="text-[10px] text-gray-600">Unit President, KCYM Nellayi</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">Draw Convenor</p>
              <p className="text-[10px] text-gray-600">Christmas Coupon Committee</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
