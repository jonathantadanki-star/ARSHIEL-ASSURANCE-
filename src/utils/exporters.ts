import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { MANDATORY_DISCLAIMER_LINES } from '../data/seedCatalog';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface PdfReportPayload {
  title: string;
  subtitle: string;
  referenceNo: string;
  status: string;
  metadata: Array<[string, string]>;
  summaryText?: string;
  tableHeaders: string[];
  tableRows: string[][];
  filename: string;
}

export function exportReportToPdf(payload: PdfReportPayload) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Brand Header Band
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 29, 210, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ARSHIEL ASSURANCE', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Assessing Risks. Strengthening Compliance. Improving Performance.', 14, 19);
  doc.text(`Ref: ${payload.referenceNo}  |  Status: ${payload.status}`, 14, 25);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(payload.title, 14, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(payload.subtitle, 14, 46);

  // Metadata table
  autoTable(doc, {
    startY: 51,
    head: [['Attribute', 'Details']],
    body: payload.metadata,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 52 } },
    margin: { left: 14, right: 14 },
  });

  let currentY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 90;

  if (payload.summaryText) {
    currentY += 8;
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Executive Summary & Observations', 14, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const wrapped = doc.splitTextToSize(payload.summaryText.replace(/[#*`]/g, ''), 182);
    doc.text(wrapped.slice(0, 35), 14, currentY);
    currentY += Math.min(wrapped.length, 35) * 4 + 4;
  }

  if (payload.tableRows.length > 0) {
    autoTable(doc, {
      startY: Math.min(currentY + 4, 240),
      head: [payload.tableHeaders],
      body: payload.tableRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? currentY + 40;
  }

  // Mandatory Disclaimer Box on Final Page
  if (currentY > 225) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 10;
  }

  doc.setDrawColor(217, 119, 6);
  doc.setFillColor(255, 251, 235);
  doc.rect(14, currentY, 182, 46, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text('MANDATORY INDEPENDENCE & GOVERNANCE DISCLAIMER — ARSHIEL ASSURANCE', 17, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(120, 53, 15);
  const discLines = doc.splitTextToSize(MANDATORY_DISCLAIMER_LINES.join(' '), 176);
  doc.text(discLines, 17, currentY + 11.5);

  doc.save(payload.filename.endsWith('.pdf') ? payload.filename : `${payload.filename}.pdf`);
}

export function exportRowsToExcel(
  sheetName: string,
  rows: Record<string, unknown>[],
  filename: string
) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 30));

  const disclaimerWs = XLSX.utils.aoa_to_sheet([
    ['ARSHIEL ASSURANCE — MANDATORY GOVERNANCE DISCLAIMER'],
    ['Tagline: Assessing Risks. Strengthening Compliance. Improving Performance.'],
    [''],
    ...MANDATORY_DISCLAIMER_LINES.map((line) => [line]),
  ]);
  XLSX.utils.book_append_sheet(wb, disclaimerWs, 'Disclaimer');

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  triggerDownload(
    new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  );
}

export function exportRowsToCsv(rows: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const withNotice = `# ARSHIEL ASSURANCE — Independent Consultancy & Assessment Export (Not an Official Statutory Certificate)\n${csv}`;
  triggerDownload(
    new Blob([withNotice], { type: 'text/csv;charset=utf-8;' }),
    filename.endsWith('.csv') ? filename : `${filename}.csv`
  );
}

export async function exportDocumentToDocx(options: {
  title: string;
  docNumber: string;
  revision: string;
  status: string;
  metadata: Array<[string, string]>;
  bodyText: string;
  filename: string;
}) {
  const bodyParagraphs = options.bodyText.split('\n').map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      return new Paragraph({
        text: trimmed.replace(/^###\s+/, ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
      });
    }
    if (trimmed.startsWith('## ')) {
      return new Paragraph({
        text: trimmed.replace(/^##\s+/, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
      });
    }
    if (trimmed.startsWith('# ')) {
      return new Paragraph({
        text: trimmed.replace(/^#\s+/, ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 280, after: 120 },
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: trimmed.replace(/\*\*/g, ''), size: 21 })],
      spacing: { after: 100 },
    });
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: 'ARSHIEL ASSURANCE', bold: true, size: 32, color: '0F172A' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Assessing Risks. Strengthening Compliance. Improving Performance.',
                italics: true,
                size: 19,
                color: '475569',
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: options.title,
            heading: HeadingLevel.TITLE,
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Document No: ${options.docNumber}   |   Revision: ${options.revision}   |   Status: ${options.status}`,
                bold: true,
                size: 20,
                color: 'B45309',
              }),
            ],
            spacing: { after: 200 },
          }),
          ...options.metadata.map(
            ([k, v]) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${k}: `, bold: true, size: 20 }),
                  new TextRun({ text: v, size: 20 }),
                ],
                spacing: { after: 60 },
              })
          ),
          new Paragraph({ text: '', spacing: { after: 160 } }),
          ...bodyParagraphs,
          new Paragraph({
            text: 'MANDATORY DISCLAIMER & SYSTEM RESTRICTIONS',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 320, after: 100 },
          }),
          ...MANDATORY_DISCLAIMER_LINES.map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 18, color: '64748B' })],
                spacing: { after: 80 },
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, options.filename.endsWith('.docx') ? options.filename : `${options.filename}.docx`);
}
