import { type ComponentType } from 'react'
import RutherfordScattering from './RutherfordScattering'
import BohrModel from './BohrModel'
import ShellBuilder from './ShellBuilder'
import DeBroglieSim from './DeBroglieSim'
import UncertaintySim from './UncertaintySim'
import OrbitalExplorer from './OrbitalExplorer'
import OrbitalShapes from './OrbitalShapes'
import ElectronFillingLab from './ElectronFillingLab'
import ConfigBuilder from './ConfigBuilder'
import IsotopeBuilder from './IsotopeBuilder'
import PhotoelectricEffect from './PhotoelectricEffect'

export const simulationRegistry: Record<string, ComponentType> = {
  '2-3': RutherfordScattering,
  '3-3': IsotopeBuilder,
  '4-3': PhotoelectricEffect,
  '5-3': BohrModel,
  '6-3': ShellBuilder,
  '7-3': DeBroglieSim,
  '8-3': UncertaintySim,
  '9-3': OrbitalExplorer,
  '10-3': OrbitalShapes,
  '11-3': ElectronFillingLab,
  '12-3': ConfigBuilder,
}

export function getSimulation(moduleId: number, phaseNum: number): ComponentType | null {
  return simulationRegistry[`${moduleId}-${phaseNum}`] || null
}
