import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Scheme, Transaction, DateRange } from '../types'

interface ReportOptions {
  scheme: Scheme
  transactions: Transaction[]
  dateRange?: DateRange
  generatedBy: string
}

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Format number with thousand separators
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function generatePDFReport(options: ReportOptions): jsPDF {
  const { scheme, transactions, dateRange, generatedBy } = options
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = margin

  // Header - Company/App Name
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 37, 64) // Primary color
  doc.text('ESTBEL', margin, yPos)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(84, 110, 122) // Secondary text
  doc.text('Professional Cash Flow Statement', margin, yPos + 8)
  
  // Date generated
  doc.setFontSize(9)
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, pageWidth - margin, yPos, { align: 'right' })
  doc.text(`By: ${generatedBy}`, pageWidth - margin, yPos + 5, { align: 'right' })
  
  yPos += 25

  // Scheme Info Box
  doc.setFillColor(245, 247, 250) // Background subtle
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, 'F')
  
  yPos += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 37, 64)
  doc.text(scheme.name, margin + 10, yPos)
  
  if (scheme.description) {
    yPos += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(84, 110, 122)
    doc.text(scheme.description, margin + 10, yPos)
  }
  
  yPos += 8
  doc.setFontSize(9)
  doc.setTextColor(84, 110, 122)
  
  // Date range if provided
  if (dateRange?.startDate && dateRange?.endDate) {
    doc.text(`Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, margin + 10, yPos)
  } else {
    doc.text(`All transactions`, margin + 10, yPos)
  }
  
  yPos += 20

  // Summary Cards
  const cardWidth = (pageWidth - margin * 2 - 20) / 3
  const cardHeight = 30
  
  // Balance Card
  doc.setFillColor(10, 37, 64) // Primary
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('BALANCE', margin + 8, yPos + 10)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`TZS ${formatNumber(scheme.balance)}`, margin + 8, yPos + 22)
  
  // Cash In Card
  doc.setFillColor(0, 200, 83) // Success
  doc.roundedRect(margin + cardWidth + 10, yPos, cardWidth, cardHeight, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL IN', margin + cardWidth + 18, yPos + 10)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`TZS ${formatNumber(scheme.totalIn)}`, margin + cardWidth + 18, yPos + 22)
  
  // Cash Out Card
  doc.setFillColor(211, 47, 47) // Error
  doc.roundedRect(margin + (cardWidth + 10) * 2, yPos, cardWidth, cardHeight, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL OUT', margin + (cardWidth + 10) * 2 + 8, yPos + 10)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`TZS ${formatNumber(scheme.totalOut)}`, margin + (cardWidth + 10) * 2 + 8, yPos + 22)
  
  yPos += cardHeight + 15

  // Transactions Table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 37, 64)
  doc.text('Transaction History', margin, yPos)
  
  yPos += 8

  if (transactions.length === 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(84, 110, 122)
    doc.text('No transactions found for this period.', margin, yPos + 10)
  } else {
    // Prepare table data
    const tableData = transactions.map((tx) => [
      formatDate(tx.date),
      tx.type === 'in' ? 'IN' : 'OUT',
      tx.description || '-',
      formatNumber(tx.unitPrice),
      tx.quantity.toString(),
      formatNumber(tx.total),
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Type', 'Description', 'Unit Price', 'Qty', 'Total (TZS)']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [10, 37, 64],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [10, 37, 64],
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        // Color the Type column based on transaction type
        if (data.section === 'body' && data.column.index === 1) {
          const cellText = data.cell.text[0]
          if (cellText === 'IN') {
            doc.setTextColor(0, 200, 83)
          } else if (cellText === 'OUT') {
            doc.setTextColor(211, 47, 47)
          }
        }
      },
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(84, 110, 122)
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    doc.text(
      'Estbel Suite - Professional Cash Flow Management',
      margin,
      doc.internal.pageSize.getHeight() - 10
    )
  }

  return doc
}

// Download PDF
export function downloadPDF(options: ReportOptions): void {
  const doc = generatePDFReport(options)
  const fileName = `estbel-${options.scheme.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// Share via WhatsApp using Web Share API
export async function shareViaWhatsApp(options: ReportOptions): Promise<boolean> {
  const doc = generatePDFReport(options)
  const pdfBlob = doc.output('blob')
  const fileName = `estbel-${options.scheme.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  
  // Check if Web Share API is available
  if (navigator.share && navigator.canShare) {
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' })
    const shareData = {
      title: `Estbel Statement - ${options.scheme.name}`,
      text: `Cash flow statement for ${options.scheme.name}. Balance: TZS ${formatNumber(options.scheme.balance)}`,
      files: [file],
    }
    
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return true
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
        return false
      }
    }
  }
  
  // Fallback: Open WhatsApp with a message (without file)
  const message = encodeURIComponent(
    `📊 *Estbel Statement*\n\n` +
    `*Scheme:* ${options.scheme.name}\n` +
    `*Balance:* TZS ${formatNumber(options.scheme.balance)}\n` +
    `*Total In:* TZS ${formatNumber(options.scheme.totalIn)}\n` +
    `*Total Out:* TZS ${formatNumber(options.scheme.totalOut)}\n` +
    `*Transactions:* ${options.transactions.length}\n\n` +
    `_Generated by Estbel Suite_`
  )
  
  window.open(`https://wa.me/?text=${message}`, '_blank')
  
  // Also download the PDF
  downloadPDF(options)
  
  return true
}
