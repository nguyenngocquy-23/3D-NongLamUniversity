import React, { useEffect, useState } from "react";
import styles from "../../styles/soundUpload.module.css";
import Swal from "sweetalert2";

function SoundUpload({
  soundBackground,
  setSoundBackground,
}: {
  soundBackground?: string;
  setSoundBackground: (sound: string) => void;
}) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      if (file.size > MAX_FILE_SIZE) {
        Swal.fire({
          icon: "warning",
          title: "Lỗi",
          text: "File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.",
        });
        return;
      }
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
        Swal.fire({
          icon: "warning",
          title: "Lỗi",
          text: "Tải file thất bại. Vui lòng thử lại.",
        });
      };
    } else {
      Swal.fire({
        icon: "warning",
        title: "Lỗi",
        text: "File không hợp lệ.",
      });
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
      {(audioFile || soundBackground) && (
        <div className="mt-2">
          <audio controls src={audioURL || soundBackground} />
        </div>
      )}
    </div>
  );
}

export default SoundUpload;
