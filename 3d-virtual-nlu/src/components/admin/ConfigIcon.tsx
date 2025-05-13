import React, { useState } from "react";
import ListIcon from "./ListIcon";

const ConfigIcon = () => {
  const [openListIcon, setOpenListIcon] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <label>Biểu tượng:</label>
      <div>
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button
              onClick={() => {
                setOpenListIcon(true);
              }}
            >
              Chọn biểu tượng
            </button>
            <div style={{ display: "flex" }}>
              <label>Màu:</label>
              <input type="color" name="" id="" />
            </div>
            <div style={{ display: "flex" }}>
              <label>Màu nền:</label>
              <input type="color" name="" id="" />
            </div>
          </div>
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "white",
            }}
          ></div>
        </div>
        <div style={{ display: "flex" }}>
          <label>Độ xoay:</label>
          <div>
            <div>
              <input type="range" name="rotateX" id="rotateX" />
              <span>50%</span>
            </div>
            <div>
              <input type="range" name="rotateX" id="rotateX" />
              <span>50%</span>
            </div>
            <div>
              <input type="range" name="rotateX" id="rotateX" />
              <span>50%</span>
            </div>
            <div>
              <input type="checkbox" id="floor" />
              <label htmlFor="floor">Nền</label>
            </div>
            <div>
              <input type="checkbox" id="wall" />
              <label htmlFor="wall">Tường</label>
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <label>Tiêu đề:</label>
          <div>
            <textarea name="" id=""></textarea>
          </div>
        </div>
      </div>
      {openListIcon ? <ListIcon/> : ""}
    </div>
  );
};

export default ConfigIcon;
