import Quill from "quill";
import QuillResize from "@botom/quill-resize-module";
Quill.register("modules/resize", QuillResize);
import { useCallback, useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import {
  PICTURE_MAX_HEIGHT,
  PICTURE_MAX_QUANTITY,
  PICTURE_MAX_WIDTH,
  PICTURE_SIZE_LIMIT,
} from "../utils/Constants";
import axios, { Axios, AxiosError } from "axios";
import { API_URLS } from "../env";
import {
  ApiResponse,
  CloudinaryUploadResp,
  FileUploadStatus,
} from "./admin/UploadFile";
import Swal from "sweetalert2";

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
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  useEffect(() => {
    if (!editorRef.current) return;
    Quill.register("modules/resize", QuillResize);
    // Khởi tạo Quill
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      readOnly,
      modules: {
        toolbar: {
          container: [
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
            // ["link"],
            ["link", "image", "video"],
            ["clean"],
          ],

          handlers: {
            image: async function () {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", ".jpg , .jpeg, .avif, .webp, .png");
              input.click();

              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;

                //1. Limit ảnh trong quill.
                const contents = quill.getContents();
                const imageCount =
                  contents.ops?.filter(
                    (op: any) => op.insert && op.insert.image
                  ).length ?? 0;

                if (imageCount >= PICTURE_MAX_QUANTITY) {
                  Swal.fire({
                    icon: "warning",
                    title: "⚠️ Ảnh nhúng đã đạt giới hạn!",
                    text: `Vui lòng chỉ sử dụng ${PICTURE_MAX_QUANTITY} ảnh`,
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 4000,
                    timerProgressBar: true,
                  });
                  return;
                }

                //2. Kiểm tra dung lượng file.
                if (file.size > PICTURE_SIZE_LIMIT * 1024 * 1024) {
                  Swal.fire({
                    icon: "warning",
                    title: "⚠️ Ảnh nhúng vượt quá kích thước!",
                    text: `Vui lòng chỉ sử dụng ảnh dưới ${PICTURE_SIZE_LIMIT} mb`,
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 4000,
                    timerProgressBar: true,
                  });
                  return;
                }
                //3. Kiểm tra resolution.
                const imgBitmap = await createImageBitmap(file);
                // if (
                //   imgBitmap.width > PICTURE_MAX_WIDTH ||
                //   imgBitmap.height > PICTURE_MAX_HEIGHT
                // ) {
                //   //alert rằng kích thước ảnh quá nhiều.
                //   alert("Kích thước lớn");
                //   return;
                // }

                // logic form data lấy dữ liệu từ api.
                const formattedData: {
                  originalFileName: string;
                  url: string;
                }[] = [];
                const formData = new FormData();
                formData.append("file", file);

                try {
                  const resp = await axios.post<
                    ApiResponse<CloudinaryUploadResp>
                  >(API_URLS.UPLOAD_CLOUD, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });

                  if (resp.data.statusCode === 200) {
                    Swal.fire({
                      icon: "success",
                      title: "Tải ảnh thành công!!",
                      toast: true,
                      position: "top-end",
                      showConfirmButton: false,
                      timer: 4000,
                      timerProgressBar: true,
                    });
                    const item = resp.data.data!;
                    if (item.originalFileName && item.url) {
                      formattedData.push({
                        originalFileName: item.originalFileName,
                        url: item.url,
                      });

                      const range = quill.getSelection(true);
                      quill.insertEmbed(range.index, "image", item.url);

                      setTimeout(() => {
                        const imgs = quill.root.querySelectorAll("img");
                        const lastImg = imgs[imgs.length - 1];
                      }, 0);

                      quill.setSelection(range.index + 1);

                      // Đánh dấu thành công
                      setFileStatuses((prev) =>
                        prev.map((f) =>
                          f.file.name === item.originalFileName
                            ? {
                                ...f,
                                status: "success",
                                uploadedUrl: item.url,
                                error: undefined,
                              }
                            : f
                        )
                      );
                    }
                  } else {
                    // Đánh dấu lỗi nếu server trả về lỗi
                    setFileStatuses((prev) =>
                      prev.map((f) =>
                        f.file.name === file.name
                          ? { ...f, status: "error", error: resp.data.message }
                          : f
                      )
                    );
                  }
                } catch (error: unknown) {
                  const err = error as AxiosError<ApiResponse<null>>;
                  const message = err.response?.data?.message || err.message;

                  // Đánh dấu lỗi nếu request bị lỗi
                  setFileStatuses((prev) =>
                    prev.map((f) =>
                      f.file.name === file.name
                        ? { ...f, status: "error", error: message }
                        : f
                    )
                  );

                  console.error("[UploadFile Error:]", message);
                }
              };
            },

            video: function () {
              const inputUrl = prompt("Dán URL video từ Youtube");
              if (!inputUrl) return;

              //Kiểm tra url của youtube.
              const youtubeRegex =
                /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})([&?].*)?$/;

              const match = inputUrl.match(youtubeRegex);

              if (!match) {
                alert("Chỉ hỗ trợ nhúng video từ youtube!");
                return;
              }

              const videoId = match[4];
              const embedUrl = `https://www.youtube.com/embed/${videoId}`;

              //Chèn sạch dưới dạng frame
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "video", embedUrl);
              quill.setSelection(range.index + 1);
            },
          },
        },
        resize: {
          modules: ["Resize", "DisplaySize", "Toolbar"],
          parchment: {
            image: {
              attribute: ["width"], // hoặc ['width', 'height']
              limit: {
                minWidth: 200,
                maxWidth: 600,
                minHeight: 200,
                maxHeight: 450,
                ratio: 0.5625,
              },
            },
          },
        },
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
