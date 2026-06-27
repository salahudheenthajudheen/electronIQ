import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function GlassTube() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshPhysicalMaterial).opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.3) * 0.03
    }
  })
  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.35, 2.4, 16, 32]} />
        <meshPhysicalMaterial
          color="#446688" transmission={0.7} roughness={0.08} metalness={0.15}
          transparent opacity={0.35} ior={1.5} envMapIntensity={0.6}
          clearcoat={0.2} side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.05, 32]} />
        <meshPhysicalMaterial color="#557799" transmission={0.7} roughness={0.08} transparent opacity={0.4} ior={1.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.05, 32]} />
        <meshPhysicalMaterial color="#557799" transmission={0.7} roughness={0.08} transparent opacity={0.4} ior={1.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 2.5, 32]} />
        <meshPhysicalMaterial color="#557799" transmission={0.7} roughness={0.08} transparent opacity={0.2} ior={1.5} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.CapsuleGeometry(0.35, 2.4, 16, 32)]} />
        <lineBasicMaterial color="#334466" transparent opacity={0.25} />
      </lineSegments>
    </group>
  )
}

function CathodeGlow() {
  const glowRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const intensity = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.15
      ;(glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.3
    }
  })
  return (
    <group position={[-1.4, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial color="#444455" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.03, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.12, 0.08, 12]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 0, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff8844" emissive="#ff6600" emissiveIntensity={2} />
      </mesh>
      <mesh ref={glowRef} position={[0.06, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ff8844" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function Anode() {
  return (
    <group position={[1.4, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.15, 0.03, 12, 24]} />
        <meshStandardMaterial color="#777788" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.02, 0, 0]}>
        <ringGeometry args={[0.05, 0.15, 24]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.04, 0.005, 8, 16]} />
        <meshStandardMaterial color="#444455" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

function ElectronBeam({ voltage, magField, elecField, pressure }: {
  voltage: string; magField: boolean; elecField: boolean; pressure: string
}) {
  const count = 300
  const speed = voltage === 'high' ? 1.2 : voltage === 'medium' ? 0.7 : 0.35
  const scatter = pressure === 'high' ? 0.6 : pressure === 'medium' ? 0.25 : 0.06
  const trailLen = voltage === 'high' ? 8 : voltage === 'medium' ? 5 : 3
  const ref = useRef<THREE.Points>(null)
  const trailRef = useRef<THREE.Points>(null)
  const particleData = useRef(Array.from({ length: count }, () => ({
    t: Math.random(), yOff: (Math.random() - 0.5) * 0.2, zOff: (Math.random() - 0.5) * 0.2,
    speedOff: 0.8 + Math.random() * 0.4,
  })))

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(count), 1))
    return geo
  }, [count])

  const trailGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * trailLen * 3), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * trailLen * 3), 3))
    geo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(count * trailLen), 1))
    return geo
  }, [count, trailLen])

  useFrame((_, delta) => {
    if (!ref.current || !trailRef.current) return
    const pos = geometry.attributes.position.array as Float32Array
    const col = geometry.attributes.color.array as Float32Array
    const sizes = geometry.attributes.size.array as Float32Array
    const tPos = trailGeo.attributes.position.array as Float32Array
    const tCol = trailGeo.attributes.color.array as Float32Array
    const tSizes = trailGeo.attributes.size.array as Float32Array

    for (let i = 0; i < count; i++) {
      const d = particleData.current[i]
      d.t += delta * speed * d.speedOff
      if (d.t > 1) d.t = 0

      const x = -1.35 + d.t * 2.7
      const tFactor = Math.sin(d.t * Math.PI)
      let y = d.yOff * (1 + scatter * 3) + (magField ? Math.sin(d.t * Math.PI * 3) * 0.35 * tFactor : 0)
      let z = d.zOff * (1 + scatter * 3) + (elecField ? Math.sin(d.t * Math.PI * 3) * 0.35 * tFactor : 0)

      if (magField && elecField) {
        y += Math.cos(d.t * Math.PI * 2) * 0.15 * tFactor
        z += Math.sin(d.t * Math.PI * 2) * 0.15 * tFactor
      }

      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z
      const brightness = 0.3 + d.t * 0.7
      col[i * 3] = brightness * 0.2; col[i * 3 + 1] = brightness * 0.6; col[i * 3 + 2] = brightness
      sizes[i] = 0.04 + d.t * 0.03

      for (let t = 0; t < trailLen; t++) {
        const ti = (i * trailLen + t) * 3
        const trailT = d.t - (t / trailLen) * delta * speed * 3
        const tt = Math.max(0, trailT)
        const tx = -1.35 + tt * 2.7
        const tFactor2 = Math.sin(tt * Math.PI)
        let ty = d.yOff * (1 + scatter * 3) + (magField ? Math.sin(tt * Math.PI * 3) * 0.35 * tFactor2 : 0)
        let tz = d.zOff * (1 + scatter * 3) + (elecField ? Math.sin(tt * Math.PI * 3) * 0.35 * tFactor2 : 0)
        if (magField && elecField) { ty += Math.cos(tt * Math.PI * 2) * 0.15 * tFactor2; tz += Math.sin(tt * Math.PI * 2) * 0.15 * tFactor2 }
        tPos[ti] = tx; tPos[ti + 1] = ty; tPos[ti + 2] = tz
        const alpha = 1 - t / trailLen
        tCol[ti] = alpha * 0.15; tCol[ti + 1] = alpha * 0.5; tCol[ti + 2] = alpha
        tSizes[i * trailLen + t] = (0.02 + tt * 0.02) * alpha
      }
    }
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    geometry.attributes.size.needsUpdate = true
    trailGeo.attributes.position.needsUpdate = true
    trailGeo.attributes.color.needsUpdate = true
    trailGeo.attributes.size.needsUpdate = true
  })

  const opacity = pressure === 'high' ? 0.4 : pressure === 'medium' ? 0.7 : 1
  return (
    <group>
      <points ref={trailRef} geometry={trailGeo}>
        <pointsMaterial size={0.02} vertexColors transparent opacity={opacity * 0.3} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points ref={ref} geometry={geometry}>
        <pointsMaterial size={0.05} vertexColors transparent opacity={opacity} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}

function Screen({ voltage }: { voltage: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const intensity = voltage === 'high' ? 2.5 : voltage === 'medium' ? 1.2 : 0.4
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 0.95 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05
      ;(meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity * pulse
    }
  })
  return (
    <group position={[1.55, 0, 0]}>
      <mesh>
        <planeGeometry args={[0.15, 0.4]} />
        <meshStandardMaterial color="#112233" />
      </mesh>
      <mesh ref={meshRef} position={[0.01, 0, 0]}>
        <planeGeometry args={[0.12, 0.35]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={intensity} />
      </mesh>
      <mesh position={[0.015, 0, 0]}>
        <planeGeometry args={[0.12, 0.35]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={intensity * 0.15} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0.02, -0.15 + i * 0.075, 0]}>
          <planeGeometry args={[0.1, 0.002]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.03 + intensity * 0.02} />
        </mesh>
      ))}
    </group>
  )
}

function MagneticFieldLines() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.05
  })
  const arcs = useMemo(() => {
    const result: THREE.Vector3[][] = []
    for (let i = -3; i <= 3; i++) {
      const pts: THREE.Vector3[] = []
      for (let t = 0; t <= 1; t += 0.02) {
        const angle = t * Math.PI
        pts.push(new THREE.Vector3(i * 0.15, Math.sin(angle) * 0.3, Math.cos(angle) * 0.3))
      }
      result.push(pts)
    }
    return result
  }, [])

  const lines = useMemo(() => arcs.map(pts => {
    const g = new THREE.BufferGeometry()
    g.setFromPoints(pts)
    return g
  }), [arcs])

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {lines.map((geo, i) => (
        <lineSegments key={i} geometry={geo}>
          <lineBasicMaterial color="#4488ff" transparent opacity={0.2} />
        </lineSegments>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function ElectricFieldPlates() {
  return (
    <group position={[0.1, 0, 0]}>
      <mesh position={[0, 0.35, 0]}>
        <planeGeometry args={[1.2, 0.04]} />
        <meshStandardMaterial color="#ff8844" emissive="#ff6600" emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <planeGeometry args={[1.2, 0.04]} />
        <meshStandardMaterial color="#ff8844" emissive="#ff6600" emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.5 + i * 0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.6, 0.01]} />
          <meshBasicMaterial color="#ff8844" transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  )
}

function ConnectorPins() {
  return (
    <group>
      <mesh position={[-1.4, -0.3, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
        <meshStandardMaterial color="#555566" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[1.55, -0.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
        <meshStandardMaterial color="#555566" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

function GridFloor() {
  return (
    <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 4]} />
      <meshStandardMaterial color="#e8ecf1" />
    </mesh>
  )
}

export default function CRTScene({ voltage, pressure, magField, elecField }: {
  voltage: string; pressure: string; magField: boolean; elecField: boolean
}) {
  return (
    <div className="w-full h-[520px] rounded-xl overflow-hidden relative bg-white">
      <Canvas camera={{ position: [0, 1.2, 3.5], fov: 35 }}>
        <color attach="background" args={['#f0f2f5']} />
        <fog attach="fog" args={['#f0f2f5', 6, 10]} />
        <ambientLight intensity={1.0} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} />
        <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#5588cc" />
        <directionalLight position={[0, -1, 3]} intensity={0.5} color="#88aadd" />
        <pointLight position={[1.5, 1, 1]} intensity={0.6} color="#00cc66" />
        <pointLight position={[-1.5, -0.5, 1]} intensity={0.4} color="#dd7722" />
        <pointLight position={[0, 2, 0]} intensity={0.2} color="#ffffff" />
        <GridFloor />
        <ConnectorPins />
        <GlassTube />
        <CathodeGlow />
        <Anode />
        <ElectronBeam voltage={voltage} magField={magField} elecField={elecField} pressure={pressure} />
        <Screen voltage={voltage} />
        {magField && <MagneticFieldLines />}
        {elecField && <ElectricFieldPlates />}
      </Canvas>
      <div className="absolute bottom-3 left-3 flex gap-2">
        {magField && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">B-field ON</span>}
        {elecField && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">E-field ON</span>}
      </div>
      <div className="absolute bottom-3 right-3 text-[10px] text-text-muted">
        {voltage.toUpperCase()} • {pressure.toUpperCase()} PRESSURE
      </div>
    </div>
  )
}
