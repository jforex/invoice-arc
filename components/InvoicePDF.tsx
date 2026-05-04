import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  currency?: string;
  items: InvoiceItem[];
}

interface CompanyData {
  name: string;
  email: string;
  address: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  brand_color: string;
}

interface InvoicePDFProps {
  invoice: InvoiceData;
  company?: CompanyData;
}

const defaultCompany: CompanyData = {
  name: 'Christian Design Studio',
  email: 'hello@christiandesign.com',
  address: 'Port Harcourt, Rivers State, Nigeria',
  brand_color: '#2563eb',
};

// Currency symbols for PDF (since Intl might not work well in PDF context)
const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: 'N',  // Use 'N' for Naira since ₦ may not render in PDF
  KES: 'KSh',
  GHS: 'GHS',
  ZAR: 'R',
  CAD: 'C$',
  AUD: 'A$',
  JPY: 'Y',  // Use 'Y' for Yen since ¥ may not render
  INR: 'Rs',
  CNY: 'Y',
  BRL: 'R$',
  MXN: 'Mex$',
  AED: 'AED',
};

const formatPDFCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const createStyles = (brandColor: string) => StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: brandColor,
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    backgroundColor: '#ffffff',
    padding: 5,
    borderRadius: 8,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  currencyBadge: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: brandColor,
  },
  body: {
    padding: 30,
  },
  section: {
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    color: '#1e293b',
    marginBottom: 2,
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#0f172a',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: brandColor,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableCol1: {
    flex: 3,
    fontSize: 10,
  },
  tableCol2: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
  },
  tableCol3: {
    flex: 1.5,
    fontSize: 10,
    textAlign: 'right',
  },
  tableCol4: {
    flex: 1.5,
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  totals: {
    marginLeft: 'auto',
    width: 220,
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#1e293b',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 11,
    color: '#475569',
  },
  totalValue: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  finalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  finalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: brandColor,
  },
  notes: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 10,
    color: '#64748b',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
    marginBottom: 2,
  },
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company = defaultCompany }) => {
  const brandColor = company.brand_color || '#2563eb';
  const styles = createStyles(brandColor);
  const currency = invoice.currency || 'USD';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {company.logo_url && (
              <Image src={company.logo_url} style={styles.logo} />
            )}
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
              <Text style={styles.currencyBadge}>Currency: {currency}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {invoice.status === 'paid' ? 'PAID' : 'PENDING'}
              </Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Dates */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.value}>{formatDate(invoice.issue_date)}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>{formatDate(invoice.due_date)}</Text>
            </View>
          </View>

          {/* From / Bill To */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>From</Text>
              <Text style={styles.bold}>{company.name}</Text>
              <Text style={styles.value}>{company.email}</Text>
              <Text style={styles.value}>{company.address}</Text>
              {company.phone && <Text style={styles.value}>{company.phone}</Text>}
              {company.website && <Text style={styles.value}>{company.website}</Text>}
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Bill To</Text>
              <Text style={styles.bold}>{invoice.client_name}</Text>
              <Text style={styles.value}>{invoice.client_email}</Text>
              <Text style={styles.value}>{invoice.client_address}</Text>
            </View>
          </View>

          {/* Line Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol1, styles.tableHeaderText]}>Description</Text>
              <Text style={[styles.tableCol2, styles.tableHeaderText]}>Qty</Text>
              <Text style={[styles.tableCol3, styles.tableHeaderText]}>Price</Text>
              <Text style={[styles.tableCol4, styles.tableHeaderText]}>Amount</Text>
            </View>
            {invoice.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{item.description}</Text>
                <Text style={styles.tableCol2}>{item.quantity}</Text>
                <Text style={styles.tableCol3}>{formatPDFCurrency(item.price, currency)}</Text>
                <Text style={styles.tableCol4}>{formatPDFCurrency(item.amount, currency)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatPDFCurrency(invoice.subtotal, currency)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{formatPDFCurrency(invoice.tax, currency)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={styles.finalLabel}>Total ({currency})</Text>
              <Text style={styles.finalValue}>{formatPDFCurrency(invoice.total, currency)}</Text>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{company.name}</Text>
            <Text style={styles.footerText}>{company.address}</Text>
            <Text style={styles.footerText}>{company.email}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
