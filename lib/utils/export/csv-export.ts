/**
 * CSV Export Utility
 * Exports financial data to CSV format
 */

export interface CSVData {
  headers: string[];
  rows: (string | number)[][];
}

export function exportToCSV(data: CSVData, filename: string): void {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function convertToCSV(data: CSVData): string {
  const headers = data.headers.map(escapeCSV).join(',');
  const rows = data.rows
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');
  
  return `${headers}\n${rows}`;
}

function escapeCSV(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function generateTransactionCSV(transactions: any[]): CSVData {
  return {
    headers: ['Date', 'Description', 'Category', 'Amount', 'Balance'],
    rows: transactions.map((t) => [
      new Date(t.date).toLocaleDateString('en-IN'),
      t.description,
      t.category,
      t.amount,
      t.balance,
    ]),
  };
}

export function generateIncomeCSV(incomeRecords: any[]): CSVData {
  return {
    headers: ['Date', 'Source', 'Amount', 'Notes'],
    rows: incomeRecords.map((i) => [
      new Date(i.date).toLocaleDateString('en-IN'),
      i.source,
      i.amount,
      i.notes || '',
    ]),
  };
}
