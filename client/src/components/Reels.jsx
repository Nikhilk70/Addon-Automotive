import { useEffect, useRef, useState } from 'react';
import { Instagram, Volume2, VolumeX, Play, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** One vertical reel. Autoplays muted and looping while at least 60% visible. */
function ReelCard({ reel }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = prefersReducedMotion();
  const hasVideo = Boolean(reel.video) && !failed;

  useEffect(() => {
    const el = ref.current;
    const video = videoRef.current;
    if (!el || !video || reduced) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasVideo, reduced]);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <article className={`reel ${hasVideo ? '' : 'reel-empty'}`} ref={ref}>
      {hasVideo ? (
        <>
          <video
            ref={videoRef}
            src={reel.video}
            poster={reel.poster || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
            onClick={togglePlay}
            aria-label={`${reel.title} - ${reel.car}`}
          />
          {!playing && (
            <button className="reel-play" onClick={togglePlay} aria-label="Play reel"><Play size={26} fill="currentColor" /></button>
          )}
          <button className="reel-sound" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Mute'}>
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </>
      ) : (
        <div className="reel-placeholder" style={reel.poster ? { backgroundImage: `url(${reel.poster})` } : undefined}>
          <Instagram size={40} strokeWidth={1.5} />
        </div>
      )}

      <div className="reel-info">
        {reel.tag && <span className="reel-tag">{reel.tag}</span>}
        <strong>{reel.title}</strong>
        {reel.car && <span className="reel-car">{reel.car}</span>}
        {reel.instagramUrl && (
          <a href={reel.instagramUrl} target="_blank" rel="noreferrer" className="reel-link">
            <Instagram size={14} /> Watch on Instagram <ArrowUpRight size={13} />
          </a>
        )}
      </div>
    </article>
  );
}

export default function Reels({ reels }) {
  const { settings } = useStore();
  const trackRef = useRef(null);
  if (!reels?.length) return null;

  const scroll = (dir) => {
    const t = trackRef.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="section reels-section dark">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="slash-tag">Straight from the studio</span>
            <h2 className="display">Latest builds on Instagram</h2>
            <p>Real cars, real installs. Swipe through our recent work.</p>
          </div>
          <div className="row">
            <button className="icon-btn reel-arrow" onClick={() => scroll(-1)} aria-label="Previous reels"><ChevronLeft size={20} /></button>
            <button className="icon-btn reel-arrow" onClick={() => scroll(1)} aria-label="More reels"><ChevronRight size={20} /></button>
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" className="btn btn-red">
                <Instagram size={17} /> Follow {settings.instagramHandle}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="reels-track" ref={trackRef}>
        {reels.map((r) => <ReelCard key={r.id} reel={r} />)}
      </div>
    </section>
  );
}
