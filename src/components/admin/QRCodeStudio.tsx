import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, ExternalLink, Printer, Check, Copy, Sparkles, Church } from 'lucide-react';
import QRCode from 'qrcode';
import { DrawSettings } from '../../types';
import { formatToIST } from '../../utils/timezone';

interface QRCodeStudioProps {
  drawSettings: DrawSettings;
}

export const QRCodeStudio: React.FC<QRCodeStudioProps> = ({ drawSettings }) => {
  const [targetUrl, setTargetUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://kcym-nellayi.web.app';
  });

  const [sampleCouponNumber, setSampleCouponNumber] = useState('7842');
  const [includeCouponParam, setIncludeCouponParam] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fullEncodedUrl = includeCouponParam && sampleCouponNumber.trim()
    ? `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}coupon=${encodeURIComponent(sampleCouponNumber.trim())}`
    : targetUrl;

  // Generate QR code on canvas whenever fullEncodedUrl changes
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullEncodedUrl,
        {
          width: 280,
          margin: 2,
          color: {
            dark: '#0D1C20',
            light: '#FAECD8',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [fullEncodedUrl]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `KCYM-Nellayi-Coupon-QR-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullEncodedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-christmas-emerald">
          Coupon QR Code Generator & Print Studio
        </h3>
        <p className="text-xs text-gray-500">
          Generate production-ready QR codes for printing on physical Christmas prize coupons.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: QR Controls & Live Canvas (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-christmas-gold/15 text-christmas-darkGreen text-xs font-bold">
            <QrCode className="w-4 h-4 text-christmas-gold" />
            <span>High-Density 300 DPI QR Code</span>
          </div>

          {/* QR Canvas Display */}
          <div className="flex justify-center p-4 bg-christmas-ivory rounded-2xl border-2 border-dashed border-christmas-gold/50 shadow-inner">
            <canvas ref={canvasRef} className="rounded-xl shadow-md max-w-full" />
          </div>

          {/* Quick download buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleDownloadPNG}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-christmas-gold to-christmas-lightGold text-christmas-darkGreen font-bold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG (For Printing)</span>
            </button>

            <button
              onClick={handleCopyUrl}
              className="w-full py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'URL Copied to Clipboard!' : 'Copy Encoded URL'}</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-500">
            Encoded target: <code className="break-all font-mono text-gray-700 font-semibold">{fullEncodedUrl}</code>
          </p>
        </div>

        {/* Right Column: Configuration & Printed Coupon Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Target URL Settings */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h4 className="font-serif font-bold text-base text-christmas-emerald">
              Target Destination Configuration
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Deployed Public Website URL (HTTPS)
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://kcym-nellayi.web.app"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-sm font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Make sure to enter the final production domain (e.g. Vercel / Netlify / Custom church domain) before printing thousands of coupons.
              </p>
            </div>

            {/* Direct Coupon Test Parameter */}
            <div className="pt-2 border-t space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCouponParam}
                  onChange={(e) => setIncludeCouponParam(e.target.checked)}
                  className="rounded text-christmas-emerald focus:ring-christmas-gold"
                />
                <span className="text-xs font-bold text-gray-800">
                  Enable Direct Coupon Lookup Parameter (?coupon=XXXX)
                </span>
              </label>

              {includeCouponParam && (
                <div className="pl-6 pt-1">
                  <input
                    type="text"
                    value={sampleCouponNumber}
                    onChange={(e) => setSampleCouponNumber(e.target.value)}
                    placeholder="Enter test coupon number e.g. 7842"
                    className="p-2 rounded-xl border border-gray-300 text-xs font-mono w-48 uppercase font-bold"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    When scanned, this URL will automatically prefill and search this coupon number on the user's phone!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Physical Printed Coupon Mockup Preview */}
          <div className="bg-christmas-darkGreen text-christmas-ivory rounded-3xl p-6 border-2 border-christmas-gold shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-christmas-gold/30 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-christmas-lightGold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Physical Coupon Print Mockup</span>
              </span>
              <span className="text-[11px] text-christmas-champagne/80">300 DPI Press Spec</span>
            </div>

            {/* Simulated Paper Coupon Stub */}
            <div className="bg-christmas-ivory text-christmas-wood rounded-2xl p-4 sm:p-5 border-2 border-dashed border-christmas-gold flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-christmas-red">
                  <Church className="w-4 h-4" />
                  <span>KCYM ST. MARY'S CHURCH, NELLAYI</span>
                </div>
                <h5 className="font-serif text-lg font-black text-christmas-emerald leading-tight">
                  Christmas Prize Coupon 2026
                </h5>
                <p className="text-xs text-gray-600">
                  Draw Date: {formatToIST(drawSettings.drawDateIST)} | Contribution: {drawSettings.couponPrice}
                </p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                  <span className="font-mono text-xs font-black bg-christmas-gold/20 text-christmas-darkGreen px-2.5 py-1 rounded-md border border-christmas-gold/50">
                    NO: {sampleCouponNumber || '7842'}
                  </span>
                  <span className="text-[10px] text-gray-500 italic">Official Counterfoil</span>
                </div>
              </div>

              {/* QR Code Placement on Stub */}
              <div className="bg-white p-2.5 rounded-xl border border-gray-300 text-center flex-shrink-0 shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center border text-[9px] font-mono text-gray-500">
                  <QrCode className="w-12 h-12 text-christmas-darkGreen" />
                </div>
                <p className="text-[9px] font-bold text-christmas-emerald mt-1">SCAN TO CHECK</p>
                <p className="text-[8px] text-gray-500">Official Results</p>
              </div>
            </div>

            {/* Printing advice */}
            <div className="text-xs text-christmas-champagne/80 space-y-1">
              <p className="font-bold text-christmas-lightGold">Printing Instructions:</p>
              <p>• Download the PNG and supply it to your printing press for coupon layout.</p>
              <p>• Test scan the printed proof with at least 3 different iOS and Android smartphones in normal lighting before commencing mass printing.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
