import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export const NodeItem = () => {

    return(
        <div className="container">
            <Canvas camera={{fov:75, position:[0,0,1]}}>
                <OrbitControls

                />
            </Canvas>
            <div className="info">
            </div>
        </div>
    );
}