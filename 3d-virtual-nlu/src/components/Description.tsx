import Quill from "quill";
import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

interface DescriptionProps {
  value?: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
  placeHolder?: string;
}

const Description: React.FC<DescriptionProps> = ({
  value,
  onChange,
  readOnly,
  placeHolder,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);
  useEffect(() => {
    if (!editorRef.current) return;

    // Khởi tạo Quill
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      readOnly,
      modules: {
        toolbar: [
          ["bold", "italic", "underline"],
          ["blockquote"],
          [{ script: "sub" }, { script: "super" }],
          [{ header: 1 }, { header: 2 }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }], // dropdown with defaults from theme
          [{ font: [] }],
          [{ align: [] }],
          ["link"],
          // ["link", "image", "video"],
          ["clean"],
        ],
      },
    });

    // Set nội dung ban đầu nếu có
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    // Lưu ref
    quillInstanceRef.current = quill;

    // Lắng nghe sự thay đổi nội dung
    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChange?.(html);
    });

    return () => {
      quill.off("text-change", () => {});
    };
  }, []);

  return <div ref={editorRef} style={{ minHeight: "150px" }} />;
};

export default Description;
