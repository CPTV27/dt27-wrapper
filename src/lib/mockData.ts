export interface Entity {
  id: string;
  name: string;
  type: 'Venue' | 'Hotel' | 'Artist' | 'Restaurant' | 'Development';
  layer: 'Foundation' | 'Network' | 'Machine' | 'Business';
  status: 'Active' | 'In Progress' | 'Planned' | 'Gap';
  roi: string;
  buildStatus: number; // 0-100
}

export interface Gap {
  id: string;
  entityId: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  owner: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

export const entities: Entity[] = [
  { id: '1', name: 'Big Muddy Inn', type: 'Hotel', layer: 'Business', status: 'Active', roi: '12%', buildStatus: 100 },
  { id: '2', name: 'Soul Kitchen', type: 'Restaurant', layer: 'Business', status: 'Active', roi: '8%', buildStatus: 100 },
  { id: '3', name: 'Ari Aslin', type: 'Artist', layer: 'Network', status: 'Active', roi: 'N/A', buildStatus: 85 },
  { id: '4', name: 'Hospitality Ent. Group', type: 'Venue', layer: 'Machine', status: 'Active', roi: '15%', buildStatus: 90 },
  { id: '5', name: 'Arkansas Development', type: 'Development', layer: 'Foundation', status: 'Planned', roi: 'TBD', buildStatus: 10 },
  { id: '6', name: 'Booking Engine', type: 'Development', layer: 'Machine', status: 'In Progress', roi: 'N/A', buildStatus: 60 },
  { id: '7', name: 'Social Media Strategy', type: 'Development', layer: 'Network', status: 'Gap', roi: 'N/A', buildStatus: 0 },
];

export const gaps: Gap[] = [
  { id: 'g1', entityId: '5', description: 'Missing architectural renderings', priority: 'High', owner: 'Chase', status: 'Open' },
  { id: 'g2', entityId: '7', description: 'No content calendar for Q3', priority: 'Medium', owner: 'Ari', status: 'Open' },
  { id: 'g3', entityId: '6', description: 'Stripe integration pending', priority: 'High', owner: 'Dev Team', status: 'In Progress' },
];

export const revenueData = [
  { month: 'Jan', revenue: 45000, projected: 50000 },
  { month: 'Feb', revenue: 48000, projected: 52000 },
  { month: 'Mar', revenue: 60000, projected: 65000 },
  { month: 'Apr', revenue: 55000, projected: 70000 },
  { month: 'May', revenue: 75000, projected: 80000 },
  { month: 'Jun', revenue: 82000, projected: 90000 },
];
