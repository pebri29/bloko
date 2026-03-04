import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportToExcel = (data: any[], fileName: string, sheetName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
};

export const exportToPDF = (
  title: string,
  headers: string[][],
  data: any[][],
  fileName: string
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Dicetak pada: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 30);
  
  // Add table
  autoTable(doc, {
    startY: 35,
    head: headers,
    body: data,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 }, // Blue-500
    styles: { fontSize: 9, cellPadding: 3 },
  });
  
  doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};
