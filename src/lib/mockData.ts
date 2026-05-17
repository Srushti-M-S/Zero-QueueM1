import { type Lab, type Terminal } from '../types';

export const MOCK_LABS: Lab[] = [
  {
    id: 'l1',
    institutionId: 'inst1',
    name: 'CS Advanced Lab',
    location: 'Engineering Block, 3rd Floor',
    capacity: 30,
    software: ['VS Code', 'Docker', 'Python 3.12', 'Unity'],
    operatingHours: '09:00 - 18:00',
    currentOccupancy: 22
  },
  {
    id: 'l2',
    institutionId: 'inst1',
    name: 'Graphics & Design Lab',
    location: 'Arts Wing, 1st Floor',
    capacity: 20,
    software: ['Adobe Creative Cloud', 'Figma Desktop', 'Blender'],
    operatingHours: '08:00 - 20:00',
    currentOccupancy: 5
  },
  {
    id: 'l3',
    institutionId: 'inst1',
    name: 'Open Research Center',
    location: 'Library, Ground Floor',
    capacity: 50,
    software: ['MATLAB', 'RStudio', 'LaTeX'],
    operatingHours: '24/7',
    currentOccupancy: 38
  }
];

export const MOCK_TERMINALS: Terminal[] = [
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `L1-T${i + 1}`,
    labId: 'l1',
    status: Math.random() > 0.6 ? 'occupied' : Math.random() > 0.8 ? 'booked' : 'available' as any,
    currentUserInitials: ['JD', 'AS', 'MK', 'LR'][Math.floor(Math.random() * 4)],
    software: ['VS Code', 'Python']
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `L2-T${i + 1}`,
    labId: 'l2',
    status: Math.random() > 0.8 ? 'occupied' : 'available' as any,
    currentUserInitials: ['SS', 'RK'][Math.floor(Math.random() * 2)],
    software: ['Adobe CC', 'Figma']
  })),
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `L3-T${i + 1}`,
    labId: 'l3',
    status: Math.random() > 0.5 ? 'occupied' : 'available' as any,
    currentUserInitials: ['AM', 'BT'][Math.floor(Math.random() * 2)],
    software: ['MATLAB', 'RStudio']
  }))
];
