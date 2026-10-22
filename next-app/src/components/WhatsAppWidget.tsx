'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);

  // Hide WhatsApp widget on Admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  // Strip any non-digit characters from the number for the wa.me URL (keep leading +)
  const sanitised = number.replace(/[^\d+]/g, '');
  const href = `https://wa.me/${sanitised}?text=${encodeURIComponent(
    'Hello, I need help with my order'
  )}`;

  // Don't render if no number is configured
  if (!sanitised) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white shadow-md"
        >
          Chat with us on WhatsApp
          {/* Caret */}
          <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 bg-gray-800" />
        </div>
      )}

      {/* Floating button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="flex items-center justify-center rounded-full bg-green-500 p-3 shadow-lg transition-colors duration-200 hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
      >
        {/* Official WhatsApp logo SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="h-7 w-7"
          aria-hidden="true"
          fill="white"
        >
          <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.638 4.64 1.849 6.653L2.667 29.333l6.88-1.813A13.275 13.275 0 0016.004 29.333c7.36 0 13.33-5.973 13.33-13.333S23.363 2.667 16.004 2.667zm0 24c-2.08 0-4.107-.56-5.867-1.627l-.42-.253-4.08 1.08 1.093-4-.28-.44A10.623 10.623 0 015.333 16c0-5.88 4.787-10.667 10.67-10.667 5.88 0 10.664 4.787 10.664 10.667S21.884 26.667 16.004 26.667zm5.853-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16s-.826 1.04-1.013 1.253c-.187.213-.373.24-.693.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.26-.627-.527-.54-.72-.547h-.613c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.467 4.827.763.333 1.36.533 1.827.68.767.24 1.467.207 2.013.127.614-.094 1.894-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
        </svg>
      </a>
    </div>
  );
}
