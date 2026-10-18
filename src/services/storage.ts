import { Prize, Winner, DrawSettings, AuditLog, CouponSearchResult } from '../types';
import { INITIAL_DRAW_SETTINGS, INITIAL_PRIZES, SAMPLE_WINNERS } from '../constants/initialData';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  SETTINGS: 'kcym_draw_settings_v1',
  PRIZES: 'kcym_prizes_v1',
  SPONSOR_MIGRATION: 'kcym_bad_boy_sponsor_migration_v1',
  PRIZE_CATALOG_MIGRATION: 'kcym_prize_catalog_v2_migration_v1',
  HOME_THEATER_IMAGE_MIGRATION: 'kcym_home_theater_image_migration_v1',
  BEEF_IMAGE_MIGRATION: 'kcym_beef_image_migration_v1',
  AIR_FRYER_IMAGE_MIGRATION: 'kcym_air_fryer_image_migration_v1',
  EGG_IMAGE_MIGRATION: 'kcym_egg_image_migration_v1',
  DUCK_IMAGE_MIGRATION: 'kcym_duck_image_migration_v1',
  PRESSURE_WASHER_IMAGE_MIGRATION: 'kcym_pressure_washer_image_migration_v1',
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

export function mapDrawSettingsRow(data: Record<string, unknown>): DrawSettings {
  return {
    ...INITIAL_DRAW_SETTINGS,
    drawDateIST: typeof data.draw_date_ist === 'string' ? data.draw_date_ist : INITIAL_DRAW_SETTINGS.drawDateIST,
    timezone: typeof data.timezone === 'string' ? data.timezone : INITIAL_DRAW_SETTINGS.timezone,
    isPublished: typeof data.is_published === 'boolean' ? data.is_published : INITIAL_DRAW_SETTINGS.isPublished,
    publishedAt: typeof data.published_at === 'string' ? data.published_at : null,
    publishedBy: typeof data.published_by === 'string' ? data.published_by : null,
    drawVenue: typeof data.draw_venue === 'string' ? data.draw_venue : INITIAL_DRAW_SETTINGS.drawVenue,
    drawVenue_ml: typeof data.draw_venue_ml === 'string' ? data.draw_venue_ml : INITIAL_DRAW_SETTINGS.drawVenue_ml,
    heroHeadline: typeof data.hero_headline === 'string' ? data.hero_headline : INITIAL_DRAW_SETTINGS.heroHeadline,
    heroHeadline_ml: typeof data.hero_headline_ml === 'string' ? data.hero_headline_ml : INITIAL_DRAW_SETTINGS.heroHeadline_ml,
    heroSubtitle: typeof data.hero_subtitle === 'string' ? data.hero_subtitle : INITIAL_DRAW_SETTINGS.heroSubtitle,
    heroSubtitle_ml: typeof data.hero_subtitle_ml === 'string' ? data.hero_subtitle_ml : INITIAL_DRAW_SETTINGS.heroSubtitle_ml,
    announcementText: typeof data.announcement_text === 'string' ? data.announcement_text : INITIAL_DRAW_SETTINGS.announcementText,
    announcementText_ml: typeof data.announcement_text_ml === 'string' ? data.announcement_text_ml : INITIAL_DRAW_SETTINGS.announcementText_ml,
    contactPhone: typeof data.contact_phone === 'string' ? data.contact_phone : INITIAL_DRAW_SETTINGS.contactPhone,
    contactEmail: typeof data.contact_email === 'string' ? data.contact_email : INITIAL_DRAW_SETTINGS.contactEmail,
    churchAddress: typeof data.church_address === 'string' ? data.church_address : INITIAL_DRAW_SETTINGS.churchAddress,
    churchAddress_ml: typeof data.church_address_ml === 'string' ? data.church_address_ml : INITIAL_DRAW_SETTINGS.churchAddress_ml,
    couponPrice: typeof data.coupon_price === 'string' ? data.coupon_price : INITIAL_DRAW_SETTINGS.couponPrice,
  };
}

export async function fetchDrawSettingsFromSupabase(): Promise<DrawSettings | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('draw_settings')
    .select('*')
    .eq('id', '1')
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch draw settings from Supabase: ${error.message}`);
  }
  if (!data) return null;

  return mapDrawSettingsRow(data);
}

export async function updateDrawSettings(settings: Partial<DrawSettings>, adminEmail: string): Promise<DrawSettings> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Draw settings were not saved.');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Unable to initialize Supabase. Draw settings were not saved.');
  }

  const current = getDrawSettings();
  const updated: DrawSettings = {
    ...current,
    ...settings,
  };

  const { data, error } = await supabase
    .from('draw_settings')
    .upsert({
      id: '1',
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
      prizes: getPrizes(),
    }, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    throw new Error(`Cloud save failed. Draw settings were not saved locally: ${error.message}`);
  }
  if (Number(data.id) !== 1) {
    throw new Error(`Supabase returned unexpected draw settings row id ${data.id}.`);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    addAuditLog(
      'SETTINGS_UPDATE',
      `Updated draw settings (Date: ${updated.drawDateIST}, Price: ${updated.couponPrice})`,
      adminEmail
    );
  } catch (error) {
    console.warn('Settings were saved to Supabase, but local cache or audit log could not be updated:', error);
  }
  console.info('Supabase draw settings row saved:', data);
  notifyDataChange();
  return updated;
}

// -------------------------------------------------------------
// PUBLICATION WORKFLOW (Explicit confirmation + Security)
// -------------------------------------------------------------
export async function publishResults(adminEmail: string): Promise<DrawSettings> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured. Results were not published.');
  }

  const legacyWinners = getStoredWinners();
  for (const winner of legacyWinners) {
    const prize = getPrizes().find((item) => item.id === winner.prizeId);
    if (!prize) {
      throw new Error(`Cannot publish winner ${winner.winnerName}: prize ${winner.prizeId} no longer exists.`);
    }
    await upsertWinnerToSupabase(supabase, winner, prize);
  }

  const current = getDrawSettings();
  const updated: DrawSettings = {
    ...current,
    isPublished: true,
    publishedAt: new Date().toISOString(),
    publishedBy: adminEmail,
  };

  const { data, error } = await supabase.from('draw_settings').update({
    is_published: true,
    published_at: updated.publishedAt,
    published_by: adminEmail,
  }).eq('id', 1).select('id').maybeSingle();
  if (error) {
    throw new Error(`Winners were synced, but results could not be published: ${error.message}`);
  }
  if (!data || Number(data.id) !== 1) {
    throw new Error('Winner records were synced, but Supabase did not confirm publishing draw settings row 1.');
  }

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  addAuditLog(
    'PUBLISH_RESULTS',
    `Official prize coupon results published by ${adminEmail}`,
    adminEmail
  );
  notifyDataChange();
  return updated;
}

export async function unpublishResults(adminEmail: string, reason: string): Promise<DrawSettings> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not connected. Results were not unpublished.');
  }

  const current = getDrawSettings();
  const updated: DrawSettings = {
    ...current,
    isPublished: false,
    publishedAt: null,
    publishedBy: null,
  };

  const { data, error } = await supabase.from('draw_settings').update({
    is_published: false,
    published_at: null,
    published_by: null,
  }).eq('id', 1).select('id').maybeSingle();
  if (error) {
    throw new Error(`Unable to unpublish results in Supabase: ${error.message}`);
  }
  if (!data || Number(data.id) !== 1) {
    throw new Error('Supabase did not confirm unpublishing draw settings row 1.');
  }

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  addAuditLog(
    'UNPUBLISH_RESULTS',
    `Official results unpublished by ${adminEmail}. Reason: ${reason || 'Correction needed'}`,
    adminEmail
  );
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

        if (!localStorage.getItem(STORAGE_KEYS.HOME_THEATER_IMAGE_MIGRATION)) {
          prizes = prizes.map((prize) =>
            prize.id === 'prize-2'
              ? { ...prize, imageUrl: '/images/prizes/Premium%20Home%20Theater%20Showcase.png' }
              : prize,
          );
          localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
          localStorage.setItem(STORAGE_KEYS.HOME_THEATER_IMAGE_MIGRATION, 'complete');
        }

        if (!localStorage.getItem(STORAGE_KEYS.BEEF_IMAGE_MIGRATION)) {
          prizes = prizes.map((prize) =>
            prize.id === 'prize-6'
              ? { ...prize, imageUrl: '/images/prizes/beef.png' }
              : prize,
          );
          localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
          localStorage.setItem(STORAGE_KEYS.BEEF_IMAGE_MIGRATION, 'complete');
        }

        if (!localStorage.getItem(STORAGE_KEYS.AIR_FRYER_IMAGE_MIGRATION)) {
          prizes = prizes.map((prize) =>
            prize.id === 'prize-4'
              ? { ...prize, imageUrl: '/images/prizes/air-fryer.webp' }
              : prize,
          );
          localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
          localStorage.setItem(STORAGE_KEYS.AIR_FRYER_IMAGE_MIGRATION, 'complete');
        }

        if (!localStorage.getItem(STORAGE_KEYS.EGG_IMAGE_MIGRATION)) {
          prizes = prizes.map((prize) =>
            prize.id === 'prize-8'
              ? { ...prize, imageUrl: '/images/prizes/egg.avif' }
              : prize,
          );
          localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
          localStorage.setItem(STORAGE_KEYS.EGG_IMAGE_MIGRATION, 'complete');
        }

        if (!localStorage.getItem(STORAGE_KEYS.DUCK_IMAGE_MIGRATION)) {
          prizes = prizes.map((prize) =>
            prize.id === 'prize-7'
              ? { ...prize, imageUrl: '/images/prizes/duck.webp' }
              : prize,
          );
          localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
          localStorage.setItem(STORAGE_KEYS.DUCK_IMAGE_MIGRATION, 'complete');
        }

        if (!localStorage.getItem(STORAGE_KEYS.PRESSURE_WASHER_IMAGE_MIGRATION)) {
          prizes = prizes.map((prize) =>
            prize.id === 'prize-5'
              ? { ...prize, imageUrl: '/images/prizes/pressure-washer.jpg' }
              : prize,
          );
          localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
          localStorage.setItem(STORAGE_KEYS.PRESSURE_WASHER_IMAGE_MIGRATION, 'complete');
        }

        return prizes.sort((a, b) => a.orderIndex - b.orderIndex);
      }
    }
  } catch (e) {
    console.error('Error reading prizes:', e);
  }
  return INITIAL_PRIZES;
}

function isPrize(value: unknown): value is Prize {
  if (typeof value !== 'object' || value === null) return false;
  const prize = value as Record<string, unknown>;
  return typeof prize.id === 'string'
    && typeof prize.rank === 'number'
    && typeof prize.title === 'string'
    && ['bumper', 'major', 'appliance', 'consolation'].includes(String(prize.category))
    && typeof prize.categoryLabel === 'string'
    && typeof prize.imageUrl === 'string'
    && typeof prize.description === 'string'
    && typeof prize.orderIndex === 'number';
}

function parsePrizes(value: unknown): Prize[] {
  if (!Array.isArray(value) || !value.every(isPrize)) {
    throw new Error('Supabase returned invalid draw_settings.prizes data.');
  }
  return [...value].sort((a, b) => a.orderIndex - b.orderIndex);
}

function cachePrizes(prizes: Prize[], context: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
  } catch (error) {
    console.warn(`${context}, but the local prize cache could not be updated:`, error);
  }
}

export async function fetchPrizesFromSupabase(): Promise<Prize[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('draw_settings')
    .select('id, prizes')
    .eq('id', '1')
    .maybeSingle();
  if (error) {
    throw new Error(`Unable to fetch prizes from draw_settings row 1: ${error.message}`);
  }
  if (!data) return null;
  if (data.prizes === null) return null;

  const prizes = parsePrizes(data.prizes);
  cachePrizes(prizes, 'Prizes were loaded from Supabase');
  return prizes;
}

async function savePrizesToSupabase(prizes: Prize[]): Promise<Prize[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not connected. Prize changes were not saved.');
  }

  const { data, error } = await supabase
    .from('draw_settings')
    .update({ prizes })
    .eq('id', '1')
    .select('id, prizes')
    .maybeSingle();
  if (error) {
    throw new Error(`Unable to save prizes to draw_settings row 1: ${error.message}`);
  }
  if (!data || Number(data.id) !== 1) {
    throw new Error('Supabase did not confirm saving prizes to draw_settings row 1.');
  }

  return parsePrizes(data.prizes);
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
  const savedPrizes = await savePrizesToSupabase(updatedList);
  cachePrizes(savedPrizes, 'Prizes were saved to Supabase');

  addAuditLog('PRIZE_SAVE', action, adminEmail);
  notifyDataChange();
  return savedPrizes;
}

export async function deletePrize(prizeId: string, adminEmail: string): Promise<Prize[]> {
  const prizes = getPrizes();
  const target = prizes.find((p) => p.id === prizeId);
  const updatedList = prizes.filter((p) => p.id !== prizeId);

  if (target) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not connected. The prize was not deleted.');
    }
    const { error } = await supabase.from('winners').delete().eq('prize_rank', target.rank);
    if (error) {
      throw new Error(`Unable to remove winners for ${target.title}: ${error.message}`);
    }
  }
  const savedPrizes = await savePrizesToSupabase(updatedList);
  try {
    localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(
      getStoredWinners().filter((winner) => winner.prizeId !== prizeId),
    ));
  } catch (error) {
    console.warn('Prize was deleted from Supabase, but the local winner cache could not be updated:', error);
  }
  cachePrizes(savedPrizes, 'Prizes were deleted from Supabase');

  addAuditLog(
    'PRIZE_DELETE',
    `Deleted prize: ${target?.title || prizeId}`,
    adminEmail
  );

  notifyDataChange();
  return savedPrizes;
}

export async function reorderPrizes(reordered: Prize[], adminEmail: string): Promise<Prize[]> {
  const indexed = reordered.map((prize, idx) => ({
    ...prize,
    orderIndex: idx + 1,
  }));

  const savedPrizes = await savePrizesToSupabase(indexed);
  cachePrizes(savedPrizes, 'Prizes were reordered in Supabase');
  addAuditLog('PRIZE_REORDER', 'Reordered prizes list', adminEmail);
  notifyDataChange();
  return savedPrizes;
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
    const storedWinners = getStoredWinners();
    if (storedWinners.length > 0) return storedWinners;
  } catch (e) {
    console.error('Error reading winners:', e);
  }

  return isAdmin ? SAMPLE_WINNERS : [];
}

function getStoredWinners(): Winner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WINNERS);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as Winner[] : [];
  } catch (error) {
    console.error('Error reading saved winners:', error);
    return [];
  }
}

export async function fetchWinnersFromSupabase(): Promise<Winner[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('winners')
    .select('id, prize_rank, winning_coupon_number, winner_name, winner_location, verified_at, created_at');
  if (error) {
    throw new Error(`Unable to load winning coupons from Supabase: ${error.message}`);
  }

  const prizes = getPrizes();
  const winners = data.flatMap((row) => {
    const localPrize = prizes.find((prize) => prize.rank === row.prize_rank);
    if (!localPrize) {
      console.warn(`Skipping Supabase winner ${row.id}: no local prize matches rank ${row.prize_rank ?? 'unknown'}.`);
      return [];
    }
    return [{
      id: row.id,
      prizeId: localPrize.id,
      winningCouponNumber: row.winning_coupon_number,
      winnerName: row.winner_name,
      winnerLocation: row.winner_location ?? undefined,
      verifiedAt: row.verified_at ?? undefined,
      createdAt: row.created_at,
    }];
  });

  try {
    localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(winners));
  } catch (error) {
    console.warn('Winning coupons were loaded from Supabase, but the local cache could not be updated:', error);
  }

  return winners;
}

async function upsertWinnerToSupabase(
  supabase: NonNullable<ReturnType<typeof getSupabaseClient>>,
  winner: Winner,
  prize: Prize,
): Promise<Winner> {
  const normalizedCoupon = winner.winningCouponNumber.trim().toUpperCase();
  const { data: duplicate, error: duplicateError } = await supabase
    .from('winners')
    .select('id, prize_rank')
    .eq('winning_coupon_number', normalizedCoupon)
    .maybeSingle();
  if (duplicateError) {
    throw new Error(`Unable to check coupon number in Supabase: ${duplicateError.message}`);
  }
  if (duplicate && duplicate.prize_rank !== prize.rank) {
    throw new Error(`Coupon number "${normalizedCoupon}" is already assigned to another prize.`);
  }

  const { data: existingWinner, error: winnerLookupError } = await supabase
    .from('winners')
    .select('id')
    .eq('prize_rank', prize.rank)
    .limit(1);
  if (winnerLookupError) {
    throw new Error(`Unable to find the existing winner record: ${winnerLookupError.message}`);
  }

  const winnerValues = {
    prize_rank: prize.rank,
    winning_coupon_number: normalizedCoupon,
    winner_name: winner.winnerName.trim(),
    winner_location: winner.winnerLocation || null,
    verified_at: winner.verifiedAt || new Date().toISOString(),
  };
  const write = existingWinner[0]
    ? supabase.from('winners').update(winnerValues).eq('id', existingWinner[0].id)
    : supabase.from('winners').insert(winnerValues);
  const { data, error } = await write
    .select('id, prize_rank, winning_coupon_number, winner_name, winner_location, verified_at, created_at')
    .single();
  if (error) {
    throw new Error(`Unable to save winner to Supabase: ${error.message}`);
  }

  return {
    id: data.id,
    prizeId: winner.prizeId,
    winningCouponNumber: data.winning_coupon_number,
    winnerName: data.winner_name,
    winnerLocation: data.winner_location ?? undefined,
    verifiedAt: data.verified_at ?? undefined,
    createdAt: data.created_at,
  };
}

/**
 * Adds or updates a winner.
 * Enforces NO duplicate winning coupon numbers across different prizes.
 */
export async function saveWinner(winner: Winner, adminEmail: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not connected. The winner was not saved.' };
  }

  const winners = getStoredWinners();
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

  const prize = getPrizes().find((item) => item.id === winner.prizeId);
  if (!prize) {
    return { success: false, error: 'The selected prize could not be found.' };
  }

  let savedWinner: Winner;
  try {
    savedWinner = await upsertWinnerToSupabase(supabase, winner, prize);
  } catch (error) {
    console.error('Failed to save winner to Supabase:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to save winner to Supabase.' };
  }

  const existingIndex = winners.findIndex((w) => w.id === winner.id || w.prizeId === winner.prizeId);
  let updatedList: Winner[];

  if (existingIndex >= 0) {
    updatedList = [...winners];
    updatedList[existingIndex] = {
      ...winners[existingIndex],
      ...savedWinner,
    };
    addAuditLog(
      'WINNER_UPDATE',
      `Updated winner for prize ID ${winner.prizeId}: Coupon #${normalizedCoupon} (${winner.winnerName})`,
      adminEmail
    );
  } else {
    updatedList = [
      ...winners,
      savedWinner,
    ];
    addAuditLog(
      'WINNER_CREATE',
      `Added winner for prize ID ${winner.prizeId}: Coupon #${normalizedCoupon} (${winner.winnerName})`,
      adminEmail
    );
  }

  try {
    localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(updatedList));
  } catch (error) {
    console.warn('Winner was saved to Supabase, but the local cache could not be updated:', error);
  }
  notifyDataChange();
  return { success: true };
}

export async function deleteWinner(winnerId: string, adminEmail: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not connected. The winner was not deleted.');
  }

  const winners = getWinners(true);
  const target = winners.find((w) => w.id === winnerId);
  const updated = winners.filter((w) => w.id !== winnerId);

  const { error } = await supabase.from('winners').delete().eq('id', winnerId);
  if (error) {
    throw new Error(`Unable to delete winner from Supabase: ${error.message}`);
  }

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

export async function importDataJSON(jsonString: string, adminEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.settings || !data.prizes) {
      return { success: false, message: 'Invalid backup structure. Missing settings or prizes.' };
    }

    const importedPrizes = parsePrizes(data.prizes);
    const savedPrizes = await savePrizesToSupabase(importedPrizes);
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(savedPrizes));
    if (data.winners) localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(data.winners));
    
    addAuditLog('DATA_RESTORE', 'Restored data from external JSON backup', adminEmail);
    notifyDataChange();
    return { success: true, message: 'Data successfully restored from backup.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return { success: false, message: `Failed to restore backup: ${message}` };
  }
}

export async function resetToDefaults(adminEmail: string): Promise<void> {
  const savedPrizes = await savePrizesToSupabase(INITIAL_PRIZES);
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_DRAW_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(savedPrizes));
  localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(SAMPLE_WINNERS));
  addAuditLog('SYSTEM_RESET', 'Reset all prizes, settings, and test winners to church defaults', adminEmail);
  notifyDataChange();
}
