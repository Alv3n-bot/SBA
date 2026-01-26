import { Play } from 'lucide-react';

export default function VideoBlock({ block }) {
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const embedUrl = getYouTubeEmbedUrl(block.url);

  return (
    <div className="mb-4 max-w-md mx-auto">
      {block.title && (
        <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Play className="w-4 h-4 text-gray-800" />
          {block.title}
        </h4>
      )}
      {embedUrl ? (
        <div className="aspect-video rounded-md overflow-hidden shadow-sm border border-gray-200">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : block.url ? (
        <video
          src={block.url}
          controls
          className="w-full rounded-md shadow-sm"
        />
      ) : (
        <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-gray-500 text-sm">No video available</p>
        </div>
      )}
      {block.description && (
        <p className="text-gray-600 mt-2 text-sm">{block.description}</p>
      )}
    </div>
  );
}