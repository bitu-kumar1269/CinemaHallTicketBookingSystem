import React from 'react';
import Modal from '../common/Modal';

export default function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }) {
  if (!trailerUrl) return null;

  // Convert youtube watch URL or short URL to embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
      : url;
  };

  const embedSrc = getEmbedUrl(trailerUrl);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={movieTitle ? `${movieTitle} - Official Trailer` : 'Movie Trailer'}
      maxWidth="max-w-4xl"
    >
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
        {isOpen && (
          <iframe
            src={embedSrc}
            title="Movie Trailer"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </Modal>
  );
}

