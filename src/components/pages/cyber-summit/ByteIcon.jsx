import byteIconBlack from '@/assets/byte_icon_black.png';
import byteIconWhite from '@/assets/byte_icon_white.png';

function ByteIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <>
      <img src={byteIconBlack} alt="" className={`${className} dark:hidden`} />
      <img
        src={byteIconWhite}
        alt=""
        className={`${className} hidden dark:block`}
      />
    </>
  );
}

export default ByteIcon;
