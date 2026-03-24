import yappIcon from '@/assets/Yapp web icon.png';
import './OgBadge.css';

/**
 * OgBadge — shown on profiles of users who joined before the OG cutoff date.
 * Hovering reveals a small tooltip: "OG Yapp Member 🎉"
 */
function OgBadge() {
  return (
    <span className="og-badge" aria-label="OG Yapp Member">
      <img src={yappIcon} alt="Yapp OG" className="og-badge__icon" />
      <span className="og-badge__tooltip" role="tooltip">
        OG Yapp Member 😎
      </span>
    </span>
  );
}

export default OgBadge;
