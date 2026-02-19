import { Entity, Gap } from '../lib/mockData';

// Mappers to convert raw sheet rows to application interfaces
// We assume some structure based on the user's description, but will be robust to missing data

export async function fetchEntities(spreadsheetId: string): Promise<Entity[]> {
  try {
    // Fetch Tour_Routing for Venues/Hotels
    const tourData = await fetch(`/api/sheets/${spreadsheetId}/Tour_Routing`).then(res => res.json());
    // Fetch The_Roster for Artists
    const rosterData = await fetch(`/api/sheets/${spreadsheetId}/The_Roster`).then(res => res.json());

    const entities: Entity[] = [];

    // Map Tour Data (assuming: Date, City, Venue, Capacity, Status...)
    if (Array.isArray(tourData) && tourData.length > 1) {
      tourData.slice(1).forEach((row, i) => {
        if (row[2]) { // Venue Name
          entities.push({
            id: `tour-${i}`,
            name: row[2],
            type: 'Venue',
            layer: 'Network',
            status: 'Active',
            roi: 'TBD',
            buildStatus: 100
          });
        }
      });
    }

    // Map Roster Data (assuming: Artist Name, Tier, Status...)
    if (Array.isArray(rosterData) && rosterData.length > 1) {
      rosterData.slice(1).forEach((row, i) => {
        if (row[0]) { // Artist Name
          entities.push({
            id: `artist-${i}`,
            name: row[0],
            type: 'Artist',
            layer: 'Machine',
            status: 'Active',
            roi: 'N/A',
            buildStatus: 90
          });
        }
      });
    }

    return entities;
  } catch (error) {
    console.error("Failed to fetch entities", error);
    return [];
  }
}

export async function fetchGaps(spreadsheetId: string): Promise<Gap[]> {
  // In a real scenario, we might have a Gaps tab. 
  // For now, we'll infer gaps or fetch from a specific tab if it existed.
  // We'll return an empty array or some inferred gaps for now to avoid breaking the UI
  // if the tab doesn't exist.
  return [];
}

export async function fetchRevenue(spreadsheetId: string) {
  // Fetch from Master Ledger if available, or mock for now as we don't have the specific tab structure
  return [
    { month: 'Jan', revenue: 45000, projected: 50000 },
    { month: 'Feb', revenue: 48000, projected: 52000 },
    { month: 'Mar', revenue: 60000, projected: 65000 },
  ];
}
