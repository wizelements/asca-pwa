/** Current ASCA officers. Update here when the board changes. */

export interface Officer {
  name: string;
  title: string;
  founding?: boolean;
}

export const OFFICERS: Officer[] = [
  { name: 'Jadon Relaford', title: 'President', founding: true },
  { name: 'Deja Shelton', title: 'Vice President' },
  { name: 'Nicole McNeil', title: 'Treasurer' },
  { name: 'Bonita Hartage', title: 'Secretary' },
  { name: 'Terrell Brown', title: 'Member Services Chair' },
  { name: 'Rebecca Lord', title: 'Senior Delegate', founding: true },
  { name: 'Randall Atchison', title: 'Senior Delegate', founding: true },
];
