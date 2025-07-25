// GET: Download seller invoice PDF for a specific auction
router.get('/seller/:email/auction/:auctionId/pdf', (req, res) => {
  const { email, auctionId } = req.params;
  const invoices = readInvoices().filter(inv =>
    inv.sellerEmail === email && (inv.auctionId === auctionId || inv.auctionTitle === auctionId)
  );
  if (!invoices.length) return res.status(404).json({ error: 'No invoices for this seller in this auction.' });

  // Use auction name as title (from first invoice)
  const auctionTitle = invoices[0].auctionTitle || auctionId;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="seller-invoice-${auctionTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}-${email}.pdf"`);
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(18).text(`Seller Invoice - ${auctionTitle}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  invoices.forEach((inv, idx) => {
    doc.text(`Lot: ${inv.lotNumber}`);
    doc.text(`Item: ${inv.item}`);
    doc.text(`Buyer: ${inv.buyerEmail}`);
    doc.text(`Sale Amount: R${inv.baseAmount}`);
    doc.text(`Seller Net: R${inv.sellerNet}`);
    doc.text(`Date: ${inv.date}`);
    doc.moveDown();
  });
  doc.end();
});
// GET: Download buyer invoice PDF for a specific auction
router.get('/buyer/:email/auction/:auctionId/pdf', (req, res) => {
  const { email, auctionId } = req.params;
  const invoices = readInvoices().filter(inv =>
    inv.buyerEmail === email && (inv.auctionId === auctionId || inv.auctionTitle === auctionId)
  );
  if (!invoices.length) return res.status(404).json({ error: 'No invoices for this buyer in this auction.' });

  // Use auction name as title (from first invoice)
  const auctionTitle = invoices[0].auctionTitle || auctionId;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${auctionTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}-${email}.pdf"`);
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(18).text(`Invoice - ${auctionTitle}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  invoices.forEach((inv, idx) => {
    doc.text(`Lot: ${inv.lotNumber}`);
    doc.text(`Item: ${inv.item}`);
    doc.text(`Seller: ${inv.sellerEmail}`);
    doc.text(`Total Paid: R${inv.amount}`);
    doc.text(`Base Amount: R${inv.baseAmount}`);
    doc.text(`Date: ${inv.date}`);
    doc.moveDown();
  });
  doc.end();
});
// ✅ Mark invoice as paid
router.put('/:invoiceId/paid', (req, res) => {
  const { invoiceId } = req.params;
  const invoices = readInvoices();
  const idx = invoices.findIndex(inv => inv.id === invoiceId);
  if (idx === -1) return res.status(404).json({ error: 'Invoice not found.' });
  invoices[idx].paid = true;
  writeInvoices(invoices);
  res.json({ success: true, invoice: invoices[idx] });
});
const express = require('express');
const fs = require('fs');
const path = require('path');
// POST: Email all buyer and seller invoices for a given auction
router.post('/email-invoices/:auctionId', async (req, res) => {
  const { auctionId } = req.params;
  const invoices = readInvoices().filter(inv => inv.auctionTitle === auctionId || inv.auctionId === auctionId);
  if (!invoices.length) return res.status(404).json({ error: 'No invoices for this auction.' });

  // Group by buyer and seller
  const buyers = {};
  const sellers = {};
  invoices.forEach(inv => {
    if (inv.buyerEmail) {
      buyers[inv.buyerEmail] = buyers[inv.buyerEmail] || [];
      buyers[inv.buyerEmail].push(inv);
    }
    if (inv.sellerEmail) {
      sellers[inv.sellerEmail] = sellers[inv.sellerEmail] || [];
      sellers[inv.sellerEmail].push(inv);
    }
  });

  // Helper to generate PDF buffer
  function generatePDF(title, invs, isSeller) {
    return new Promise((resolve, reject) => {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      const bufs = [];
      doc.on('data', d => bufs.push(d));
      doc.on('end', () => resolve(Buffer.concat(bufs)));
      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      invs.forEach((inv, idx) => {
        doc.text(`Invoice #${idx + 1}`);
        doc.text(`Auction: ${inv.auctionTitle}`);
        doc.text(`Lot: ${inv.lotNumber}`);
        doc.text(`Item: ${inv.item}`);
        if (isSeller) {
          doc.text(`Buyer: ${inv.buyerEmail}`);
          doc.text(`Sale Amount: R${inv.baseAmount}`);
          doc.text(`Seller Net: R${inv.sellerNet}`);
        } else {
          doc.text(`Seller: ${inv.sellerEmail}`);
          doc.text(`Total Paid: R${inv.amount}`);
          doc.text(`Base Amount: R${inv.baseAmount}`);
        }
        doc.text(`Date: ${inv.date}`);
        doc.moveDown();
      });
      doc.end();
    });
  }

  // Send emails
  const { sendMail } = require('../../utils/mailer');
  let sent = 0, failed = 0;
  for (const [email, invs] of Object.entries(buyers)) {
    try {
      const pdf = await generatePDF('Buyer Invoice Summary', invs, false);
      await sendMail({
        to: email,
        subject: 'Your Auction Invoice(s)',
        text: 'Please find your invoice(s) attached.',
        attachments: [{ filename: 'invoices.pdf', content: pdf }]
      });
      sent++;
    } catch (e) { failed++; }
  }
  for (const [email, invs] of Object.entries(sellers)) {
    try {
      const pdf = await generatePDF('Seller Invoice Summary', invs, true);
      await sendMail({
        to: email,
        subject: 'Your Auction Invoice(s)',
        text: 'Please find your invoice(s) attached.',
        attachments: [{ filename: 'invoices.pdf', content: pdf }]
      });
      sent++;
    } catch (e) { failed++; }
  }
  res.json({ sent, failed });
});

// ...existing code...
// GET: Download buyer invoice PDF
router.get('/buyer/:email/pdf', (req, res) => {
  const { email } = req.params;
  const invoices = readInvoices().filter(inv => inv.buyerEmail === email);
  if (!invoices.length) return res.status(404).json({ error: 'No invoices for this buyer.' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="buyer-invoices-${email}.pdf"`);
  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(18).text('Buyer Invoice Summary', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  invoices.forEach((inv, idx) => {
    doc.text(`Invoice #${idx + 1}`);
    doc.text(`Auction: ${inv.auctionTitle}`);
    doc.text(`Lot: ${inv.lotNumber}`);
    doc.text(`Item: ${inv.item}`);
    doc.text(`Seller: ${inv.sellerEmail}`);
    doc.text(`Total Paid: R${inv.amount}`);
    doc.text(`Base Amount: R${inv.baseAmount}`);
    doc.text(`Date: ${inv.date}`);
    doc.moveDown();
  });
  doc.end();
});
// PDF generation for seller invoices
const PDFDocument = require('pdfkit');

// GET: Download seller invoice PDF
router.get('/seller/:email/pdf', (req, res) => {
  const { email } = req.params;
  const invoices = readInvoices().filter(inv => inv.sellerEmail === email);
  if (!invoices.length) return res.status(404).json({ error: 'No invoices for this seller.' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="seller-invoices-${email}.pdf"`);
  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(18).text('Seller Invoice Summary', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  invoices.forEach((inv, idx) => {
    doc.text(`Invoice #${idx + 1}`);
    doc.text(`Auction: ${inv.auctionTitle}`);
    doc.text(`Lot: ${inv.lotNumber}`);
    doc.text(`Item: ${inv.item}`);
    doc.text(`Buyer: ${inv.buyerEmail}`);
    doc.text(`Sale Amount: R${inv.baseAmount}`);
    doc.text(`Seller Net: R${inv.sellerNet}`);
    doc.text(`Date: ${inv.date}`);
    doc.moveDown();
  });
  doc.end();
});
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const invoicesPath = path.join(__dirname, '../../data/invoices.json');

// Load invoices
function readInvoices() {
  if (!fs.existsSync(invoicesPath)) return [];
  return JSON.parse(fs.readFileSync(invoicesPath, 'utf-8'));
}

// Save invoices
function writeInvoices(invoices) {
  fs.writeFileSync(invoicesPath, JSON.stringify(invoices, null, 2), 'utf-8');
}

// ✅ Get all invoices for a buyer
router.get('/buyer/:email', (req, res) => {
  const invoices = readInvoices();
  const filtered = invoices.filter(inv => inv.buyerEmail === req.params.email);
  res.json(filtered);
});

// ✅ Get all invoices for a seller
router.get('/seller/:email', (req, res) => {
  const invoices = readInvoices();
  const filtered = invoices.filter(inv => inv.sellerEmail === req.params.email);
  res.json(filtered);
});

// ✅ Create invoice
router.post('/', (req, res) => {
  const { buyerEmail, sellerEmail, auctionTitle, lotNumber, item, baseAmount, date } = req.body;

  if (!buyerEmail || !sellerEmail || !auctionTitle || !lotNumber || !item || !baseAmount) {
    return res.status(400).json({ error: 'Missing invoice data.' });
  }

  const buyerAmount = Math.round(baseAmount * 1.10); // 10% buyer fee
  const sellerAmount = Math.round(baseAmount * 0.85); // 15% seller cut

  const invoices = readInvoices();

  const newInvoice = {
    id: uuidv4(),
    auctionTitle,
    lotNumber,
    item,
    buyerEmail,
    sellerEmail,
    amount: buyerAmount,
    sellerNet: sellerAmount,
    baseAmount,
    date: date || new Date().toISOString()
  };

  invoices.push(newInvoice);
  writeInvoices(invoices);

  res.status(201).json(newInvoice);
});

module.exports = router;
