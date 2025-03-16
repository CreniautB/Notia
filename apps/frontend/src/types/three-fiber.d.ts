import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: JSX.IntrinsicElements['mesh'];
      line: JSX.IntrinsicElements['line'];
      bufferGeometry: JSX.IntrinsicElements['bufferGeometry'];
      lineBasicMaterial: JSX.IntrinsicElements['lineBasicMaterial'];
      perspectiveCamera: JSX.IntrinsicElements['perspectiveCamera'];
      meshStandardMaterial: JSX.IntrinsicElements['meshStandardMaterial'];
      boxGeometry: JSX.IntrinsicElements['boxGeometry'];
      group: JSX.IntrinsicElements['group'];
      color: JSX.IntrinsicElements['color'];
      ambientLight: JSX.IntrinsicElements['ambientLight'];
      pointLight: JSX.IntrinsicElements['pointLight'];
      bufferAttribute: JSX.IntrinsicElements['bufferAttribute'];
    }
  }
}

declare module '@react-three/fiber' {
  type CanvasProps = React.ComponentProps<typeof Canvas>;
  type OrbitControlsProps = React.ComponentProps<typeof OrbitControls>;
  type TextProps = React.ComponentProps<typeof Text>;
  interface ThreeElements {
    mesh: React.ComponentProps<typeof Mesh>;
    line: React.ComponentProps<typeof Line>;
    bufferGeometry: React.ComponentProps<typeof BufferGeometry>;
    lineBasicMaterial: React.ComponentProps<typeof LineBasicMaterial>;
    perspectiveCamera: React.ComponentProps<typeof PerspectiveCamera>;
    meshStandardMaterial: React.ComponentProps<typeof MeshStandardMaterial>;
    boxGeometry: React.ComponentProps<typeof BoxGeometry>;
    group: React.ComponentProps<typeof Group>;
    color: React.ComponentProps<typeof Color>;
    ambientLight: React.ComponentProps<typeof AmbientLight>;
    pointLight: React.ComponentProps<typeof PointLight>;
    bufferAttribute: React.ComponentProps<typeof BufferAttribute>;
  }
}
