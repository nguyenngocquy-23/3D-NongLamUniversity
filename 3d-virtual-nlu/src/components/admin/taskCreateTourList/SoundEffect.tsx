import { PositionalAudio } from "@react-three/drei";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type SoundEffectProps = {
  url: string;
  distance?: number;
  loop?: boolean;
  volume?: number;
  setPlayFunction: (fn: () => void) => void;
};

const SoundEffect: React.FC<SoundEffectProps> = ({
  url,
  distance = 40,
  loop = false,
  volume = 1,
  setPlayFunction,
}) => {
  const soundRef = useRef<THREE.PositionalAudio>(null);

  useEffect(() => {
    const sound = soundRef.current;

    if (!sound) return;
    sound.setVolume(volume);
    const play = () => {
      if (sound.buffer) {
        if (sound.isPlaying) sound.stop();
        sound.play();
      }
    };
    //Truyền hàm setPlayFunction ra ngoài.
    setPlayFunction(play);
  }, [setPlayFunction]);

  return (
    <PositionalAudio ref={soundRef} url={url} distance={distance} loop={loop} />
  );
};

export default SoundEffect;
