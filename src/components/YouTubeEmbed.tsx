import React from 'react';

interface YouTubeEmbedProps {
  youtubeId: string;
  title?: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ youtubeId, title = "YouTube Music Video" }) => {
  if (!youtubeId) return null;

  return (
    <div className="youtube-embed">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        loading="lazy"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeEmbed;
