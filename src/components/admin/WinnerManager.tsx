import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, Edit2, Trash2, Save, X, Sparkles } from 'lucide-react';
import { Prize, Winner, AdminUser } from '../../types';
import { saveWinner, deleteWinner } from '../../services/storage';

interface WinnerManagerProps {
  prizes: Prize[];
  winners: Winner[];
  adminUser: AdminUser;
  onRefresh: () => void;
}

export const WinnerManager: React.FC<WinnerManagerProps> = ({
  prizes,
  winners,
  adminUser,
  onRefresh,
}) => {
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);
  const [couponNumber, setCouponNumber] = useState('');
  const [winnerName, setWinnerName] = useState('');
  const [winnerLocation, setWinnerLocation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleStartEdit = (prize: Prize, existingWinner?: Winner) => {
    setEditingPrizeId(prize.id);
    setCouponNumber(existingWinner?.winningCouponNumber || '');
    setWinnerName(existingWinner?.winnerName || '');
    setWinnerLocation(existingWinner?.winnerLocation || '');
    setErrorMessage('');
  };

  const handleSave = async (prizeId: string) => {
    setErrorMessage('');

    if (!couponNumber.trim()) {
      setErrorMessage('Winning coupon number is required.');
      return;
    }

    if (!winnerName.trim()) {
      setErrorMessage("Winner's name is required.");
      return;
    }

    const existingWinner = winners.find((w) => w.prizeId === prizeId);
    const winnerData: Winner = {
      id: existingWinner?.id || `win-${Date.now()}`,
      prizeId,
      winningCouponNumber: couponNumber.trim(),
      winnerName: winnerName.trim(),
      winnerLocation: winnerLocation.trim() || undefined,
      createdAt: existingWinner?.createdAt || new Date().toISOString(),
    };

    const res = await saveWinner(winnerData, adminUser.email);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to save winner.');
      return;
    }

    setEditingPrizeId(null);
    onRefresh();
  };

  const handleDelete = async (winnerId: string) => {
    if (confirm('Are you sure you want to remove this winner assignment?')) {
      await deleteWinner(winnerId, adminUser.email);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-bold text-christmas-emerald">
            Winner Assignments & Coupon Entry
          </h3>
          <p className="text-xs text-gray-500">
            Associate each drawn prize with its winning coupon number and holder's name.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Assigned: {winners.length} / {prizes.length} Prizes
          </span>
        </div>
      </div>

      {/* Duplicate warning notification if any */}
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-red-900 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Prize / Winner List */}
      <div className="grid grid-cols-1 gap-4">
        {prizes.map((prize) => {
          const winner = winners.find((w) => w.prizeId === prize.id);
          const isEditing = editingPrizeId === prize.id;

          return (
            <div
              key={prize.id}
              className={`rounded-2xl border p-5 transition-all ${
                isEditing
                  ? 'bg-amber-50/70 border-christmas-gold shadow-md'
                  : winner
                  ? 'bg-white border-emerald-200'
                  : 'bg-white border-gray-200 opacity-90'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Prize summary */}
                <div className="flex items-center gap-4">
                  <img
                    src={prize.imageUrl}
                    alt={prize.title}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-christmas-gold text-christmas-darkGreen font-bold text-[11px]">
                        Rank #{prize.rank} • {prize.categoryLabel}
                      </span>
                      {winner ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Winner Assigned</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                          Awaiting Entry
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-base text-christmas-emerald mt-0.5">
                      {prize.title}
                    </h4>
                  </div>
                </div>

                {/* Winner details OR edit form */}
                {!isEditing ? (
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                    {winner ? (
                      <div className="text-left md:text-right">
                        <div className="flex items-center gap-1.5 md:justify-end">
                          <span className="text-[10px] text-gray-500 uppercase font-bold">Coupon:</span>
                          <span className="font-mono font-black text-xl text-christmas-red">
                            {winner.winningCouponNumber}
                          </span>
                        </div>
                        <p className="font-bold text-gray-800 text-sm">{winner.winnerName}</p>
                        {winner.winnerLocation && (
                          <p className="text-xs text-gray-500">{winner.winnerLocation}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No winning coupon entered</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(prize, winner)}
                        className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-christmas-gold/20 text-gray-700 hover:text-christmas-darkGreen text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{winner ? 'Edit' : 'Assign Winner'}</span>
                      </button>
                      {winner && (
                        <button
                          onClick={() => handleDelete(winner.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* INLINE EDIT FORM */
                  <div className="w-full md:w-auto flex-1 max-w-xl space-y-3 bg-white p-4 rounded-xl border border-christmas-gold/40">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Winning Coupon # *
                        </label>
                        <input
                          type="text"
                          required
                          value={couponNumber}
                          onChange={(e) => setCouponNumber(e.target.value)}
                          placeholder="e.g. 7842"
                          className="w-full p-2 text-xs font-mono font-bold rounded-lg border border-gray-300 uppercase"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Winner's Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={winnerName}
                          onChange={(e) => setWinnerName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full p-2 text-xs rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Parish Ward / Place
                        </label>
                        <input
                          type="text"
                          value={winnerLocation}
                          onChange={(e) => setWinnerLocation(e.target.value)}
                          placeholder="e.g. Nellayi West"
                          className="w-full p-2 text-xs rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingPrizeId(null)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(prize.id)}
                        className="px-4 py-1.5 rounded-lg bg-christmas-emerald hover:bg-christmas-darkGreen text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Assignment</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
