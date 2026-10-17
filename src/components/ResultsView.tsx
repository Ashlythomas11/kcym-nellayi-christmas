import React, { useState } from 'react';
import { Award, Search, Sparkles, AlertCircle, CheckCircle2, Calendar, Printer, Filter, ShieldCheck, Gift } from 'lucide-react';
import { Prize, Winner, DrawSettings, Language, CouponSearchResult } from '../types';
import { translations } from '../constants/translations';
import { formatToIST, formatToISTMalayalam } from '../utils/timezone';
import { searchCoupon } from '../services/storage';
import { triggerWinnerCelebration } from '../utils/confetti';
import { CouponSearchModal } from './CouponSearchModal';
import { NoticeBoardPrint } from './NoticeBoardPrint';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ResultsViewProps {
  drawSettings: DrawSettings;
  prizes: Prize[];
  winners: Winner[];
  language: Language;
  onSearchRequest?: (coupon: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  drawSettings,
  prizes,
  winners,
  language,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [filterText, setFilterText] = useState('');
  const [activeSearchResult, setActiveSearchResult] = useState<CouponSearchResult | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const revealRef = useScrollReveal<HTMLElement>();

  const t = translations[language];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const result = searchCoupon(searchInput.trim(), false);
    setActiveSearchResult(result);

    if (result.isWinner) {
      triggerWinnerCelebration();
    }
  };

  const formattedPublicationDate =
    language === 'en'
      ? formatToIST(drawSettings.publishedAt)
      : formatToISTMalayalam(drawSettings.publishedAt);

  const formattedScheduledDate =
    language === 'en'
      ? formatToIST(drawSettings.drawDateIST)
      : formatToISTMalayalam(drawSettings.drawDateIST);

  // Filter prize results table
  const filteredPrizeResults = prizes
    .map((prize) => {
      const winner = winners.find((w) => w.prizeId === prize.id);
      return { prize, winner };
    })
    .filter(({ prize, winner }) => {
      if (!filterText.trim()) return true;
      const q = filterText.toLowerCase();
      return (
        prize.title.toLowerCase().includes(q) ||
        prize.categoryLabel.toLowerCase().includes(q) ||
        (winner && winner.winningCouponNumber.toLowerCase().includes(q)) ||
        (winner && winner.winnerName.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => a.prize.rank - b.prize.rank);

  return (
    <section id="results" ref={revealRef} data-reveal className="scroll-mt-24 py-16 bg-christmas-darkGreen border-b border-christmas-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PRE-PUBLICATION STATE */}
        {!drawSettings.isPublished ? (
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 bg-christmas-ivory rounded-3xl p-5 sm:p-8 md:p-12 border-2 border-christmas-gold/40 shadow-xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-christmas-gold/15 border-2 border-christmas-gold/50 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-christmas-red" />
            </div>

            <div className="space-y-3">
              <span className="inline-flex max-w-full justify-center whitespace-normal break-words px-3.5 py-1.5 rounded-full bg-christmas-parchment text-christmas-wood border border-christmas-gold/50 text-xs font-bold uppercase tracking-wider">
                {language === 'en' ? 'Status: Pending Draw & Verification' : 'നറുക്കെടുപ്പ് - പരിശോധന തുടരുന്നു'}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-christmas-emerald break-words">
                {t.results.preTitle}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                {t.results.preDesc}
              </p>
            </div>

            {/* Scheduled Date Notice Box */}
            <div className="bg-christmas-ivory border border-christmas-gold/40 rounded-2xl p-6 text-left max-w-xl mx-auto space-y-3">
              <div className="flex items-center gap-2 text-christmas-red font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{language === 'en' ? 'Scheduled Draw Timeline' : 'നറുക്കെടുപ്പ് തീയതി വിവരങ്ങൾ'}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {formattedScheduledDate}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.results.preNotice}
              </p>
            </div>

            {/* Security Guarantee Notice */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-christmas-emerald" />
              <span>
                {language === 'en'
                  ? 'Official counterfoils are sealed and monitored under the supervision of church authorities.'
                  : 'ഇടവക അധികൃതരുടെ മേൽനോട്ടത്തിൽ പരിശോധിച്ചുറപ്പിച്ച ശേഷമേ ഔദ്യോഗിക ഫലങ്ങൾ പ്രസിദ്ധീകരിക്കൂ.'}
              </span>
            </div>
          </div>
        ) : (
          /* POST-PUBLICATION STATE: OFFICIAL RESULTS */
          <div className="space-y-12">
            
            {/* Header with Official Parish Seal */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-christmas-emerald border border-christmas-gold/60 text-christmas-ivory text-xs font-black uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-christmas-lightGold" />
                <span>OFFICIALLY VERIFIED & ANNOUNCED</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-christmas-ivory leading-tight">
                {t.results.postTitle}
              </h2>

              <p className="text-sm sm:text-base text-christmas-ivory/80">
                {t.results.postSubtitle} • {t.results.publishedOn} <strong className="text-christmas-ivory">{formattedPublicationDate}</strong>
              </p>

              {/* Action: Notice Board Print Sheet */}
              <div className="pt-2">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-christmas-ivory hover:bg-christmas-parchment border-2 border-christmas-gold text-christmas-darkGreen font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105"
                >
                  <Printer className="w-4 h-4 text-christmas-red" />
                  <span>{t.results.printSheetBtn}</span>
                </button>
              </div>
            </div>

            {/* Interactive Coupon Search Widget */}
            <div className="bg-gradient-to-br from-christmas-darkGreen to-christmas-emerald text-christmas-ivory rounded-3xl p-6 sm:p-8 border-2 border-christmas-gold shadow-xl max-w-3xl mx-auto">
              <div className="space-y-3 text-center sm:text-left mb-6">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-christmas-lightGold text-sm font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.results.searchLabel}</span>
                </div>
                <p className="text-xs sm:text-sm text-christmas-champagne">
                  {language === 'en'
                    ? 'Check if your printed coupon number has won a prize. Results update live!'
                    : 'നിങ്ങളുടെ കൂപ്പൺ നമ്പർ നൽകി സമ്മാനാർഹമാണോ എന്ന് പരിശോധിക്കുക.'}
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t.results.searchPlaceholder}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-christmas-ivory text-christmas-wood placeholder-gray-500 font-mono font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-christmas-gold shadow-inner"
                    aria-label="Search coupon number"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-4" />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-christmas-gold to-christmas-lightGold text-christmas-darkGreen font-bold text-base hover:brightness-105 active:scale-95 transition-all shadow-md flex-shrink-0"
                >
                  {t.results.searchBtn}
                </button>
              </form>
            </div>

            {/* Results Filter & Table Section */}
            <div className="bg-christmas-ivory rounded-3xl border border-christmas-gold/40 shadow-xl overflow-hidden">
              
              {/* Table Toolbar */}
              <div className="p-4 sm:p-6 bg-christmas-ivory border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-christmas-gold" />
                  <span className="font-serif font-bold text-lg text-christmas-emerald">
                    {language === 'en' ? 'Complete Winning Coupons List' : 'വിജയികളുടെ സമ്പൂർണ്ണ പട്ടിക'}
                  </span>
                  <span className="text-xs bg-christmas-emerald text-christmas-ivory font-mono px-2 py-0.5 rounded-full">
                    {filteredPrizeResults.length}
                  </span>
                </div>

                {/* Filter input */}
                <div className="w-full sm:w-72 relative">
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder={t.results.filterPlaceholder}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-christmas-gold"
                  />
                  <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Responsive Cards for Mobile, Table for Desktop */}
              <div className="divide-y divide-gray-100">
                {filteredPrizeResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No results match your filter.
                  </div>
                ) : (
                  filteredPrizeResults.map(({ prize, winner }) => {
                    const prizeTitle =
                      language === 'ml' && prize.title_ml ? prize.title_ml : prize.title;
                    const categoryLabel =
                      language === 'ml' && prize.categoryLabel_ml ? prize.categoryLabel_ml : prize.categoryLabel;

                    return (
                      <div
                        key={prize.id}
                        className="p-5 sm:p-6 hover:bg-christmas-parchment/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        {/* Prize Info & Thumbnail */}
                        <div className="flex items-start gap-4">
                          <img
                            src={prize.imageUrl}
                            alt={prizeTitle}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-christmas-gold/40 flex-shrink-0 shadow-sm"
                            loading="lazy"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-christmas-red text-white text-[11px] font-black uppercase tracking-wider">
                                {categoryLabel}
                              </span>
                              <span className="text-xs font-mono font-semibold text-gray-500">
                                Rank #{prize.rank}
                              </span>
                            </div>
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-christmas-emerald">
                              {prizeTitle}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-md">
                              {prize.description}
                            </p>
                          </div>
                        </div>

                        {/* Winning Coupon & Winner Details Badge */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-christmas-ivory p-4 rounded-2xl border border-christmas-gold/40">
                          {/* Winning Coupon Number */}
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                              {t.results.winningNumberLabel}
                            </span>
                            <span className="font-mono text-2xl sm:text-3xl font-black text-christmas-red tracking-wider">
                              {winner?.winningCouponNumber || '—'}
                            </span>
                          </div>

                          <div className="hidden sm:block h-10 w-px bg-gray-200" />

                          {/* Winner Name */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                              {t.results.winnerLabel}
                            </span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base block">
                              {winner?.winnerName || 'Awaiting counterfoil submission'}
                            </span>
                            {winner?.winnerLocation && (
                              <span className="text-xs text-gray-500 block">
                                {winner.winnerLocation}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Disclaimer Footer */}
              <div className="p-4 bg-gray-50 text-[11px] text-gray-500 text-center border-t border-gray-200">
                {t.results.disclaimer}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Coupon Search Modal */}
      <CouponSearchModal
        searchResult={activeSearchResult}
        language={language}
        drawSettings={drawSettings}
        onClose={() => setActiveSearchResult(null)}
      />

      {/* Notice Board Print Sheet Modal */}
      {showPrintModal && (
        <NoticeBoardPrint
          prizes={prizes}
          winners={winners}
          drawSettings={drawSettings}
          language={language}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </section>
  );
};
