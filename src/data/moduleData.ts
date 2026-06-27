export type ActivityType =
  | 'text' | 'discussion' | 'poll' | 'table' | 'analogy' | 'concept-map'
  | 'quiz' | 'simulation' | 'project' | 'escape-room' | 'badge'
  | 'debate' | 'video' | 'think-pair-share' | 'qr-code'
  | 'peer-teaching' | 'h5p' | 'passport' | 'investigation' | 'mystery-cards'

export interface Activity {
  type: ActivityType
  title: string
  content?: string
  items?: string[]
  questions?: string[]
  tableData?: { headers: string[]; rows: string[][] }
  analogies?: { left: string; right: string }[]
  quizQuestions?: { question: string; options?: string[]; answer: string }[]
}

export interface PhaseData {
  phase: 1 | 2 | 3 | 4
  name: string
  objective: string
  activities: Activity[]
  consolidation: string[]
}

export interface ModuleData {
  id: number
  title: string
  shortTitle: string
  description: string
  color: string
  learningOutcomes: string[]
  scienceProcessSkills?: string[]
  scientificCreativity?: string[]
  phases: PhaseData[]
}

const M: ModuleData[] = [
  {
    // Module 1 - already built with custom interactive components
    // Minimal data here for dashboard display
    id: 1,
    title: 'Discovery of Electron',
    shortTitle: 'Discovery of Electron',
    description: 'Cathode ray discharge tube experiment, properties of cathode rays, discovery of the electron as a fundamental particle.',
    color: '#6C63FF',
    learningOutcomes: [
      'Describe the cathode ray discharge tube experiment',
      'Explain the discovery of electron',
      'State the characteristics of cathode rays',
      'Explain why electron is considered a fundamental particle',
    ],
    scienceProcessSkills: [
      'Formulate hypotheses regarding cathode ray behaviour',
      'Define electron operationally using experimental observations',
      'Control variables affecting cathode ray experiments',
      'Interpret data obtained from virtual experiments',
    ],
    scientificCreativity: [
      'Fluency by generating multiple explanations',
      'Flexibility by proposing different interpretations',
    ],
    phases: [],
  },
  {
    id: 2,
    title: "Thomson's & Rutherford's Atomic Models",
    shortTitle: 'Atomic Models',
    description: 'Thomson\'s atomic model, Rutherford\'s α-particle scattering experiment, limitations of both models.',
    color: '#00D4AA',
    learningOutcomes: [
      "Explain Thomson's atomic model",
      "Describe Rutherford's α-particle scattering experiment",
      "Explain Rutherford's atomic model",
      'Identify limitations of Thomson\'s and Rutherford\'s model',
      'Compare different atomic models based on experimental evidence',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Stimulate Curiosity and create a need to learn',
        activities: [
          { type: 'discussion', title: 'What is inside the atom?',
            content: 'If atoms are invisible, how did scientists discover what is inside them?',
            questions: ['What might be inside an atom?', 'How can we study something we cannot see?'] },
          { type: 'text', title: 'Atomic Model Mystery',
            content: 'Observe images of different atomic models without labels.',
            questions: ['Which model appears more realistic?', 'How might scientists have developed these models?', 'What evidence would be needed to support each model?'] },
        ],
        consolidation: ['Positive charge is uniformly distributed throughout the atom, then alpha particles should pass straight through.',
                       'Positive charge is concentrated in a small region, then some particles should be deflected.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Relate atomic models to real-world scientific investigations',
        activities: [
          { type: 'discussion', title: 'Why do Scientists change Models?',
            content: 'Examples: Maps changing over time, Mobile phone upgrades, Scientific theories evolving.',
            questions: ['Why do scientific models change over time?'] },
          { type: 'analogy', title: 'Human Analogy Activity',
            content: 'Compare atomic models to familiar objects.',
            analogies: [
              { left: "Thomson's Model", right: 'Watermelon, Plum pudding, Chocolate chip cookie' },
              { left: "Rutherford's Model", right: 'Solar System, Stadium with a tiny center stage, Planetary system' },
            ],
            questions: ['How does each analogy help understand the model?'] },
        ],
        consolidation: ["Thomson's Model: Electrons are embedded in a positively charged sphere.",
                       "Rutherford Model: Positive charge is concentrated in a tiny nucleus surrounded by electrons."],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Develop competence through guided inquiry and experimentation',
        activities: [
          { type: 'simulation', title: 'Rutherford Scattering Virtual Lab',
            content: 'Perform a virtual α-particle scattering experiment. Vary alpha particle speed (Low, Medium, High), foil thickness (Thin, Thick), and number of particles (100, 500). Observe the degree of scattering.',
            questions: ['What does this suggest about atomic structure?', 'Why do most particles pass through?'] },
          { type: 'table', title: 'Results Observation',
            content: 'Analyse the scattering results:',
            tableData: {
              headers: ['Observation', 'Percentage'],
              rows: [['Passed Straight', '98%'], ['Slightly deflected', '1.9%'], ['Strongly deflected', '0.1%']],
            },
            questions: ['What does the 98% straight passage suggest?', 'What does the 0.1% strong deflection indicate?'] },
        ],
        consolidation: ['Atom is mostly empty space.', 'Positive charge is concentrated in the nucleus.'],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Provide reinforcement, achievement and creative application',
        activities: [
          { type: 'debate', title: 'Atomic Model Debate',
            content: 'Group A: Defends Thomson\'s Model. Group B: Defends Rutherford Model. Use evidence to justify your position.',
            questions: ['Which model is better supported by experimental evidence?', 'What are the limitations of each model?'] },
          { type: 'badge', title: 'Atomic Detective Badge',
            content: 'Earn the 🏅 Atomic Detective Badge for completing the debate and demonstrating understanding of both models.' },
        ],
        consolidation: ['Both models have limitations. Thomson\'s Model could not explain scattering results and nuclear structure.',
                       'Rutherford Model failed to explain atomic stability, line spectra and electron arrangement.'],
      },
    ],
  },
  {
    id: 3,
    title: 'Atomic Number, Mass Number, Isotopes & Isobars',
    shortTitle: 'Isotopes & Isobars',
    description: 'Atomic number, mass number, isotopes and isobars, their significance, and numerical problems.',
    color: '#F59E0B',
    learningOutcomes: [
      'Define atomic number and mass number',
      'Differentiate isotopes and isobars',
      'Explain the significance of isotopes and isobars',
      'Solve numerical problems involving atomic structure',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Gain Interest and create a need to learn',
        activities: [
          { type: 'mystery-cards', title: 'Atomic Mystery Cards - Who am I?',
            content: 'Atomic Identity Challenge. Determine which atoms belong to the same element.',
            tableData: {
              headers: ['Cards', 'Protons', 'Neutrons'],
              rows: [['A', '6', '6'], ['B', '6', '8'], ['C', '8', '8'], ['D', '7', '7']],
            },
            questions: ['Which atoms belong to the same element?', 'Which are different?', 'What determines an atom\'s identity?'] },
          { type: 'poll', title: 'Moodle Digital Poll',
            content: 'If an atom gains two neutrons, does it become a new element?',
            questions: ['What would happen if atoms of the same element had different masses?'] },
        ],
        consolidation: ['If proton number remains constant, the element remains the same.', 'If neutron number changes, isotopes are formed.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Connect learning to real-life situations',
        activities: [
          { type: 'text', title: 'Isotopes around Us',
            content: 'Carbon-14 is used in Archaeology, Iodine-131 for Thyroid treatment, Uranium-235 in Nuclear Energy, Cobalt-60 for Cancer Therapy.' },
          { type: 'qr-code', title: 'QR Code Learning Stations',
            content: 'Scan QR codes linking to short videos on: Medical isotopes, Nuclear medicine, Carbon dating.' },
          { type: 'concept-map', title: 'Concept Mapping',
            content: 'Create a concept map connecting: Atomic Number → Element Identity, Mass Number → Total Particles, Isotopes → Same Element, Isobars → Same Mass Number.' },
        ],
        consolidation: ['Atomic Number: Number of protons in the nucleus.', 'Mass Number: Sum of protons and neutrons.',
                       'Isotopes: Same atomic number, different mass number.', 'Isobars: Same mass number, different atomic number.'],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Develop competence through experimentation and guided inquiry',
        activities: [
          { type: 'investigation', title: 'Digital Investigation',
            content: 'Problem: Can two atoms have the same mass number but belong to different elements?',
            tableData: {
              headers: ['Atom', 'Atomic Number', 'Mass Number'],
              rows: [['Ar', '18', '40'], ['Ca', '20', '40']],
            },
            questions: ['Are Argon and Calcium isotopes or isobars? Why?'] },
        ],
        consolidation: ['Isobars are atoms with same mass number but different atomic numbers.'],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Provide reinforcement and creative application',
        activities: [
          { type: 'project', title: 'Atomic Family Tree Project',
            content: 'Create a digital poster showing: Parent element, Isotopes, Isobars. Use PowerPoint, Canva, or Moodle Assignment.' },
        ],
        consolidation: [],
      },
    ],
  },
  {
    id: 4,
    title: "Planck's Quantum Theory & Photoelectric Effect",
    shortTitle: 'Quantum Theory',
    description: 'Limitations of classical wave theory, Planck\'s quantum theory, Einstein\'s photoelectric equation, factors affecting photoelectric effect.',
    color: '#FF6B9D',
    learningOutcomes: [
      'Explain the limitations of classical wave theory',
      "State Planck's Quantum Theory",
      'Calculate quantum energy using E = hν',
      "Explain Einstein's photoelectric equation",
      'Interpret factors affecting the photoelectric effect',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Create cognitive conflict and curiosity regarding the nature of light and energy',
        activities: [
          { type: 'h5p', title: 'Interactive H5P Activity',
            content: 'A bright red light shining continuously on a metal surface fails to eject electrons, but a dim ultraviolet light immediately ejects electrons.',
            questions: ['Which light carries more energy?', 'Why does the brighter light fail while the dimmer light succeeds?',
                       'If brightness represents more energy, why doesn\'t the brighter red light eject electrons?'] },
        ],
        consolidation: [],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Relate quantum theory to familiar experiences using meaningful analogies',
        activities: [
          { type: 'analogy', title: 'Staircase vs Ramp Analogy',
            content: 'Classical theory: Energy changes continuously like moving up a ramp. Planck: Energy changes in fixed packets like climbing stairs.',
            analogies: [
              { left: 'Staircase', right: 'Quantised Energy levels' },
              { left: 'Recharge Pack', right: 'Energy Quantum' },
              { left: 'Coin Collection', right: 'Discrete energy Packet' },
            ],
            questions: ['How does the staircase analogy help explain Planck\'s quantum theory?'] },
          { type: 'quiz', title: 'Drag-and-Drop Matching',
            content: 'Match daily life examples with quantum concepts.',
            quizQuestions: [
              { question: 'Staircase corresponds to:', options: ['Quantised Energy levels', 'Continuous Energy', 'Wave theory'], answer: 'Quantised Energy levels' },
              { question: 'Recharge Pack corresponds to:', options: ['Energy Quantum', 'Classical physics', 'Frequency'], answer: 'Energy Quantum' },
            ] },
        ],
        consolidation: ['Energy is emitted or absorbed only in fixed packets called Quanta.'],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Build learner confidence through progressively challenging tasks',
        activities: [
          { type: 'quiz', title: 'Moodle Quiz',
            content: 'Answer the following questions:',
            quizQuestions: [
              { question: 'Define Quantum', answer: 'Smallest discrete packet of energy' },
              { question: "State Planck's equation", answer: 'E = hν' },
              { question: 'Define Threshold Frequency', answer: 'Minimum frequency needed to eject electrons' },
            ] },
          { type: 'text', title: 'Numerical Exercise',
            content: 'Calculate Energy of radiation having frequency 6 × 10¹⁴ Hz using E = hν. (h = 6.626 × 10⁻³⁴ J·s)',
            questions: ['What is the energy of one quantum?'] },
        ],
        consolidation: ["Planck's Quantum Theory: Energy is emitted or absorbed discontinuously in small packets called Quanta.",
                       'E = hν, where E = Energy, h = Planck\'s Constant, ν = Frequency.',
                       'Threshold Frequency: Minimum frequency needed to eject electrons.'],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Provide immediate application of learned concepts in authentic contexts',
        activities: [
          { type: 'project', title: 'Design Challenge: Light into Electricity',
            content: 'Design a real-life application based on the photoelectric effect. Examples: Light sensors, Solar-powered classroom desk, Automatic greenhouse lighting, Smart traffic signal, Photoelectric attendance system. Submit diagrams, working principle, and explanation.',
            questions: ['How does your design use the photoelectric effect?', 'What materials would you need?'] },
          { type: 'badge', title: 'Quantum Innovator Badge',
            content: '🏅 Quantum Innovator badge awarded upon successful completion of Quiz and Design Challenge.' },
        ],
        consolidation: [],
      },
    ],
  },
  {
    id: 5,
    title: "Bohr's Atomic Model & Its Limitations",
    shortTitle: "Bohr's Model",
    description: "Bohr's atomic model, postulates, hydrogen spectrum, limitations of Bohr's model.",
    color: '#EC4899',
    learningOutcomes: [
      "Explain Bohr's atomic model",
      "State Bohr's postulates",
      'Explain hydrogen spectrum using Bohr\'s theory',
      "Identify limitations of Bohr's model",
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Arouse Inquiry and participation',
        activities: [
          { type: 'discussion', title: 'The Atomic Mystery',
            content: 'Statement A: Electrons continuously revolve around the nucleus. Statement B: Moving charged particles should continuously lose energy and fall into the nucleus.',
            questions: ['If both statements are true, why don\'t atoms collapse?'] },
          { type: 'text', title: 'Interactive Spectrum Demonstration',
            content: 'Observe the hydrogen emission spectrum — only specific coloured lines are produced.',
            questions: ['Why are only specific coloured lines produced?'] },
        ],
        consolidation: ["Rutherford's model cannot explain atomic stability.",
                       'Electrons move only in fixed orbits → atoms remain stable.',
                       'Electrons jump between energy levels → spectral lines appear.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Use Analogies and Present Worth',
        activities: [
          { type: 'analogy', title: 'Solar System Analogy',
            content: 'Compare the atom to the solar system.',
            analogies: [
              { left: 'Sun', right: 'Nucleus' },
              { left: 'Planets', right: 'Electrons' },
            ],
            questions: ['What are the similarities?', 'What are the differences?'] },
          { type: 'text', title: 'Neon Sign Investigation',
            content: 'View images of Neon signs, Fireworks and Sodium lamps.',
            questions: ['Why is understanding electron energy important in everyday life?'] },
        ],
        consolidation: ['Orbit: Fixed path with definite energy.', 'Ground state: Lowest energy state.',
                       'Excited state: Higher energy state after energy absorption.',
                       'Electron energy is used in LEDs, Lasers, Medical Instruments.'],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Construct self confidence and increasing difficulty level',
        activities: [
          { type: 'simulation', title: 'Guided Orbit Construction',
            content: 'Use a digital simulation to build the Bohr model of Hydrogen. Place the electron in different orbits and observe energy changes.' },
          { type: 'table', title: 'Data Interpretation Task',
            content: 'Analyse spectral data from hydrogen:',
            tableData: {
              headers: ['Transition', 'Wavelength (nm)'],
              rows: [['n=3→2', '656'], ['n=4→2', '486'], ['n=5→2', '434']],
            },
            questions: ['Which transition releases maximum energy?', 'Why do wavelengths differ?',
                       'If you were Bohr, what additional feature would you include in your model?'] },
        ],
        consolidation: ['Energy and wavelength are inversely related.',
                       'Students solve simple transition problems before complex spectral calculations.'],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Use Natural Consequences and Unexpected Rewards',
        activities: [
          { type: 'project', title: 'Atomic Model Design Challenge',
            content: 'Design Bohr Model 2.0. Requirements: Show nucleus, Show energy levels, Explain electron transition, Address one limitation.' },
          { type: 'debate', title: 'Scientific Debate',
            content: 'Topic: Was Bohr\'s model a success or a failure? Group A: Defend Bohr. Group B: Discuss limitations.',
            questions: ['Why did Bohr\'s model fail to explain multi-electron atoms?',
                       'What are the Stark Effect and Zeeman Effect?'] },
          { type: 'peer-teaching', title: 'Junior Quantum Tutors',
            content: 'Students who complete activities first become Junior Quantum Tutors and help classmates understand concepts.' },
          { type: 'badge', title: 'Quantum Explorer Badge',
            content: '🏅 Quantum Explorer Badge for outstanding performance.' },
        ],
        consolidation: ["Bohr's model failed to explain: Multi-electron Atoms (He, Li), Fine Spectral Lines, Zeeman Effect, Stark Effect."],
      },
    ],
  },
  {
    id: 6,
    title: 'Shells and Subshells',
    shortTitle: 'Shells & Subshells',
    description: 'Concept of shells and subshells, energy levels, maximum electron capacity, 2n² rule.',
    color: '#8B5CF6',
    learningOutcomes: [
      'Explain the concept of shells and subshells',
      'Differentiate shells and subshells',
      'Relate shell number to energy levels',
      'Identify subshells present in various shells',
      'Predict the maximum number of electrons in shells and subshells',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Arouse Inquiry and participation',
        activities: [
          { type: 'discussion', title: 'Apartment Mystery',
            content: 'Imagine a multi-storey apartment building with different floors and rooms.',
            questions: ['If electrons were people living in a building, how would they be arranged?'] },
          { type: 'table', title: 'Predict the Pattern',
            content: 'Observe the maximum electrons per shell:',
            tableData: {
              headers: ['Shell', 'Maximum Electrons'],
              rows: [['K', '2'], ['L', '8'], ['M', '18'], ['N', '32']],
            },
            questions: ['Why does each shell accommodate a different number of electrons?'] },
          { type: 'simulation', title: 'Interactive Visual Exploration',
            content: 'Observe a simulation of electron distribution in shells.' },
        ],
        consolidation: ['As shell number increases, electron capacity increases.',
                       'As energy level increases, distance from nucleus increases.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Goal Orientation, Motive matching',
        activities: [
          { type: 'analogy', title: 'Classroom Seating Analogy',
            content: 'Compare atomic shells with classroom seating.',
            analogies: [
              { left: 'Classroom', right: 'Atom' },
              { left: 'Rows', right: 'Shells' },
              { left: 'Seats', right: 'Subshells' },
              { left: 'Students', right: 'Electrons' },
            ],
            questions: ['Why do some rows contain more seats?'] },
          { type: 'think-pair-share', title: 'Concept Cartoon',
            content: 'Student A: All shells contain equal numbers of electrons. Student B: Outer shells can hold more electrons. Student C: The number depends on shell number.',
            questions: ['Who is correct? Justify your answer.'] },
        ],
        consolidation: ['Shells: Main energy level occupied by electrons.',
                       'Subshells: Division within a shell characterized by specific energy.',
                       'K (n=1), L (n=2), M (n=3), N (n=4)'],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Provide success opportunities',
        activities: [
          { type: 'simulation', title: 'Virtual Shell Builder Investigation',
            content: 'Use a simulation to construct atoms. Create Hydrogen and Carbon atoms. Record electron arrangement.',
            questions: ['How does electron arrangement change as atomic number increases?'] },
          { type: 'table', title: 'Investigation Table',
            tableData: {
              headers: ['Element', 'Shell Distribution'],
              rows: [['H', '1'], ['C', '2, 4']],
            } },
          { type: 'table', title: 'Data Interpretation',
            content: 'Analyse shell capacity data:',
            tableData: {
              headers: ['Shell', 'n value', 'Maximum electrons'],
              rows: [['K', '1', '2'], ['L', '2', '8'], ['M', '3', '18']],
            },
            questions: ['What trend do you observe?', 'How does shell number affect capacity?', 'Predict capacity of the fifth shell?'] },
        ],
        consolidation: ['Maximum electrons in a shell = 2n² (n = shell number).',
                       'Filling of electrons in higher energy levels takes place only after filling lower energy levels.',
                       'Maximum electrons in the outermost shell is 8.'],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Provide Natural Consequences and Positive Reinforcement',
        activities: [
          { type: 'escape-room', title: 'Escape Room - Electron Quest',
            content: 'Solve clues: "I am the shell that can hold 18 electrons. Who am I?" "I contain s, p and d subshells. Which shell am I?"' },
          { type: 'project', title: 'Atomic Architecture Challenge',
            content: 'Create "The Electron City". Shells represented as city zones, Subshells as buildings, Electrons as residents.' },
          { type: 'peer-teaching', title: 'Peer Teaching Gallery Walk',
            content: 'Groups display their models. Peers evaluate on: Accuracy, Creativity and Clarity.' },
        ],
        consolidation: [],
      },
    ],
  },
  {
    id: 7,
    title: 'Dual Nature of Matter & Light, de Broglie Relation',
    shortTitle: 'Dual Nature',
    description: 'Dual nature of light and matter, de Broglie equation, matter waves, significance.',
    color: '#06B6D4',
    learningOutcomes: [
      'Explain the dual nature of light',
      'Explain the dual nature of matter',
      'State and apply de Broglie equation',
      'Relate wavelength with momentum',
      'Explain the significance of matter waves',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Provide Surprise and Cognitive Conflict',
        activities: [
          { type: 'poll', title: 'Is Light a Wave or a Particle?',
            content: 'Statement A: Light behaves like a wave. Statement B: Light behaves like a stream of particles.',
            questions: ['Can both statements be correct simultaneously?'] },
          { type: 'video', title: 'Predict the Outcome',
            content: 'Watch videos of: Diffraction of light and Photoelectric effect.',
            questions: ['Is light acting as a wave or a particle in each case?'] },
        ],
        consolidation: ['If electrons possess momentum, they may also exhibit wave properties.',
                       'If matter behaves like waves, diffraction should be observable.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Use Goal Orientation, Real life application',
        activities: [
          { type: 'text', title: 'Technology Around Us',
            content: 'Explore how wave-particle duality is used in: Electron Microscope (Matter Waves), Solar Cells (Photoelectric effect), LASER (Photon emission), Medical Imaging (Wave-Particle interaction).' },
          { type: 'analogy', title: 'Everyday Analogies',
            content: 'Compare wave-particle duality with familiar concepts.',
            analogies: [
              { left: 'Person', right: 'Both teacher and parent' },
              { left: 'Water waves', right: 'Carrying floating balls' },
              { left: 'Football crowd', right: 'Creating a wave' },
            ] },
        ],
        consolidation: ['Photon: Discrete packet of energy.', 'Matter Wave: Wave associated with a moving particle.',
                       "de Broglie Wavelength: λ = h/p"],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Provide Guided Discovery and Self evaluation',
        activities: [
          { type: 'simulation', title: 'Virtual Matter Wave Investigation',
            content: 'Use an animation showing electron diffraction. Vary particle velocity and observe wavelength changes.',
            questions: ['What happens to wavelength when velocity increases?'] },
          { type: 'table', title: 'de Broglie Data Analysis',
            tableData: {
              headers: ['Particle', 'Velocity', 'Wavelength'],
              rows: [['Electron', 'High', 'Large'], ['Tennis ball', 'High', 'Extremely small']],
            },
            questions: ['Why are matter waves observable only for microscopic particles?',
                       'What relationship exists between momentum and wavelength?'] },
          { type: 'quiz', title: 'Guided Calculation Lab',
            content: 'Calculate de Broglie wavelengths using λ = h/mv. Problems progress from simple to complex.',
            quizQuestions: [
              { question: 'What is the de Broglie wavelength of an electron moving at 2 × 10⁶ m/s? (h = 6.626 × 10⁻³⁴, m = 9.1 × 10⁻³¹ kg)', answer: '3.64 × 10⁻¹⁰ m' },
            ] },
        ],
        consolidation: ['Wavelength decreases with increasing momentum.',
                       'Macroscopic objects have negligible wavelengths.'],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Use creative Application',
        activities: [
          { type: 'project', title: 'Design a Future Technology',
            content: 'Create a poster on Future Technologies Based on Matter Waves. Ideas: Quantum transportation, Ultra-powerful microscopes, Advanced communication systems.' },
          { type: 'debate', title: 'Scientific Debate',
            content: 'Topic: Which discovery changed science more: Photoelectric Effect or de Broglie Hypothesis? Teams defend their viewpoints using evidence.' },
        ],
        consolidation: [],
      },
    ],
  },
  {
    id: 8,
    title: 'Heisenberg Uncertainty Principle',
    shortTitle: 'Uncertainty Principle',
    description: 'Heisenberg\'s uncertainty principle, simultaneous measurement of position and momentum, probability in locating electrons.',
    color: '#F97316',
    learningOutcomes: [
      "State Heisenberg's Uncertainty Principle",
      'Explain why simultaneous measurement of position and momentum is impossible',
      'Relate uncertainty principle to atomic structure',
      "Explain the limitations of Bohr's model based on uncertainty principle",
      'Understand the concept of probability in locating electrons',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Provide inquiry arousal, Conflict and Contradiction',
        activities: [
          { type: 'text', title: 'Catch the Flying Ball',
            content: 'A soft ball is thrown across the classroom.',
            questions: ['Can you accurately determine its exact position and exact speed at the same instant?',
                       'Which is easier to determine: position or speed?'] },
          { type: 'discussion', title: 'The Impossible Detective',
            content: 'You are a detective tracking a speeding motorcycle at night.',
            questions: ['Can you know its exact location and exact speed at precisely the same moment?'] },
        ],
        consolidation: ['If electron position is measured precisely, momentum becomes uncertain.',
                       'If momentum is measured accurately, position becomes uncertain.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Use Goal Orientation, future usefulness',
        activities: [
          { type: 'text', title: 'Photography Challenge',
            content: 'Compare: Blurred moving car image vs Sharp stationary car image.',
            questions: ['Why does increasing accuracy of position often reduce information about motion?'] },
          { type: 'analogy', title: 'GPS Tracker Analogy',
            content: 'GPS location updates have accuracy limitations when tracking moving vehicles. Link this to uncertainty in electron measurements.' },
        ],
        consolidation: ['Position: Location of a particle at a given instant.',
                       'Momentum: Product of mass and velocity.',
                       'Uncertainty: Inability to simultaneously determine exact momentum and position.',
                       'Electron cloud: Region where electron is most likely found.'],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Provide Guided Discovery and Self evaluation',
        activities: [
          { type: 'table', title: 'Data Interpretation Task',
            content: 'Analyse the relationship between position and momentum accuracy:',
            tableData: {
              headers: ['Position Accuracy', 'Momentum Accuracy'],
              rows: [['High', 'Low'], ['Medium', 'Medium'], ['Low', 'High']],
            },
            questions: ['What trend do you observe?', 'Why does increasing position accuracy decrease momentum accuracy?', 'What conclusion can be drawn?'] },
          { type: 'simulation', title: 'Guided Experiment Simulation',
            content: 'Use a digital simulation involving virtual particles. Increase measurement precision and observe changes in uncertainty.',
            questions: ['What happens when you try to measure both position and momentum precisely?'] },
        ],
        consolidation: [],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Use positive reinforcement and creative Application',
        activities: [
          { type: 'escape-room', title: 'Escape Room - Quantum Detective',
            content: 'Solve clues: "The more accurately I know position, the less accurately I know ______." Answer: Momentum. "Δx · Δp ≥ h/4π" — Identify the principle.' },
          { type: 'project', title: 'Probability Cloud Art Project',
            content: 'Create a digital poster showing: Electron cloud, Probability regions, Uncertainty concept. Use Moodle Assignment or PowerPoint.' },
        ],
        consolidation: [],
      },
    ],
  },
  {
    id: 9,
    title: 'Concept of Orbitals and Quantum Numbers',
    shortTitle: 'Orbitals & Quantum Numbers',
    description: 'Atomic orbitals, differences between orbit and orbital, four quantum numbers, permissible quantum numbers.',
    color: '#14B8A6',
    learningOutcomes: [
      'Explain the concept of atomic orbitals',
      'Differentiate orbit and orbital',
      'Describe the significance of quantum numbers',
      'Identify the four quantum numbers associated with an electron',
      'Determine permissible quantum numbers for electrons in atoms',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Provide inquiry arousal, perceptual arousal and problem based challenge',
        activities: [
          { type: 'discussion', title: 'The Electron Address Mystery',
            content: 'Imagine you are a courier trying to locate a specific electron inside an atom. What information would you need to find its exact address?',
            questions: ['What "address" information would an electron need?'] },
          { type: 'text', title: 'Mystery Box Demonstration',
            content: 'A closed box contains a moving object. You cannot see inside but must predict where it is likely to be found.',
            questions: ['Can its exact path be known?', 'How does this relate to orbitals as probability regions?'] },
          { type: 'poll', title: 'Orbit or Orbital?',
            content: 'Statement A: Electrons move in fixed paths. Statement B: Electrons exist in regions of probability.',
            questions: ['Which statement is correct?'] },
        ],
        consolidation: ['If electron position is uncertain, electrons may occupy regions rather than fixed paths.',
                       'If orbitals represent probability, electron density should vary within the atom.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Use Goal Orientation, Familiarity',
        activities: [
          { type: 'analogy', title: 'The Apartment Analogy',
            content: 'Compare an atom to a multi-storey apartment.',
            analogies: [
              { left: 'Floor number', right: 'Principal Quantum Number (n)' },
              { left: 'Apartment type', right: 'Azimuthal Quantum Number (l)' },
              { left: 'Room number', right: 'Magnetic Quantum Number (m)' },
              { left: 'Resident Orientation', right: 'Spin Quantum Number (s)' },
            ] },
          { type: 'passport', title: 'Quantum Number Passport',
            content: 'Each electron must have: Principal Number (n), Subshell Identity (l), Orbital Position (m), Spin Direction (s). Complete passport entries.' },
        ],
        consolidation: ['Orbital: Region with highest probability of finding an electron.',
                       'Principal Quantum (n): Size and energy level, n = 1,2,3...',
                       'Azimuthal Quantum (l): Subshell shape, l = 0 to (n-1)',
                       'Magnetic Quantum (m): Orientation, m = -l to +l including 0',
                       'Spin Quantum (s): Electron spin direction, s = +1/2 and -1/2'],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Provide Scaffolded Success and Self regulation',
        activities: [
          { type: 'simulation', title: 'Virtual Orbital Explorer',
            content: 'Use a digital simulation to explore: s Orbital, p Orbital, Electron density Cloud. Observe size, shape, and orientation.' },
          { type: 'quiz', title: 'Quantum Number Investigation Lab',
            content: 'Given different electron addresses, determine size, shape, orbital, and spin.',
            quizQuestions: [
              { question: 'Electron A: n = 3, l = 1, m = 1, s = +1/2. What subshell?', options: ['3s', '3p', '3d'], answer: '3p' },
              { question: 'Electron B: n = 2, l = 0, m = 0, s = -1/2. What orbital?', options: ['2s', '2p', '1s'], answer: '2s' },
            ] },
        ],
        consolidation: [],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Use creative Application',
        activities: [
          { type: 'escape-room', title: 'Quantum Clue Challenge',
            content: 'Find the electron with: n = 2, l = 1, m = 0, s = -1/2. Teams locate the correct orbital position.' },
          { type: 'escape-room', title: 'Quantum Number Escape Room',
            content: 'Solve puzzles involving: n values, l values, Orbital identification, Electron Spin.' },
          { type: 'badge', title: 'Quantum Navigator Badge',
            content: '🏅 Quantum Navigator Badge for successful completion.' },
        ],
        consolidation: [],
      },
    ],
  },
  {
    id: 10,
    title: 'Shapes of s, p, d Orbitals',
    shortTitle: 'Orbital Shapes',
    description: 'Shapes of s, p, and d orbitals, differentiation based on shape and orientation, significance in electron distribution and bonding.',
    color: '#A855F7',
    learningOutcomes: [
      'Describe the shapes of s, p, and d orbitals',
      'Differentiate between orbitals based on shape and orientation',
      'Explain the significance of orbital shapes in electron distribution',
      'Relate orbital shapes to molecular structure and bonding',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Arousing curiosity through Visualization',
        activities: [
          { type: 'discussion', title: 'What Shape is an Electron Cloud?',
            content: 'Three unfamiliar 3D objects: Sphere, Dumbbell, Four-leaf clover.',
            questions: ['What could these shapes possibly represent inside an atom?'] },
          { type: 'think-pair-share', title: 'Think-Pair-Share',
            content: 'Why would nature create different electron cloud shapes instead of using only spheres?',
            questions: ['How might different shapes affect bonding?'] },
        ],
        consolidation: ['As electron energy increases, orbital shapes become more complex.',
                       'As orbitals differ in shape, they influence bonding differently.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Use Goal Orientation, Application oriented learning',
        activities: [
          { type: 'analogy', title: 'Orbital Shapes in Daily Life',
            analogies: [
              { left: 's Orbital', right: 'Football / ball' },
              { left: 'p Orbital', right: 'Dumbbell' },
              { left: 'd Orbital', right: 'Four-leaf clover' },
            ] },
          { type: 'text', title: 'Molecular World Connection',
            content: 'Explore Water Molecule, Methane molecule, Ammonia molecule.',
            questions: ['How might electron cloud shapes influence molecular shape?'] },
          { type: 'think-pair-share', title: 'Concept Cartoon',
            content: 'Student A: All orbitals are spherical. Student B: Only s orbitals are spherical. Student C: Orbital shape changes with energy.',
            questions: ['Who is scientifically correct?'] },
        ],
        consolidation: ['s Orbital: Spherical electron probability distribution.',
                       'p Orbital: Dumbbell-shaped electron probability distribution.',
                       'd Orbital: Cloverleaf-shaped electron probability distribution.',
                       'Orbital shape: Spatial distribution of electron probability.'],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Provide Guided discovery and Progressive success',
        activities: [
          { type: 'simulation', title: 'Virtual Orbital Laboratory',
            content: 'Explore 3D orbital simulations. Observe shape, orientation, and relative size for: s orbital, px, py, pz orbitals, and d orbitals.' },
          { type: 'table', title: 'Orbital Investigation',
            content: 'Compare orbital type with shape and orientation.',
            tableData: {
              headers: ['Orbital', 'Shape', 'Number of Orientations'],
              rows: [['s', 'Spherical', '1'], ['p', 'Dumbbell', '3'], ['d', 'Cloverleaf', '5']],
            },
            questions: ['How does orbital type affect shape?'] },
        ],
        consolidation: ['s Orbital: 1 orientation.', 'p Orbital: 3 orientations.', 'd Orbital: 5 orientations.'],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Use Natural consequences and Creative expression',
        activities: [
          { type: 'escape-room', title: 'Orbital Escape Room',
            content: 'Solve clues: "I am spherical and have only one orientation. Who am I?" → s orbital. "I have five orientations and resemble a cloverleaf." → d orbital.' },
          { type: 'project', title: 'Design an Orbital Theme Park',
            content: 'Create "Quantum Park". Sphere Dome → s orbital, Twin Tower Ride → p orbital, Clover Garden → d orbital. Explain scientific connections.',
            tableData: {
              headers: ['Attraction', 'Orbital'],
              rows: [['Sphere Dome', 's'], ['Twin Tower Ride', 'p'], ['Clover Garden', 'd']],
            } },
        ],
        consolidation: [],
      },
    ],
  },
  {
    id: 11,
    title: 'Aufbau Principle, Pauli Exclusion, Hund\'s Rule',
    shortTitle: 'Electron Filling Rules',
    description: 'Aufbau principle, Pauli exclusion principle, Hund\'s rule of maximum multiplicity, writing electronic configurations.',
    color: '#10B981',
    learningOutcomes: [
      'Explain Aufbau Principle',
      'State Pauli Exclusion Principle',
      "Explain Hund's Rule of Maximum Multiplicity",
      'Apply electron-filling rules in writing electronic configurations',
      'Predict electron arrangements in atoms',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Arousing curiosity and Gamification',
        activities: [
          { type: 'discussion', title: 'The Hotel Occupancy Puzzle',
            content: 'A hotel with several floors and rooms. If guests arrive one by one, which rooms will they occupy first?',
            questions: ['How does this relate to electron behavior while filling orbitals?'] },
          { type: 'text', title: 'The Electron Seating Game',
            content: 'Classroom chairs are arranged as orbitals. Students act as electrons.',
            questions: ['How should electrons occupy available seats?'] },
          { type: 'poll', title: 'Mystery Challenge',
            content: 'Carbon (6 electrons) - three possible electron arrangements shown.',
            questions: ['Which arrangement is most stable?'] },
        ],
        consolidation: ['Electrons occupy lower-energy orbitals first.',
                       'Electrons prefer separate orbitals before pairing.',
                       'No two electrons can possess identical quantum states.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Use Goal Orientation and Collaborative Learning',
        activities: [
          { type: 'analogy', title: 'Classroom Seating Analogy',
            analogies: [
              { left: 'Students', right: 'Electrons' },
              { left: 'Benches', right: 'Orbitals' },
              { left: 'Classroom', right: 'Subshell' },
              { left: 'School Building', right: 'Shell' },
            ],
            questions: ['How do seating rules resemble electron-filling rules?'] },
          { type: 'think-pair-share', title: 'Discovering the Rules',
            content: 'Groups receive cards describing situations. Situation 1: Lowest rooms occupied first → Aufbau Principle. Situation 2: Only two students per bench → Pauli Principle. Situation 3: Students occupy separate benches before sharing → Hund\'s Rule.',
            questions: ['Identify the corresponding atomic rule for each situation.'] },
        ],
        consolidation: ['Aufbau Principle: Electrons occupy lower-energy orbitals first.',
                       'Pauli Exclusion Principle: No two electrons have identical four quantum numbers.',
                       "Hund's Rule: Electrons occupy degenerate orbitals singly before pairing."],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Provide Guided practise, self-Assessment',
        activities: [
          { type: 'simulation', title: 'Virtual Electron Filling Lab',
            content: 'Use digital orbital-filling simulations. Fill electrons for: Hydrogen, Carbon, Nitrogen, Oxygen.',
            questions: ['How does electron arrangement change as atomic number increases?'] },
          { type: 'table', title: 'Data Interpretation Challenge',
            tableData: {
              headers: ['Element', 'Electron Configuration'],
              rows: [['H', '1s¹'], ['He', '1s²'], ['Li', '1s² 2s¹'], ['Be', '1s² 2s²'], ['B', '1s² 2s² 2p¹']],
            },
            questions: ['Which orbital fills first?', 'What pattern emerges?', 'How does Aufbau Principle explain this trend?'] },
          { type: 'quiz', title: 'Orbital Box Investigation',
            content: 'Complete orbital box diagrams. Example: Nitrogen (□ ↑ □ ↑ □ ↑)',
            quizQuestions: [
              { question: 'Why are electrons not paired in Nitrogen?', options: ["Hund's Rule", 'Pauli Principle', 'Aufbau Principle'], answer: "Hund's Rule" },
              { question: 'Which rule says no two electrons can have same four quantum numbers?', options: ['Pauli Exclusion', 'Aufbau', "Hund's"], answer: 'Pauli Exclusion' },
            ] },
        ],
        consolidation: [],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Use Natural consequences and Creative application',
        activities: [
          { type: 'escape-room', title: 'Electron Configuration Escape Room',
            content: 'Solve clues: "I am the rule that prevents identical electron addresses." → Pauli Exclusion Principle. "Electrons fill lower energy first" → Aufbau Principle.',
            quizQuestions: [
              { question: 'Which rule is: "Electrons occupy separate orbitals before pairing"?', options: ["Hund's", 'Pauli', 'Aufbau'], answer: "Hund's" },
            ] },
          { type: 'badge', title: 'Electron Configuration Master',
            content: 'Complete Moodle quizzes and earn 🏅 Electron Configuration Master badge.' },
        ],
        consolidation: [],
      },
    ],
  },
  {
    id: 12,
    title: 'Electronic Configuration - Stability of Half-filled & Fully Filled Orbitals',
    shortTitle: 'Electronic Configuration',
    description: 'Electronic configurations, half-filled and completely filled orbitals, exceptional configurations of Cr and Cu, exchange energy and stability.',
    color: '#E11D48',
    learningOutcomes: [
      'Write electronic configurations of atoms',
      'Explain the concept of half-filled and completely filled orbitals',
      'Justify the exceptional electronic configurations of chromium and copper',
      'Relate orbital symmetry and exchange energy to stability',
      'Predict stable electron arrangements',
    ],
    phases: [
      {
        phase: 1, name: 'Attention', objective: 'Arouse surprise and curiosity',
        activities: [
          { type: 'discussion', title: 'The Chromium Mystery',
            content: 'Expected: Cr = [Ar] 3d⁴ 4s². Actual: Cr = [Ar] 3d⁵ 4s¹.',
            questions: ['Why does chromium break the rule?'] },
          { type: 'table', title: 'Spot the Exception',
            tableData: {
              headers: ['Element', 'Expected', 'Actual'],
              rows: [['Cr', '3d⁴ 4s²', '3d⁵ 4s¹'], ['Cu', '3d⁹ 4s²', '3d¹⁰ 4s¹']],
            },
            questions: ['Why would an atom rearrange its electrons?'] },
        ],
        consolidation: ['Half-filled orbitals possess special stability.',
                       'Symmetrical electron distribution may reduce repulsion.',
                       'Electron rearrangement may lower energy.'],
      },
      {
        phase: 2, name: 'Relevance', objective: 'Use Utility value, Problem-centred Learning',
        activities: [
          { type: 'discussion', title: 'Team Formation Activity',
            content: 'Case A: One group overcrowded. Case B: Students evenly distributed.',
            questions: ['Which arrangement appears more stable and efficient?'] },
          { type: 'analogy', title: 'Stability in Nature',
            content: 'Identify examples of stability: Balanced wheel, Symmetrical building, Balanced sports team, Stable bridge structure. Connect symmetry to atomic stability.' },
        ],
        consolidation: ['Electronic Configuration: Distribution of electrons in orbitals.',
                       'Half-Filled Orbital: One electron in each orbital.',
                       'Fully Filled Orbital: Paired electrons in all orbitals.',
                       'Stability: Lower-energy arrangement of electrons.'],
      },
      {
        phase: 3, name: 'Confidence', objective: 'Provide Guided discovery, Self-monitoring',
        activities: [
          { type: 'simulation', title: 'Virtual Electronic Configuration Lab',
            content: 'Use orbital-filling simulations. Investigate: Nitrogen (half-filled p orbitals), Neon (completely filled shell), Chromium, Copper.',
            questions: ['Which arrangements appear more stable?'] },
          { type: 'text', title: 'Exchange Energy Investigation',
            content: 'Simplified model showing electron exchange possibilities. Compare d⁴ and d⁵ configurations.',
            questions: ['Why does d⁵ possess greater stability than d⁴?'] },
        ],
        consolidation: [],
      },
      {
        phase: 4, name: 'Satisfaction', objective: 'Use creative Application, Real world Transfer',
        activities: [
          { type: 'escape-room', title: 'Atomic Stability Escape Room',
            content: 'Solve clues: "I have five electrons occupying five d orbitals singly. Who am I?" → d⁵ Configuration. "Which element has configuration 3d¹⁰ 4s¹ instead of 3d⁹ 4s²?" → Copper.' },
          { type: 'badge', title: 'Stability Explorer',
            content: 'Complete Quiz and Simulation report. Earn 🏅 Stability Explorer badge.' },
        ],
        consolidation: [],
      },
    ],
  },
]

export const modulesData: ModuleData[] = M

export function getModule(id: number): ModuleData | undefined {
  return M.find(m => m.id === id)
}
