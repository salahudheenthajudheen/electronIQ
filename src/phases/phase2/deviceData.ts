export const DEVICE_EXPLANATIONS: Record<string, { correct: string; explanation: string }> = {
  mobile: {
    correct: 'Signal carrier',
    explanation: 'Electrons in the mobile phone\'s circuits carry electrical signals that process and transmit data as electromagnetic waves.',
  },
  led: {
    correct: 'Display component',
    explanation: 'Electrons flow through the LED semiconductor material, releasing energy as photons to produce visible light on the display.',
  },
  crt_tv: {
    correct: 'Display component',
    explanation: 'A cathode ray tube fires a beam of electrons at a fluorescent screen, causing it to glow and create the image you see.',
  },
  xray: {
    correct: 'Energy source',
    explanation: 'High-speed electrons strike a metal target, converting their kinetic energy into X-ray photons used for medical imaging.',
  },
  battery: {
    correct: 'Energy source',
    explanation: 'Chemical reactions inside the battery release electrons, creating an electric current that powers connected devices.',
  },
  microscope: {
    correct: 'Display component',
    explanation: 'The electron microscope uses a beam of accelerated electrons instead of light to illuminate specimens and create highly magnified images.',
  },
}
