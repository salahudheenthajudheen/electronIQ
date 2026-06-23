import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function CRTTube() {
  return (
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 3, 32]} />
      <meshPhysicalMaterial
        color="#88ccff"
        transmission={0.9}
        roughness={0.05}
        metalness={0.1}
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

function Cathode() {
  return (
    <mesh position={[-1.5, 0, 0]}>
      <boxGeometry args={[0.1, 0.3, 0.3]} />
      <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
    </mesh>
  )
}

function Anode() {
  return (
    <mesh position={[1.5, 0, 0]}>
      <ringGeometry args={[0.1, 0.3, 32]} />
      <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
    </mesh>
  )
}

function ElectronBeam({ voltage, magField, elecField, pressure }: {
  voltage: string
  magField: boolean
  elecField: boolean
  pressure: string
}) {
  const ref = useRef<THREE.Points>(null)
  const count = 200

  const speed = voltage === 'high' ? 0.8 : voltage === 'medium' ? 0.5 : 0.25
  const scatter = pressure === 'high' ? 0.5 : pressure === 'medium' ? 0.25 : 0.08

  const particleData = useRef(
    Array.from({ length: count }, () => ({
      t: Math.random(),
      yOff: (Math.random() - 0.5) * 0.3,
      zOff: (Math.random() - 0.5) * 0.3,
    }))
  )

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [count])

  useFrame((_, delta) => {
    if (!ref.current) return
    const pos = geometry.attributes.position.array as Float32Array
    const col = geometry.attributes.color.array as Float32Array

    for (let i = 0; i < count; i++) {
      const d = particleData.current[i]
      d.t += delta * speed
      if (d.t > 1) d.t -= 1

      const x = -1.5 + d.t * 3.3
      let y = d.yOff * (1 + scatter * 3)
      let z = d.zOff * (1 + scatter * 3)

      if (magField) y += Math.sin(d.t * Math.PI * 4) * 0.25
      if (elecField) z += Math.sin(d.t * Math.PI * 4) * 0.25

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      col[i * 3] = 0.3 + d.t * 0.7
      col[i * 3 + 1] = 0.5 + d.t * 0.5
      col[i * 3 + 2] = 1.0 - d.t * 0.8
    }

    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
  })

  const opacity = pressure === 'high' ? 0.3 : pressure === 'medium' ? 0.6 : 1

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function Screen({ voltage }: { voltage: string }) {
  const intensity = voltage === 'high' ? 2 : voltage === 'medium' ? 1 : 0.3
  return (
    <mesh position={[1.8, 0, 0]}>
      <planeGeometry args={[0.4, 0.6]} />
      <meshStandardMaterial
        color="#00ff88"
        emissive="#00ff88"
        emissiveIntensity={intensity}
      />
    </mesh>
  )
}

function MagneticField({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <planeGeometry args={[1.5, 0.8]} />
      <meshStandardMaterial
        color="#4488ff"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function ElectricField({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[1.5, 0.6]} />
      <meshStandardMaterial
        color="#ff8844"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function CRTScene({ voltage, pressure, magField, elecField }: {
  voltage: string
  pressure: string
  magField: boolean
  elecField: boolean
}) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 2, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <CRTTube />
        <Cathode />
        <Anode />
        <ElectronBeam
          voltage={voltage}
          magField={magField}
          elecField={elecField}
          pressure={pressure}
        />
        <Screen voltage={voltage} />
        <MagneticField active={magField} />
        <ElectricField active={elecField} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  )
}
