import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CheckHistory, ThreatReport } from './types';

export async function exportToPDF(
  data: CheckHistory[] | ThreatReport | (CheckHistory | ThreatReport)[],
  fileName: string = 'threat-report.pdf'
) {
  try {
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.backgroundColor = 'white';
    element.style.color = '#2d3e4e';
    element.style.fontFamily = 'Arial, sans-serif';

    if (Array.isArray(data)) {
      element.innerHTML = generateHistoryHTML(data as CheckHistory[]);
    } else {
      element.innerHTML = generateReportHTML(data as ThreatReport);
    }

    document.body.appendChild(element);

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    document.body.removeChild(element);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

function generateHistoryHTML(history: CheckHistory[]): string {
  const grouped = groupByType(history);

  let html = '<h1 style="color: #2d3e4e; margin-bottom: 20px;">Threat Check History Report</h1>';
  html += `<p style="color: #647295; margin-bottom: 20px;">Generated on: ${new Date().toLocaleString()}</p>`;

  Object.entries(grouped).forEach(([type, items]) => {
    html += `<h2 style="color: #8cbdb9; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; font-size: 14px;">${type}</h2>`;
    html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
    html += '<thead><tr style="background-color: #f9fafb; border-bottom: 2px solid #8cbdb9;">';
    html += '<th style="padding: 10px; text-align: left; color: #2d3e4e; font-weight: bold;">Query</th>';
    html += '<th style="padding: 10px; text-align: left; color: #2d3e4e; font-weight: bold;">Risk Level</th>';
    html += '<th style="padding: 10px; text-align: left; color: #2d3e4e; font-weight: bold;">Risk Score</th>';
    html += '<th style="padding: 10px; text-align: left; color: #2d3e4e; font-weight: bold;">Date</th>';
    html += '</tr></thead><tbody>';

    items.forEach((item) => {
      const riskColor = getRiskColor(item.riskLevel);
      const date = new Date(item.timestamp).toLocaleString();
      html += `<tr style="border-bottom: 1px solid #e5e7eb;">`;
      html += `<td style="padding: 10px; color: #2d3e4e;">${escapeHTML(item.query)}</td>`;
      html += `<td style="padding: 10px;"><span style="background-color: ${riskColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${item.riskLevel.toUpperCase()}</span></td>`;
      html += `<td style="padding: 10px; color: #2d3e4e;">${item.riskScore}%</td>`;
      html += `<td style="padding: 10px; color: #647295;">${date}</td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
  });

  return html;
}

function generateReportHTML(report: ThreatReport): string {
  let html = '<h1 style="color: #2d3e4e; margin-bottom: 20px;">Threat Analysis Report</h1>';
  html += `<p style="color: #647295; margin-bottom: 20px;">Generated on: ${new Date().toLocaleString()}</p>`;

  const riskColor = getRiskColor(report.riskLevel);

  html += '<div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid ' + riskColor + '; margin-bottom: 20px;">';
  html += '<h2 style="color: #2d3e4e; margin: 0 0 10px 0;">Report Summary</h2>';
  html += `<p style="color: #647295; margin: 5px 0;"><strong>Type:</strong> ${report.type.toUpperCase()}</p>`;
  html += `<p style="color: #647295; margin: 5px 0;"><strong>Query:</strong> ${escapeHTML(report.type === 'ip' ? report.ip : report.type === 'url' ? report.url : report.type === 'malware' ? report.file : report.indicator)}</p>`;
  html += `<p style="color: #647295; margin: 5px 0;"><strong>Risk Level:</strong> <span style="background-color: ${riskColor}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;">${report.riskLevel.toUpperCase()}</span></p>`;
  html += `<p style="color: #647295; margin: 5px 0;"><strong>Risk Score:</strong> ${report.riskScore}%</p>`;
  html += '</div>';

  if (report.results && report.results.length > 0) {
    html += '<h2 style="color: #8cbdb9; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; font-size: 14px;">Intelligence Sources</h2>';
    html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
    html += '<thead><tr style="background-color: #f9fafb; border-bottom: 2px solid #8cbdb9;">';
    html += '<th style="padding: 10px; text-align: left; color: #2d3e4e; font-weight: bold;">Source</th>';
    html += '<th style="padding: 10px; text-align: left; color: #2d3e4e; font-weight: bold;">Status</th>';
    html += '</tr></thead><tbody>';

    report.results.forEach((result) => {
      const statusColor = result.status === 'success' ? '#22c55e' : result.status === 'error' ? '#ef4444' : '#f59e0b';
      html += `<tr style="border-bottom: 1px solid #e5e7eb;">`;
      html += `<td style="padding: 10px; color: #2d3e4e;">${escapeHTML(result.source)}</td>`;
      html += `<td style="padding: 10px;"><span style="background-color: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${result.status.toUpperCase()}</span></td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
  }

  return html;
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

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'malicious':
    case 'high':
      return '#ef4444';
    case 'suspicious':
    case 'medium':
      return '#f59e0b';
    case 'safe':
      return '#22c55e';
    default:
      return '#647295';
  }
}

function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
