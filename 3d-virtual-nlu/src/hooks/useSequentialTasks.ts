import { useState } from "react";

/**
 * openTaskIndex: Task đang được mở/đóng hiện tại
 * completedTaskIds: Xác định các task đã được hoàn tất
 * unlockedTaskIds: Xác định các task được mở cho phép người dùng click.
 * Ví dụ: người dùng vừa hoàn thành task có id : 1 thì:
 * - completedTaskIds [1]
 * - unlockedTaskIds [1,2]
 *
 */

export function useSequentialTasks(
  totalTasks: number,
  initialUnlockedId: number = 1
) {
  const [openTaskIndex, setOpenTaskIndex] = useState<number | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
  const [unlockedTaskIds, setUnlockedTaskIds] = useState<number[]>([
    1, 2, 3, 4,
  ]);

  const handleOpenTask = (id: number) => {
    setOpenTaskIndex((prev) => (prev === id ? null : id));
  };

  /**
   * Sử dụng nút "Lưu" để hoàn thành task.
   * @param id : task id mà chúng ta truyền vào.
   * Cơ chế lưu:
   * -> Đưa id của task đã complete vào mảng completedTaskIds.
   * -> Đồng thời, unlock cho task có id +1 vào mảng unlockedTaskIds.
   */
  const handleSaveTask = (id: number) => {
    if (!completedTaskIds.includes(id)) {
      setCompletedTaskIds((prev) => [...prev, id]);

      const nextId = id + 1;
      if (nextId <= totalTasks && !unlockedTaskIds.includes(nextId)) {
        setUnlockedTaskIds((prev) => [...prev, nextId]);
      }
    }
    setOpenTaskIndex(null);
  };

  /**
   * Reset lại quá trình nếu người dùng muốn quay lại mặc định.
   */

  const reset = () => {
    setOpenTaskIndex(null);
    setCompletedTaskIds([]);
    setUnlockedTaskIds([initialUnlockedId]);
  };

  return {
    openTaskIndex,
    completedTaskIds,
    unlockedTaskIds,
    handleOpenTask,
    handleSaveTask,
    reset,
  };
}
