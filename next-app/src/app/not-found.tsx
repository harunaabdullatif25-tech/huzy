import Link from 'next/link';

/**
 * Custom 404 Not Found page.
 */
export default function NotFound() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+1234567890';
  // Remove leading '+' for the wa.me URL format
  const waNumber = whatsappNumber.replace(/^\+/, '');

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center px-4 text-center transition-colors">
      <p className="text-9xl font-extrabold text-amber-500 leading-none">404</p>
      <h1 className="mt-4 text-3xl font-bold text-stone-900 dark:text-white">Page Not Found</h1>
      <p className="mt-3 text-stone-500 dark:text-stone-400 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-sm transition-colors"
        >
          Go Home
        </Link>

        <Link
          href="/products"
          className="inline-flex items-center px-6 py-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-semibold shadow-xs hover:border-amber-500 transition-colors"
        >
          Browse Products
        </Link>

        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition-colors"
        >
          {/* WhatsApp icon (inline SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-5 h-5 fill-white"
          >
            <path d="M16 0C7.164 0 0 7.163 0 16c0 2.824.74 5.476 2.035 7.775L0 32l8.43-2.01A15.938 15.938 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.784-1.858l-.487-.288-5.005 1.194 1.24-4.859-.318-.5A13.262 13.262 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.802c-.398-.199-2.356-1.162-2.72-1.294-.365-.133-.63-.199-.896.199-.265.398-1.029 1.294-1.261 1.56-.232.265-.464.298-.862.1-.398-.2-1.68-.619-3.2-1.975-1.183-1.055-1.981-2.358-2.213-2.756-.232-.398-.025-.613.174-.811.178-.178.398-.464.597-.696.199-.232.265-.398.398-.663.133-.265.066-.498-.033-.696-.1-.199-.896-2.16-1.228-2.956-.323-.776-.651-.671-.896-.683l-.763-.013c-.265 0-.696.1-1.061.498-.365.398-1.393 1.361-1.393 3.32 0 1.959 1.426 3.851 1.625 4.116.199.265 2.805 4.282 6.795 6.004.95.41 1.691.655 2.269.838.953.303 1.82.26 2.505.158.764-.114 2.356-.963 2.689-1.893.333-.93.333-1.727.232-1.893-.099-.166-.365-.265-.763-.464z" />
          </svg>
          Contact Us via WhatsApp
        </a>
      </div>
    </main>
  );
}
