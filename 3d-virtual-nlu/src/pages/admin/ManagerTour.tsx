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

interface ControlsProps {
  enableZoom?: boolean;
}

const Controls: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      autoRotate={true}
      autoRotateSpeed={0.5}
    />
  );
};

interface DomeProps {
  panoramaURL: string;
}

const Dome: React.FC<DomeProps> = ({ panoramaURL }) => {
  const texture = useMemo(
    () => new THREE.TextureLoader().load(panoramaURL),
    [panoramaURL]
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;

  return (
    <mesh>
      <sphereGeometry args={[100, 128, 128]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

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
  const filteredNodes = nodes.filter((node) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className={styles.listTour}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            gap: "3.5%",
            marginLeft: "20px",
          }}
        >
          {filteredNodes.map((node) => (
            <NodeItem
              key={node.id}
              {...node}
              id={node.id}
              userId={node.userId}
              status={node.status}
              name={node.name}
              fieldName={node.fieldName}
              spaceName={node.spaceName}
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
