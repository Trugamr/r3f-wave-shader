import { Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { useRef } from 'react'

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {
    uColor: new THREE.Color('lightpink'),
    uTime: 0,
    uTexture: new THREE.Texture(),
  },
  // Vertex Shader
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float vWave;
    
    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d); 

    void main() {
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 1.5;
      float noiseAmp = 0.1;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float vWave;

    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;

    void main() {
      float wave = vWave * 0.1;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      float timeAmp = 2.0;

      // Color Only
      // gl_FragColor = vec4(sin(vUv.x + uTime) * uColor, 1.0);
      // gl_FragColor = vec4(sin(vUv.x + uTime), vUv.y, 1.0, 1.0);
      // Texture Only
      // gl_FragColor = vec4(texture, 1.0)
      // Texture + Color ?
      gl_FragColor = vec4(texture, 1.0) * vec4(sin(1.0 + uTime * timeAmp), 0.5, 1.0, 1.0);
    }
  `,
)

extend({ WaveShaderMaterial })

const Wave = () => {
  const ref = useRef<any>(null)

  const [image] = useLoader(THREE.TextureLoader, ['/galactic.jfif'])

  useFrame(({ clock }) => {
    ref.current.uTime = clock.getElapsedTime()
  })

  return (
    <mesh>
      <planeBufferGeometry args={[0.5, 0.5, 16, 16]} />
      {/* @ts-expect-error */}
      <waveShaderMaterial
        ref={ref}
        uColor="hotpink"
        uTexture={image}
        wireframe={false}
      />
    </mesh>
  )
}

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 0.6] }}>
      <Suspense fallback={null}>
        <Wave />
      </Suspense>
    </Canvas>
  )
}

const App = () => {
  return (
    <>
      <Scene />
      <h1 className="heading">Galactic Inference</h1>
    </>
  )
}

export default App
