import { Prize, Winner, DrawSettings, AuditLog, CouponSearchResult } from '../types';
import { INITIAL_DRAW_SETTINGS, INITIAL_PRIZES, SAMPLE_WINNERS } from '../constants/initialData';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  SETTINGS: 'kcym_draw_settings_v1',
  PRIZES: 'kcym_prizes_v1',
  SPONSOR_MIGRATION: 'kcym_bad_boy_sponsor_migration_v1',
  PRIZE_CATALOG_MIGRATION: 'kcym_prize_catalog_v2_migration_v1',
  WINNERS: 'kcym_winners_v1', // Only accessible when published or by admin
  AUDIT_LOGS: 'kcym_audit_logs_v1',
  ADMIN_SESSION: 'kcym_admin_session_v1',
};

// Event system for real-time reactivity across tabs and components
export const DATA_CHANGE_EVENT = 'kcym_data_updated';

export function notifyDataChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
  }
}

// -------------------------------------------------------------
// DRAW SETTINGS
// -------------------------------------------------------------
export function getDrawSettings(): DrawSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const settings: DrawSettings = JSON.parse(raw);
      const hasLegacyDrawDate =
        settings.drawDateIST === '2026-12-24T19:00:00+05:30' ||
        settings.drawDateIST === '2026-12-24T00:00:00+05:30';
      const legacyMalayalamVenues = [
        'സെന്റ് മേരീസ് ഫൊറോന പള്ളി പാരിഷ് ഹാൾ, നെല്ലായി, തൃശൂർ',
        'സെന്റ് മേരീസ് ഫൊറോന പള്ളി പാരിഷ് ഹാൾ, നെല്ലായി',
      ];
      const englishVenueWithoutKerala = settings.drawVenue.endsWith(', Kerala')
        ? settings.drawVenue.slice(0, -', Kerala'.length)
        : settings.drawVenue;
      const migratedSettings: DrawSettings = {
        ...settings,
        ...(hasLegacyDrawDate ? { drawDateIST: INITIAL_DRAW_SETTINGS.drawDateIST } : {}),
        ...(englishVenueWithoutKerala !== settings.drawVenue
          ? { drawVenue: englishVenueWithoutKerala }
          : {}),
        ...(legacyMalayalamVenues.includes(settings.drawVenue_ml)
          ? { drawVenue_ml: INITIAL_DRAW_SETTINGS.drawVenue_ml }
          : {}),
        ...(hasLegacyDrawDate && [
          'Grand Draw will be held on Christmas Eve, December 24, 2026 at 7:00 PM IST following the Holy Mass and Carol Service.',
          'Grand Draw will be held at 12:00 AM IST on December 24, 2026, following the Holy Mass and Carol Service.',
        ].includes(settings.announcementText)
          ? { announcementText: INITIAL_DRAW_SETTINGS.announcementText }
          : {}),
        ...(hasLegacyDrawDate && [
          '2026 ഡിസംബർ 24 ക്രിസ്മസ് രാവിൽ വൈകിട്ട് 7:00 മണിക്ക് വിശുദ്ധ കുർബാനയ്ക്കും കരോളിനും ശേഷം മഹാ നറുക്കെടുപ്പ് നടക്കും.',
          'വിശുദ്ധ കുർബാനയ്ക്കും കരോളിനും ശേഷം 2026 ഡിസംബർ 24-ന് അർദ്ധരാത്രി 12:00 മണിക്ക് മഹാ നറുക്കെടുപ്പ് നടക്കും.',
        ].includes(settings.announcementText_ml)
          ? { announcementText_ml: INITIAL_DRAW_SETTINGS.announcementText_ml }
          : {}),
      };

      if (
        hasLegacyDrawDate ||
        migratedSettings.drawVenue !== settings.drawVenue ||
        migratedSettings.drawVenue_ml !== settings.drawVenue_ml
      ) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(migratedSettings));
        return migratedSettings;
      }
      return settings;
    }
  } catch (e) {
    console.error('Error reading draw settings:', e);
  }
  return INITIAL_DRAW_SETTINGS;
}

export async function updateDrawSettings(settings: Partial<DrawSettings>, adminEmail: string): Promise<DrawSettings> {
  const current = getDrawSettings();
  const updated: DrawSettings = {
    ...current,
    ...settings,
  };

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

  addAuditLog(
    'SETTINGS_UPDATE',
    `Updated draw settings (Date: ${updated.drawDateIST}, Price: ${updated.couponPrice})`,
    adminEmail
  );

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('draw_settings').upsert({
        id: 1,
        draw_date_ist: updated.drawDateIST,
        timezone: updated.timezone,
        is_published: updated.isPublished,
        published_at: updated.publishedAt,
        published_by: updated.publishedBy,
        draw_venue: updated.drawVenue,
        draw_venue_ml: updated.drawVenue_ml,
        hero_headline: updated.heroHeadline,
        hero_headline_ml: updated.heroHeadline_ml,
        hero_subtitle: updated.heroSubtitle,
        hero_subtitle_ml: updated.heroSubtitle_ml,
        announcement_text: updated.announcementText,
        announcement_text_ml: updated.announcementText_ml,
        contact_phone: updated.contactPhone,
        contact_email: updated.contactEmail,
        church_address: updated.churchAddress,
        coupon_price: updated.couponPrice,
      });
    }
  }

  notifyDataChange();
  return updated;
}

// -------------------------------------------------------------
// PUBLICATION WORKFLOW (Explicit confirmation + Security)
// -------------------------------------------------------------
export async function publishResults(adminEmail: string): Promise<DrawSettings> {
  const current = getDrawSettings();
  const updated: DrawSettings = {
    ...current,
    isPublished: true,
    publishedAt: new Date().toISOString(),
    publishedBy: adminEmail,
  };

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

  addAuditLog(
    'PUBLISH_RESULTS',
    `Official prize coupon results published by ${adminEmail}`,
    adminEmail
  );

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('draw_settings').update({
        is_published: true,
        published_at: updated.publishedAt,
        published_by: adminEmail,
      }).eq('id', 1);
    }
  }

  notifyDataChange();
  return updated;
}

export async function unpublishResults(adminEmail: string, reason: string): Promise<DrawSettings> {
  const current = getDrawSettings();
  const updated: DrawSettings = {
    ...current,
    isPublished: false,
    publishedAt: null,
    publishedBy: null,
  };

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

  addAuditLog(
    'UNPUBLISH_RESULTS',
    `Official results unpublished by ${adminEmail}. Reason: ${reason || 'Correction needed'}`,
    adminEmail
  );

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('draw_settings').update({
        is_published: false,
        published_at: null,
        published_by: null,
      }).eq('id', 1);
    }
  }

  notifyDataChange();
  return updated;
}

// -------------------------------------------------------------
// PRIZES MANAGEMENT
// -------------------------------------------------------------
export function getPrizes(): Prize[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let prizes: Prize[] = parsed;
        if (!localStorage.getItem(STORAGE_KEYS.SPONSOR_MIGRATION)) {
          prizes = prizes.map((prize) => ({
            ...prize,
            sponsor: 'BAD BOY GROUP',
            sponsor_ml: 'ബാഡ് ബോയ് ഗ്രൂപ്പ്',
          }));
          localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
          localStorage.setItem(STORAGE_KEYS.SPONSOR_MIGRATION, 'complete');
        }

        if (!localStorage.getItem(STORAGE_KEYS.PRIZE_CATALOG_MIGRATION)) {
          const defaultPrizesById = new Map(INITIAL_PRIZES.map((prize) => [prize.id, prize]));
          const savedPrizesById = new Map(prizes.map((prize) => [prize.id, prize]));
          const correctedPrizes = INITIAL_PRIZES.map((defaultPrize) => {
            const savedPrize = savedPrizesById.get(defaultPrize.id);
            return {
              ...savedPrize,
              ...defaultPrize,
              sponsor: savedPrize?.sponsor ?? defaultPrize.sponsor,
              sponsor_ml: savedPrize?.sponsor_ml ?? defaultPrize.sponsor_ml,
            };
          });
          const additionalPrizes = prizes
            .filter((prize) => !defaultPrizesById.has(prize.id))
            .map((prize, index) => ({
              ...prize,
              rank: INITIAL_PRIZES.length + index + 1,
              orderIndex: INITIAL_PRIZES.length + index + 1,
            }));
          prizes = [...correctedPrizes, ...additionalPrizes];
          localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
          localStorage.setItem(STORAGE_KEYS.PRIZE_CATALOG_MIGRATION, 'complete');
        }

        return prizes.sort((a, b) => a.orderIndex - b.orderIndex);
      }
    }
  } catch (e) {
    console.error('Error reading prizes:', e);
  }
  return INITIAL_PRIZES;
}

export async function savePrize(prize: Prize, adminEmail: string): Promise<Prize[]> {
  const prizes = getPrizes();
  const index = prizes.findIndex((p) => p.id === prize.id);

  let updatedList: Prize[];
  let action: string;

  if (index >= 0) {
    updatedList = [...prizes];
    updatedList[index] = prize;
    action = `Updated prize #${prize.rank} (${prize.title})`;
  } else {
    updatedList = [...prizes, prize];
    action = `Added new prize #${prize.rank} (${prize.title})`;
  }

  updatedList.sort((a, b) => a.orderIndex - b.orderIndex);
  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(updatedList));

  addAuditLog('PRIZE_SAVE', action, adminEmail);
  notifyDataChange();
  return updatedList;
}

export async function deletePrize(prizeId: string, adminEmail: string): Promise<Prize[]> {
  const prizes = getPrizes();
  const target = prizes.find((p) => p.id === prizeId);
  const updatedList = prizes.filter((p) => p.id !== prizeId);

  // Also remove associated winners
  const winners = getWinners(true);
  const updatedWinners = winners.filter((w) => w.prizeId !== prizeId);
  localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(updatedWinners));

  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(updatedList));

  addAuditLog(
    'PRIZE_DELETE',
    `Deleted prize: ${target?.title || prizeId}`,
    adminEmail
  );

  notifyDataChange();
  return updatedList;
}

export async function reorderPrizes(reordered: Prize[], adminEmail: string): Promise<Prize[]> {
  const indexed = reordered.map((prize, idx) => ({
    ...prize,
    orderIndex: idx + 1,
  }));

  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(indexed));
  addAuditLog('PRIZE_REORDER', 'Reordered prizes list', adminEmail);
  notifyDataChange();
  return indexed;
}

// -------------------------------------------------------------
// WINNERS & COUPONS (Strict Security: Privacy Protected)
// -------------------------------------------------------------

/**
 * Returns winners.
 * CRITICAL SECURITY: If isAdmin is false and isPublished is false,
 * returns an empty array. No unpublished winner data is exposed!
 */
export function getWinners(isAdmin = false): Winner[] {
  const settings = getDrawSettings();

  // If public visitor and results not published, return empty
  if (!isAdmin && !settings.isPublished) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WINNERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading winners:', e);
  }

  // Fallback to sample winners for admin setup/testing
  return SAMPLE_WINNERS;
}

/**
 * Adds or updates a winner.
 * Enforces NO duplicate winning coupon numbers across different prizes.
 */
export async function saveWinner(winner: Winner, adminEmail: string): Promise<{ success: boolean; error?: string }> {
  const winners = getWinners(true);
  const normalizedCoupon = winner.winningCouponNumber.trim().toUpperCase();

  // Duplicate coupon check
  const duplicate = winners.find(
    (w) => w.winningCouponNumber.trim().toUpperCase() === normalizedCoupon && w.id !== winner.id
  );

  if (duplicate) {
    return {
      success: false,
      error: `Coupon number "${winner.winningCouponNumber}" is already assigned as a winner! Duplicate coupon numbers are not allowed.`,
    };
  }

  const existingIndex = winners.findIndex((w) => w.id === winner.id || w.prizeId === winner.prizeId);
  let updatedList: Winner[];

  if (existingIndex >= 0) {
    updatedList = [...winners];
    updatedList[existingIndex] = {
      ...winners[existingIndex],
      ...winner,
      winningCouponNumber: normalizedCoupon,
      verifiedAt: new Date().toISOString(),
    };
    addAuditLog(
      'WINNER_UPDATE',
      `Updated winner for prize ID ${winner.prizeId}: Coupon #${normalizedCoupon} (${winner.winnerName})`,
      adminEmail
    );
  } else {
    updatedList = [
      ...winners,
      {
        ...winner,
        winningCouponNumber: normalizedCoupon,
        createdAt: new Date().toISOString(),
      },
    ];
    addAuditLog(
      'WINNER_CREATE',
      `Added winner for prize ID ${winner.prizeId}: Coupon #${normalizedCoupon} (${winner.winnerName})`,
      adminEmail
    );
  }

  localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(updatedList));
  notifyDataChange();
  return { success: true };
}

export async function deleteWinner(winnerId: string, adminEmail: string): Promise<void> {
  const winners = getWinners(true);
  const target = winners.find((w) => w.id === winnerId);
  const updated = winners.filter((w) => w.id !== winnerId);

  localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(updated));
  addAuditLog(
    'WINNER_DELETE',
    `Removed winner entry: Coupon #${target?.winningCouponNumber || winnerId}`,
    adminEmail
  );
  notifyDataChange();
}

/**
 * Public search for a winning coupon number.
 * Only returns a match if the draw has been officially published!
 */
export function searchCoupon(query: string, isAdmin = false): CouponSearchResult {
  const cleanQuery = query.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleanQuery) {
    return { searchedNumber: query, isWinner: false };
  }

  const settings = getDrawSettings();
  if (!settings.isPublished && !isAdmin) {
    // Before publication, public cannot search or discover winners
    return { searchedNumber: query, isWinner: false };
  }

  const winners = getWinners(isAdmin);
  const prizes = getPrizes();

  const matchedWinner = winners.find(
    (w) => w.winningCouponNumber.trim().toUpperCase().replace(/\s+/g, '') === cleanQuery
  );

  if (matchedWinner) {
    const matchedPrize = prizes.find((p) => p.id === matchedWinner.prizeId);
    return {
      searchedNumber: query,
      isWinner: true,
      winner: matchedWinner,
      prize: matchedPrize,
    };
  }

  return {
    searchedNumber: query,
    isWinner: false,
  };
}

// -------------------------------------------------------------
// AUDIT LOGS
// -------------------------------------------------------------
export function getAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading audit logs:', e);
  }
  return [
    {
      id: 'initial-setup',
      timestamp: '2026-10-16T17:00:00+05:30',
      action: 'SYSTEM_INITIALIZATION',
      details: "KCYM St. Mary's Church Nellayi Christmas Draw System initialized",
      adminEmail: 'system',
    },
  ];
}

export function addAuditLog(action: string, details: string, adminEmail: string) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    adminEmail,
  };

  const updated = [newLog, ...logs].slice(0, 100); // Keep latest 100
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
}

// -------------------------------------------------------------
// BACKUP & RESTORE UTILITIES
// -------------------------------------------------------------
export function exportDataJSON(): string {
  const backup = {
    settings: getDrawSettings(),
    prizes: getPrizes(),
    winners: getWinners(true),
    auditLogs: getAuditLogs(),
    exportedAt: new Date().toISOString(),
    parish: "St. Mary's Church, Nellayi",
  };
  return JSON.stringify(backup, null, 2);
}

export function importDataJSON(jsonString: string, adminEmail: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.settings || !data.prizes) {
      return { success: false, message: 'Invalid backup structure. Missing settings or prizes.' };
    }

    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.prizes) localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(data.prizes));
    if (data.winners) localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(data.winners));
    
    addAuditLog('DATA_RESTORE', 'Restored data from external JSON backup', adminEmail);
    notifyDataChange();
    return { success: true, message: 'Data successfully restored from backup.' };
  } catch (e: any) {
    return { success: false, message: `Failed to parse backup JSON: ${e.message}` };
  }
}

export function resetToDefaults(adminEmail: string) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_DRAW_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(INITIAL_PRIZES));
  localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(SAMPLE_WINNERS));
  addAuditLog('SYSTEM_RESET', 'Reset all prizes, settings, and test winners to church defaults', adminEmail);
  notifyDataChange();
}
