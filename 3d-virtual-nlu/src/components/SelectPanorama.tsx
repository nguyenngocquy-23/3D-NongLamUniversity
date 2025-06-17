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
    borderColor: state.isFocused ? "#007bff" : "#ccc",
    boxShadow: state.isFocused ? "0 0 0 1px #007bff" : "none",
    "&:hover": {
      borderColor: "#007bff",
    },
    padding: "2px 4px",
  }),

  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#007bff"
      : state.isFocused
      ? "#e6f0ff"
      : "#fff",
    color: state.isSelected ? "#fff" : "#333",
    cursor: "pointer",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#333",
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#dad3cc5c",
    color: "#000",
    border: "1px solid #ccc",
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

const customSingleValue = ({ data }: any) => (
  <div style={{ paddingLeft: 4 }}>{data.label}</div>
);

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
    />
  );
};

export default ImageSelect;
