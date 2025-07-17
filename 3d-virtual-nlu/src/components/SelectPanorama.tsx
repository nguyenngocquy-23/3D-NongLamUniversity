import React from "react";
import Select, { MenuPlacement } from "react-select";

type OptionType = {
  value: string;
  label: string;
  imageUrl: string;
};

interface ImageSelectProps {
  options: OptionType[];
  onChange: (selected: OptionType | null) => void;
  placeholder?: string;
  value?: OptionType | null;
  menuPlacement?: MenuPlacement;
}

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "#dad3cc5c",
    borderColor: state.isFocused ? "#267026" : "#ccc",
    boxShadow: state.isFocused ? "0 0 0 1px #267026" : "none",
    "&:hover": {
      borderColor: "#267026",
    },
  }),

  // Item (Không hoạt động)
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#267026"
      : state.isFocused
      ? "#e6f0ff"
      : "#fff",
    color: state.isSelected ? "#267026" : "#333",
    cursor: "pointer",
  }),

  //Màu chữ khi chọn (Không hoạt động)
  singleValue: (base: any) => ({
    ...base,
    color: "#267026",
  }),

  menu: (base: any) => ({
    ...base,
    backgroundColor: "#dad3cc5c",
    color: "#000",
    border: "1px solid #ccc",
    width: "fitContent",
    maxHeight: "200px", // ✅ Giới hạn chiều cao
    overflowY: "auto",
  }),

  placeholder: (base: any) => ({
    ...base,
    color: "#999",
  }),
};

const customOption = ({ data, innerRef, innerProps }: any) => (
  <div
    ref={innerRef}
    {...innerProps}
    style={{
      display: "flex",
      alignItems: "center",
      padding: 10,
    }}
  >
    <img
      src={data.imageUrl}
      alt={data.label}
      style={{
        width: 32,
        height: 32,
        objectFit: "cover",
        marginRight: 10,
        borderRadius: 4,
      }}
    />
    <span>{data.label}</span>
  </div>
);

const customSingleValue = ({ data }: any) => <div>{data.label}</div>;

const ImageSelect: React.FC<ImageSelectProps> = ({
  options,
  onChange,
  placeholder = "Chọn mục...",
  value,
  menuPlacement,
}) => {
  return (
    <Select
      options={options}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      components={{ Option: customOption, SingleValue: customSingleValue }}
      styles={customStyles}
      menuPlacement={menuPlacement ?? "bottom"}
      isSearchable={false}
    />
  );
};

export default ImageSelect;
