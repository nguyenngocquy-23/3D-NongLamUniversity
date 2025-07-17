import React, { useEffect, useState } from "react";
import styles from "../../styles/soundUpload.module.css";

function SoundUpload({
  setSoundBackground,
}: {
  setSoundBackground: (sound: string) => void;
}) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        setSoundBackground(base64);
      };
      reader.onerror = () => {
        alert("Đọc file thất bại. Vui lòng thử lại.");
      };
    } else {
      alert("Vui lòng chọn một file âm thanh hợp lệ!");
    }
  };

  // Xoá objectURL cũ khi file thay đổi
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return (
    <div className={styles.sound_container}>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className={styles.input_file}
      />
      {audioFile && (
        <div className="mt-2">
          <audio controls src={audioURL || ""} />
        </div>
      )}
    </div>
  );
}

export default SoundUpload;
