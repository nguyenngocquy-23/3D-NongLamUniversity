import React, { useState } from "react";
import styles from "../../styles/visitor/contact.module.css";
import Swal from "sweetalert2";
import axios from "axios";
import { API_URLS } from "../../env";

export default function Contact() {
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const [email, setEmail] = useState(user?.email || "");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !content) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng điền đầy đủ thông tin!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
    if (content.length < 10) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Nội dung liên hệ phải có ít nhất 10 ký tự!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    try {
      const response = await axios.post(API_URLS.SEND_CONTACT, {
        userId: user?.id || null,
        email: email,
        content: content,
      });
      if (response.data.data) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Liên hệ của bạn đã được gửi thành công!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        setContent("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Đã xảy ra lỗi khi gửi liên hệ. Vui lòng thử lại sau.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Đã xảy ra lỗi khi gửi liên hệ. Vui lòng thử lại sau.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      console.error("Error sending contact:", error);
    }
  };
  return (
    <div id="contact" className="w-full py-20 px-4 relative bg-gradient-to-b from-white to-[#f7f9fc] overflow-hidden">
      <div className={`${styles.contact_image} ${styles.contact_image_left}`} />
      <div
        className={`${styles.contact_image} ${styles.contact_image_right}`}
      />

      <h2 className="text-center mb-2 text-3xl font-bold text-gray-900">
        Liên hệ với chúng tôi
      </h2>
      <p className="text-center mb-6 text-gray-700">
        Hãy để lại thông tin, chúng tôi sẽ phản hồi bạn trong thời gian sớm
        nhất.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-lg mx-auto text-black"
      >
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-gray-800 mb-2 block"
          >
            Email liên hệ
          </label>
          <input
            type="email"
            id="email"
            value={email}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="example@email.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="content"
            className="text-sm font-semibold text-gray-800 mb-2 block"
          >
            Nội dung liên hệ
          </label>
          <textarea
            id="content"
            value={content}
            className="w-full min-h-[140px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập nội dung liên hệ..."
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="
            mt-[10px]
            p-[14px]
            text-[16px]
            font-semibold
            rounded-full
            border-0
            cursor-pointer
            text-white
            bg-gradient-to-br from-[#267026] to-[#4bd430]
            shadow-[0_12px_30px_rgba(75,212,48,0.35)]
            transition-all duration-300 ease-in-out
            hover:-translate-y-[2px]
            hover:shadow-[0_18px_40px_rgba(75,212,48,0.45)]
          "
        >
          Gửi liên hệ
        </button>
      </form>
    </div>
  );
}
