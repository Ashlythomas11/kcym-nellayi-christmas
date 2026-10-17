export interface CountdownTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
  isExpired: boolean;
}

/**
 * Calculates remaining time until target date in Asia/Kolkata timezone.
 * Handles user's local timezone automatically by comparing absolute timestamps.
 */
export function calculateTimeLeft(targetDateISO: string): CountdownTimeLeft {
  const targetTime = new Date(targetDateISO).getTime();
  const currentTime = Date.now();
  const difference = targetTime - currentTime;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMilliseconds: difference,
    isExpired: false,
  };
}

/**
 * Formats a date into Asia/Kolkata (IST) display string.
 */
export function formatToIST(dateInput: string | Date | null): string {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return 'Invalid Date';

  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return `${formatter.format(date)} IST`;
}

/**
 * Returns formatted date and time for Malayalam representation
 */
export function formatToISTMalayalam(dateInput: string | Date | null): string {
  if (!dateInput) return 'ലഭ്യമല്ല';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return 'തെറ്റായ തീയതി';

  const formatter = new Intl.DateTimeFormat('ml-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${formatter.format(date)} (IST)`;
}
