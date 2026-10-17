import React, { useState } from 'react';
import { Gift, Award, Eye, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { Prize, Language } from '../types';
import { translations } from '../constants/translations';
import { PrizeModal } from './PrizeModal';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface GiftGalleryProps {
  prizes: Prize[];
  language: Language;
}

const imageCredits = [
  {
    title: 'Home Theater Speakers 3',
    author: 'Fastily',
    file: 'Home_Theater_Speakers_3_2019-06-22.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    title: 'Air Fryer 2020',
    author: 'I am R.',
    file: 'Air_Fryer_2020.jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  },
  {
    title: 'Karcher pressure washer K MINI',
    author: 'Mosatsu',
    file: 'Karcher_pressure_washer_K_MINI.webp',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    title: 'Raw Beef at Barkin Dogo Market 03',
    author: 'Samsule2',
    file: 'Raw_Beef_at_Barkin_Dogo_Market_03.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    title: 'Duck meat 1',
    author: 'Fastily',
    file: 'Duck_meat_1_2017-03-13.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
];

export const GiftGallery: React.FC<GiftGalleryProps> = ({ prizes, language }) => {
  const [activePrize, setActivePrize] = useState<Prize | null>(null);
  const revealRef = useScrollReveal<HTMLElement>();

  const t = translations[language];

  return (
    <section id="gifts" ref={revealRef} data-reveal className="scroll-mt-24 py-16 bg-christmas-emerald border-b border-christmas-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-christmas-burgundy/40 border border-christmas-gold/30 text-christmas-ivory text-xs font-semibold">
            <Gift className="w-4 h-4 text-christmas-lightGold" />
            <span>KCYM Nellayi Christmas 2026</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-christmas-ivory">
            {t.gifts.title}
          </h2>

          <p className="text-christmas-ivory/80 text-sm sm:text-base leading-relaxed">
            {t.gifts.subtitle}
          </p>
        </div>

        {/* Prize Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {prizes.map((prize) => {
            const title = language === 'ml' && prize.title_ml ? prize.title_ml : prize.title;
            const description = language === 'ml' && prize.description_ml ? prize.description_ml : prize.description;
            const categoryLabel = language === 'ml' && prize.categoryLabel_ml ? prize.categoryLabel_ml : prize.categoryLabel;
            const sponsor = language === 'ml' && prize.sponsor_ml ? prize.sponsor_ml : prize.sponsor;

            return (
              <div
                key={prize.id}
                className="group relative bg-christmas-ivory rounded-3xl overflow-hidden border border-christmas-gold/40 shadow-card hover:shadow-card-hover hover:border-christmas-gold transition-all duration-300 flex flex-col hover:-translate-y-1 active:translate-y-0"
              >
                {/* Image Container */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-christmas-darkGreen">
                  <img
                    src={prize.imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  {/* Rank Ribbon Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-christmas-gold text-christmas-darkGreen font-serif font-black text-xs uppercase tracking-wider shadow-gold-glow">
                      <Award className="w-3.5 h-3.5" />
                      <span>{categoryLabel}</span>
                    </span>
                  </div>

                  {/* Rank Number Tag */}
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white font-mono font-bold text-sm flex items-center justify-center border border-white/30">
                    #{prize.rank}
                  </div>

                  {/* Quick view button on hover */}
                  <button
                    onClick={() => setActivePrize(prize)}
                    className="absolute bottom-3 right-3 min-h-10 px-3 py-2 rounded-lg bg-white/90 hover:bg-white text-christmas-darkGreen text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-sm opacity-90 group-hover:opacity-100 transition-opacity"
                    aria-label={`View details for ${title}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.gifts.viewDetails}</span>
                  </button>
                </div>

                {/* Card Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold text-christmas-emerald group-hover:text-christmas-red transition-colors line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Sponsor & Details Footer */}
                  <div className="pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    {sponsor ? (
                      <span className="min-w-0 flex-1 break-words leading-relaxed" title={sponsor}>
                        <strong className="text-gray-700">{t.gifts.sponsoredBy}</strong> {sponsor}
                      </span>
                    ) : (
                      <span className="text-christmas-emerald font-semibold">Parish Community</span>
                    )}

                    <button
                      onClick={() => setActivePrize(prize)}
                      className="min-h-10 px-2 text-christmas-gold font-bold hover:underline flex items-center gap-1 flex-shrink-0"
                    >
                      <span>More</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <details className="mt-6 text-xs text-christmas-ivory/75">
          <summary className="cursor-pointer underline underline-offset-4">
            Image credits and licenses
          </summary>
          <ul className="mt-2 space-y-1">
            {imageCredits.map((credit) => (
              <li key={credit.file}>
                <a
                  href={`https://commons.wikimedia.org/wiki/File:${credit.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-christmas-ivory"
                >
                  {credit.title}
                </a>
                {' '}by {credit.author}, licensed under{' '}
                <a
                  href={credit.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-christmas-ivory"
                >
                  {credit.license}
                </a>
                {' '}(cropped to fit the card image frame).
              </li>
            ))}
          </ul>
        </details>
      </div>

      {/* Prize Full Specs Modal */}
      <PrizeModal
        prize={activePrize}
        language={language}
        onClose={() => setActivePrize(null)}
      />
    </section>
  );
};
