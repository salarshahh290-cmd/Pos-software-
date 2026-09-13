import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, StoreProfile } from '../types';
import { formatDatePK, formatNumber } from './formatters';

/**
 * Generates and downloads a clean, professional PDF invoice adhering to Pakistani retail billing standards.
 */
export function generateInvoicePDF(
  invoice: Invoice,
  store: StoreProfile,
  options: { autoDownload?: boolean } = { autoDownload: true }
): { doc: jsPDF; dataUrl: string; fileName: string } {
  // Use standard 80mm receipt style or standard clean A5 / A4
  // 80mm width thermal or A4 page? An A4 or 100mm wide format looks clean and prints on standard printers & thermal rolls.
  // Using 80mm x 200mm+ receipt format is typical for POS thermal, but A4 with clean center styling works on both desktop printers & screen.
  // Let's create an 80mm width continuous receipt or standard compact receipt document!
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, Math.max(160, 95 + invoice.items.length * 10)],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 8;

  // Header - Store Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(store.storeName, pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(store.tagline, pageWidth / 2, y, { align: 'center' });
  y += 3.5;

  doc.setFontSize(6.5);
  doc.text(store.address, pageWidth / 2, y, { align: 'center' });
  y += 3.2;
  doc.text(`Ph: ${store.phone}`, pageWidth / 2, y, { align: 'center' });
  y += 3.2;

  // Tax Registration Numbers
  if (store.strn || store.ntn) {
    const taxLine = [store.strn, store.ntn].filter(Boolean).join(' | ');
    doc.text(taxLine, pageWidth / 2, y, { align: 'center' });
    y += 3.5;
  }

  // Dotted divider
  doc.setLineDashPattern([1, 1], 0);
  doc.line(4, y, pageWidth - 4, y);
  y += 3.5;

  // Invoice Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`INVOICE: ${invoice.billNumber}`, 4, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Date: ${formatDatePK(invoice.date)}`, pageWidth - 4, y, { align: 'right' });
  y += 3.5;

  doc.text(`Payment: ${invoice.paymentMethod}`, 4, y);
  if (invoice.customerName) {
    doc.text(`Cust: ${invoice.customerName}`, pageWidth - 4, y, { align: 'right' });
  } else {
    doc.text(`Type: Counter Sale`, pageWidth - 4, y, { align: 'right' });
  }
  y += 3;

  doc.line(4, y, pageWidth - 4, y);
  y += 1.5;

  // Table of Items using autoTable
  const tableData = invoice.items.map((item, index) => [
    (index + 1).toString(),
    item.name,
    item.qty.toString(),
    formatNumber(item.price),
    formatNumber(item.total),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item', 'Qty', 'Rate', 'Total']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 6.5,
      cellPadding: 1,
      font: 'helvetica',
      textColor: [30, 30, 30],
    },
    headStyles: {
      fontStyle: 'bold',
      fontSize: 6.5,
      textColor: [0, 0, 0],
      fillColor: [240, 240, 240],
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 5, halign: 'center' },
      1: { cellWidth: 32, halign: 'left' },
      2: { cellWidth: 8, halign: 'center' },
      3: { cellWidth: 14, halign: 'right' },
      4: { cellWidth: 15, halign: 'right' },
    },
    margin: { left: 3, right: 3 },
  });

  // Position after table
  const finalY = (doc as any).lastAutoTable.finalY + 3;
  y = finalY;

  // Divider
  doc.setLineDashPattern([1, 1], 0);
  doc.line(4, y, pageWidth - 4, y);
  y += 4;

  // Totals Breakdown
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal:', 38, y);
  doc.text(`PKR ${formatNumber(invoice.subtotal)}`, pageWidth - 4, y, { align: 'right' });
  y += 3.5;

  const taxLabel = invoice.taxRate > 0
    ? `Sales Tax (${(invoice.taxRate * 100).toFixed(1).replace(/\.0$/, '')}%):`
    : invoice.taxAmount > 0
    ? 'Sales Tax (Manual):'
    : 'Sales Tax (0% / Exempt):';
  doc.text(taxLabel, 34, y);
  doc.text(`PKR ${formatNumber(invoice.taxAmount)}`, pageWidth - 4, y, { align: 'right' });
  y += 3.5;

  if (invoice.discount && invoice.discount > 0) {
    doc.text('Discount:', 38, y);
    doc.text(`- PKR ${formatNumber(invoice.discount)}`, pageWidth - 4, y, { align: 'right' });
    y += 3.5;
  }

  // Net Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('NET TOTAL:', 34, y);
  doc.text(`PKR ${formatNumber(invoice.total)}`, pageWidth - 4, y, { align: 'right' });
  y += 4.5;

  // Tendered / Change if provided
  if (invoice.amountTendered && invoice.amountTendered > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Paid Amount:', 38, y);
    doc.text(`PKR ${formatNumber(invoice.amountTendered)}`, pageWidth - 4, y, { align: 'right' });
    y += 3;

    doc.text('Change Due:', 38, y);
    doc.text(`PKR ${formatNumber(invoice.changeDue || 0)}`, pageWidth - 4, y, { align: 'right' });
    y += 4;
  }

  // Items Summary
  const totalUnits = invoice.items.reduce((acc, it) => acc + it.qty, 0);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.text(`Total Items: ${invoice.items.length}  |  Total Units: ${totalUnits}`, 4, y);
  y += 4;

  // Bottom Divider
  doc.setLineDashPattern([1, 1], 0);
  doc.line(4, y, pageWidth - 4, y);
  y += 4;

  // Footer Message
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('THANK YOU FOR YOUR VISIT!', pageWidth / 2, y, { align: 'center' });
  y += 3.2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Exchange within 3 days with original receipt', pageWidth / 2, y, { align: 'center' });
  y += 2.8;
  doc.text('Software: Point of Sale System (PKR Edition)', pageWidth / 2, y, { align: 'center' });

  const fileName = `${invoice.billNumber}.pdf`;

  if (options.autoDownload) {
    doc.save(fileName);
  }

  const dataUrl = doc.output('dataurlstring');

  return { doc, dataUrl, fileName };
}
