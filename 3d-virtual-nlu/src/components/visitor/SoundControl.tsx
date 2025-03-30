import { useState } from "react";
import { IoMdVolumeHigh, IoMdVolumeOff } from "react-icons/io";
import styles from "../../styles/virtualTour.module.css";
const SoundControl: React.FC<{ className?: string }> = ({ className }) => {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <button className={className} onClick={() => setIsMuted(!isMuted)}>
      {isMuted ? <IoMdVolumeOff /> : <IoMdVolumeHigh />}
    </button>
  );
};

export default SoundControl;
