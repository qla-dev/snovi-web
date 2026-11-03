import React from 'react';
import { API_ORIGIN } from '../appLinks';

/** A promoter as the API sends it (GET /promoters/{username} and the promoter of a code preview). */
export type Promoter = {
  username: string;
  first_name: string;
  last_name: string;
  name: string;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  instagram: string | null;
  url: string;
};

export const promoterPhotoUrl = (url: string | null) =>
  !url ? null : /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}/${url.replace(/^\/+/, '')}`;

/** Round photo, or the initials on a violet gradient when there is none. */
export function PromoterAvatar({ promoter, className = 'h-12 w-12 text-base' }: { promoter: Pick<Promoter, 'name' | 'first_name' | 'last_name' | 'photo_url'>; className?: string }) {
  const photo = promoterPhotoUrl(promoter.photo_url);

  return photo ? (
    <img src={photo} alt={promoter.name} className={`${className} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-700 font-black text-white`}>
      {`${promoter.first_name.charAt(0)}${promoter.last_name.charAt(0)}`.toUpperCase()}
    </span>
  );
}
