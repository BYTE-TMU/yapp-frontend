import byteBlack from '@/assets/byte_black.png';
import byteWhite from '@/assets/byte_white.png';

function ByteAttribution({ className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}
    >
      <span>Presented by</span>
      <img src={byteBlack} alt="BYTE" className="h-6 w-auto dark:hidden" />
      <img
        src={byteWhite}
        alt="BYTE"
        className="h-6 w-auto hidden dark:block"
      />
    </div>
  );
}

export default ByteAttribution;
