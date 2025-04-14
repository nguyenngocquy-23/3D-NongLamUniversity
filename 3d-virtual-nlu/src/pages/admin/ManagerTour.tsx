import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import styles from "../../styles/managerTour.module.css";
import stylesBar from "../../styles/common/navigateBar.module.css";
import stylesUser from "../../styles/user.module.css";
import * as THREE from "three";
import {
  FaAngleDown,
  FaAngleLeft,
  FaAngleUp,
  FaBackward,
} from "react-icons/fa6";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setPanoramaUrl,
  setSpaceId,
} from "../../redux/slices/PanoramaSlice.tsx";
import { AppDispatch, RootState } from "../../redux/Store.tsx";
import { fetchFields } from "../../redux/slices/DataSlice.tsx";
import axios from "axios";
import Swal from "sweetalert2";
import { NodeItem } from "../../components/admin/NodeItem.tsx";

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

  const spaces = useSelector((state: RootState) => state.data.spaces);

  // Chon space
  const handleSelectSpace = () => {
    navigate("/admin/updateTour");
  };

  return (
    <div className={stylesUser.container}>
      <div>
        <FaAngleLeft />
        <h2 className={stylesBar.h2}>Danh sách tour</h2>
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
        <div style={{ display: "flex", flexWrap: 'wrap', justifyContent: "flex-start", gap: '3.5%', marginLeft:'20px' }}>
          <NodeItem onclick={handleSelectSpace}/>
          <NodeItem onclick={handleSelectSpace} />
          <NodeItem onclick={handleSelectSpace} />
          <NodeItem onclick={handleSelectSpace} />
        </div>
      </div>
    </div>
  );
};

export default ManageNode;
