import { Star, BadgeCheck, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/lib/business";

const JUSTDIAL_TEAL = "#00a6a9";

/** Official 4-colour Google "G", inlined so it needs no network request. */
function GoogleG({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function Stars({ size = 16 }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} width={size} height={size} className="text-[#F6C445] fill-[#F6C445]" />
      ))}
    </span>
  );
}

/**
 * Reputation / verification badges.
 *
 * variant="full"    — two premium cards (Contact page, light background).
 * variant="compact" — two pill links (Footer, dark background).
 *
 * The "5.0 Google Rating" is a visual badge that links to the Google Business
 * Profile; it is intentionally NOT emitted as schema aggregateRating.
 */
export default function TrustBadges({ variant = "full", heading = false, className = "" }) {
  const { profiles, rating } = BUSINESS;
  const reviewLabel = `${rating.value} rating on Google — read reviews`;

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <a
          href={profiles.google}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={reviewLabel}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 transition-colors hover:bg-white/10"
        >
          <GoogleG className="w-4 h-4 shrink-0" />
          <Stars size={13} />
          <span className="text-xs font-bold text-white">{rating.value}</span>
          <span className="text-xs text-gray-400">Google Reviews</span>
        </a>
        <a
          href={profiles.justdial}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Verified on Justdial — view profile"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 transition-colors hover:bg-white/10"
        >
          <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: JUSTDIAL_TEAL }} />
          <span className="text-xs font-bold text-white">Justdial</span>
          <span className="text-xs text-gray-400">Verified</span>
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      {heading && (
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
          Trusted &amp; Verified
        </h3>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Google reviews — whole card links to the Business Profile */}
        <a
          href={profiles.google}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={reviewLabel}
          className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <GoogleG className="w-9 h-9 shrink-0" />
            <div>
              <Stars size={17} />
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-bold text-dark">{rating.value}</span> · Google Rating
              </p>
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5">
            Read Google Reviews <ArrowRight className="w-4 h-4" />
          </span>
        </a>

        {/* Justdial verification */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${JUSTDIAL_TEAL}1a` }}
            >
              <BadgeCheck className="h-5 w-5" style={{ color: JUSTDIAL_TEAL }} />
            </span>
            <div>
              <p className="font-bold leading-tight text-dark">Verified on Justdial</p>
              <p className="text-sm text-gray-500">Trusted local business</p>
            </div>
          </div>
          <a
            href={profiles.justdial}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
            style={{ color: JUSTDIAL_TEAL }}
          >
            View Justdial Profile <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
