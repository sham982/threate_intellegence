export const COLORS = {
  tabBar: {
    background: '#2D3E4E',
    text: '#F2EBE5',
    active: '#8CBDB9',
  },
  dashboardCard: {
    background: '#FFFFFF',
    title: '#2D3E4E',
    text: '#647295',
    accentBorder: '#8CBDB9',
  },
  threatRisk: {
    high: '#EF4444',
    medium: '#F59E0B',
    safe: '#22C55E',
  },
};

export const getRiskBadgeColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'malicious':
    case 'high':
      return `bg-[${COLORS.threatRisk.high}]/20 text-[${COLORS.threatRisk.high}]`;
    case 'suspicious':
    case 'medium':
      return `bg-[${COLORS.threatRisk.medium}]/20 text-[${COLORS.threatRisk.medium}]`;
    case 'safe':
      return `bg-[${COLORS.threatRisk.safe}]/20 text-[${COLORS.threatRisk.safe}]`;
    default:
      return '';
  }
};

export const getRiskColorHex = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'malicious':
    case 'high':
      return COLORS.threatRisk.high;
    case 'suspicious':
    case 'medium':
      return COLORS.threatRisk.medium;
    case 'safe':
      return COLORS.threatRisk.safe;
    default:
      return COLORS.dashboardCard.text;
  }
};
