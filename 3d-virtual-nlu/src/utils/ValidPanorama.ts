export const isValidAspectRatio = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const ratio = img.width / img.height;
        resolve(Math.abs(ratio - 2) < 0.01);
      };
    };

    reader.readAsDataURL(file);
  });
};
