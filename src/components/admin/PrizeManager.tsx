import React, { useState } from 'react';
import { Gift, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Image, Save, X, AlertCircle } from 'lucide-react';
import { Prize, AdminUser } from '../../types';
import { savePrize, deletePrize, reorderPrizes } from '../../services/storage';

interface PrizeManagerProps {
  prizes: Prize[];
  adminUser: AdminUser;
  onRefresh: () => void;
}

export const PrizeManager: React.FC<PrizeManagerProps> = ({ prizes, adminUser, onRefresh }) => {
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateNew = () => {
    const nextRank = prizes.length + 1;
    const newPrize: Prize = {
      id: `prize-${Date.now()}`,
      rank: nextRank,
      title: '',
      title_ml: '',
      category: 'major',
      categoryLabel: `${nextRank}th Prize`,
      categoryLabel_ml: `${nextRank}-ാം സമ്മാനം`,
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      description: '',
      description_ml: '',
      sponsor: '',
      sponsor_ml: '',
      orderIndex: nextRank,
      badge: `${nextRank}th Prize`,
      badge_ml: `${nextRank}-ാം സമ്മാനം`,
    };
    setEditingPrize(newPrize);
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrize) return;

    if (!editingPrize.title.trim()) {
      alert('Prize title is required.');
      return;
    }

    setErrorMessage('');
    try {
      await savePrize(editingPrize, adminUser.email);
      setEditingPrize(null);
      setIsNew(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to save prize:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save prize.');
    }
  };

  const handleDelete = async (prizeId: string) => {
    setErrorMessage('');
    try {
      await deletePrize(prizeId, adminUser.email);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete prize:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete prize.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newPrizes = [...prizes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPrizes.length) return;

    const temp = newPrizes[index];
    newPrizes[index] = newPrizes[targetIndex];
    newPrizes[targetIndex] = temp;

    setErrorMessage('');
    try {
      await reorderPrizes(newPrizes, adminUser.email);
      onRefresh();
    } catch (error) {
      console.error('Failed to reorder prizes:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reorder prizes.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingPrize) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditingPrize({ ...editingPrize, imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {errorMessage}
        </div>
      )}
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="font-serif text-xl font-bold text-christmas-emerald">
            Prize Catalog Management
          </h3>
          <p className="text-xs text-gray-500">
            Add, update, or reorder gifts displayed in the public gallery.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-xl bg-christmas-emerald hover:bg-christmas-darkGreen text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Prize</span>
        </button>
      </div>

      {/* Prizes Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3 text-center w-16">Order</th>
                <th className="p-3 w-16">Photo</th>
                <th className="p-3">Rank & Category</th>
                <th className="p-3">Prize Title (English / Malayalam)</th>
                <th className="p-3">Sponsor</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prizes.map((prize, idx) => (
                <tr key={prize.id} className="hover:bg-amber-50/30 transition-colors">
                  {/* Order Controls */}
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-20"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-gray-700">{prize.orderIndex || idx + 1}</span>
                      <button
                        disabled={idx === prizes.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-20"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Photo */}
                  <td className="p-3">
                    <img
                      src={prize.imageUrl}
                      alt={prize.title}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm"
                    />
                  </td>

                  {/* Rank & Category */}
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-christmas-gold/20 text-christmas-darkGreen font-bold text-xs">
                      #{prize.rank} {prize.categoryLabel}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="p-3 space-y-0.5">
                    <p className="font-bold text-gray-900">{prize.title}</p>
                    {prize.title_ml && (
                      <p className="text-xs text-gray-500">{prize.title_ml}</p>
                    )}
                  </td>

                  {/* Sponsor */}
                  <td className="p-3 text-gray-600 text-xs">
                    {prize.sponsor || <span className="italic text-gray-400">Parish general</span>}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPrize(prize);
                          setIsNew(false);
                        }}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-christmas-gold/20 text-gray-700 hover:text-christmas-darkGreen transition-colors"
                        title="Edit prize"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(prize.id)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
                        title="Delete prize"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingPrize && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border-2 border-christmas-gold">
            
            <div className="bg-christmas-darkGreen text-christmas-ivory p-5 flex items-center justify-between border-b border-christmas-gold/30">
              <h4 className="font-serif font-bold text-lg text-christmas-lightGold flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <span>{isNew ? 'Add New Christmas Prize' : `Edit Prize #${editingPrize.rank}`}</span>
              </h4>
              <button
                onClick={() => setEditingPrize(null)}
                className="p-1 rounded-full text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prize Rank (#)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingPrize.rank}
                    onChange={(e) => setEditingPrize({ ...editingPrize, rank: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category Type</label>
                  <select
                    value={editingPrize.category}
                    onChange={(e: any) => setEditingPrize({ ...editingPrize, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  >
                    <option value="bumper">Mega Bumper Prize</option>
                    <option value="major">Major Prize</option>
                    <option value="appliance">Home Appliance</option>
                    <option value="consolation">Consolation Prize</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Label (e.g. 1st Prize / ഒന്നാം സമ്മാനം)</label>
                <input
                  type="text"
                  required
                  value={editingPrize.categoryLabel}
                  onChange={(e) => setEditingPrize({ ...editingPrize, categoryLabel: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Prize Title (English)</label>
                <input
                  type="text"
                  required
                  value={editingPrize.title}
                  onChange={(e) => setEditingPrize({ ...editingPrize, title: e.target.value })}
                  placeholder="Hero Electric Scooter"
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Prize Title (Malayalam)</label>
                <input
                  type="text"
                  value={editingPrize.title_ml || ''}
                  onChange={(e) => setEditingPrize({ ...editingPrize, title_ml: e.target.value })}
                  placeholder="ഹീറോ ഇലക്ട്രിക് സ്കൂട്ടർ"
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPrize.description}
                  onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              {/* Photo Upload / Image URL */}
              <div className="space-y-2 border-t pt-3">
                <label className="block font-bold text-gray-700">Prize Photograph</label>
                <div className="flex items-center gap-4">
                  <img
                    src={editingPrize.imageUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover border border-gray-300 shadow-sm"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      placeholder="Paste image URL..."
                      value={editingPrize.imageUrl}
                      onChange={(e) => setEditingPrize({ ...editingPrize, imageUrl: e.target.value })}
                      className="w-full p-2 rounded-xl border border-gray-300 text-xs font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 border">
                        <Image className="w-3.5 h-3.5" />
                        <span>Upload Local Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-gray-500">Max 5MB JPG/PNG/WebP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sponsor */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Sponsored / Donated by</label>
                <input
                  type="text"
                  value={editingPrize.sponsor || ''}
                  onChange={(e) => setEditingPrize({ ...editingPrize, sponsor: e.target.value })}
                  placeholder="e.g. Well-wisher, Nellayi Parish"
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPrize(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-christmas-emerald hover:bg-christmas-darkGreen text-white font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Prize</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h4 className="font-bold text-lg text-gray-900">Confirm Prize Deletion</h4>
            <p className="text-xs text-gray-600">
              Are you sure you want to delete this prize? Any assigned winner to this prize will also be unassigned.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
