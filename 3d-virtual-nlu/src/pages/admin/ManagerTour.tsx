import React, { useRef, useState, useMemo } from "react";
import styles from "../../styles/managerTour.module.css";
import stylesBar from "../../styles/common/navigateBar.module.css";
import stylesUser from "../../styles/user.module.css";
import * as THREE from "three";
import { FaAngleDown, FaAngleLeft, FaAngleUp } from "react-icons/fa6";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store.tsx";
import { NodeItem } from "../../components/admin/NodeItem.tsx";
import SearchBar from "../../features/SearchBar.tsx";

const ManageNode: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [panoramaURL, setPanoramaURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectSpace, setSelectSpace] = useState("");
  const [listSpace, setListSpace] = useState<{ id: number; name: string }[]>(
    []
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isToggle, setIsToggle] = useState(false);

  const fields = useSelector((state: RootState) => state.data.fields);
  const spaces = useSelector((state: RootState) => state.data.spaces);

  const toggleFeature = () => {
    setIsToggle((preState) => !preState);
  };

  const nodes = useSelector((state: RootState) => state.data.nodes);

  // Chon space
  const handleSelectNode = (node: any) => {
    navigate("/admin/updateTour", { state: node });
  };

  //search
  const [searchTerm, setSearchTerm] = useState("");
  const filteredNodes = nodes.filter(
    (node) => node.name.toLowerCase().includes(searchTerm.toLowerCase())
    //  ||
    //   node.spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //   node.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={stylesUser.container}>
      <div className={stylesBar.navigateBar}>
        <FaAngleLeft />
        <h2 className={stylesBar.h2}>Danh sách tour</h2>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tìm theo tên không gian..."
        />
      </div>
      <div className={styles.title} onClick={toggleFeature}>
        <b>Tên không gian</b>
        {isToggle ? (
          <FaAngleUp className={styles.iconDown} />
        ) : (
          <FaAngleDown className={styles.iconDown} />
        )}
      </div>
      <div className={styles.list_tour}>
        <div className={styles.list_tour_main}>
          {filteredNodes.map((node) => (
            <NodeItem
              key={node.id}
              {...node}
              id={node.id}
              userId={node.userId}
              status={node.status}
              name={node.name}
              fieldName={fields.find((f) => f.id == node.fieldId).name}
              spaceName={spaces.find((s) => s.id == node.spaceId).name}
              description={node.description}
              updatedAt={node.updatedAt}
              url={node.url}
              onclick={() => handleSelectNode(node)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageNode;
