import * as XLSX from 'xlsx';
import { CheckHistory, ThreatReport } from './types';

export function exportToExcel(
  data: CheckHistory[] | ThreatReport | (CheckHistory | ThreatReport)[],
  fileName: string = 'threat-report.xlsx'
) {
  try {
    const workbook = XLSX.utils.book_new();

    if (Array.isArray(data)) {
      const historyData = data as CheckHistory[];
      const grouped = groupByType(historyData);

      Object.entries(grouped).forEach(([type, items]) => {
        const sheetData = items.map((item) => ({
          Query: item.query,
          Type: item.type,
          'Risk Level': item.riskLevel,
          'Risk Score': item.riskScore,
          'Date': new Date(item.timestamp).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, type.slice(0, 31));
      });
    } else {
      const report = data as ThreatReport;
      const summaryData = [
        {
          Key: 'Report Type',
          Value: report.type,
        },
        {
          Key: 'Query',
          Value: report.type === 'ip' ? report.ip : report.type === 'url' ? report.url : report.type === 'malware' ? report.file : report.indicator,
        },
        {
          Key: 'Risk Level',
          Value: report.riskLevel,
        },
        {
          Key: 'Risk Score',
          Value: report.riskScore,
        },
        {
          Key: 'Timestamp',
          Value: new Date(report.timestamp).toLocaleString(),
        },
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      if (report.results && report.results.length > 0) {
        const resultsData = report.results.map((result) => ({
          Source: result.source,
          Status: result.status,
          URL: result.url || 'N/A',
        }));

        const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
        XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Results');
      }
    }

    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

function groupByType(history: CheckHistory[]): Record<string, CheckHistory[]> {
  return history.reduce((acc, item) => {
    const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('-', ' ');
    if (!acc[typeLabel]) {
      acc[typeLabel] = [];
    }
    acc[typeLabel].push(item);
    return acc;
  }, {} as Record<string, CheckHistory[]>);
}
