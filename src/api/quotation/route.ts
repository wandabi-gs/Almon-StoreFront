import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import PDFDocument from 'pdfkit';

const resend = new Resend(process.env.RESEND_API_KEY);

// Product data from your storefront
const products = {
    // Roll Materials
    "frontlit-banner-1-5-m-440gsm": { name: "Frontlit Banner 1.5m 440GSM", category: "roll", basePrice: 4500 },
    "frontlit-banner-2-7-m-440gsm": { name: "Frontlit Banner 2.7m 440GSM", category: "roll", basePrice: 7800 },
    "black-back-1-06-440gsm": { name: "Black Back Banner 1.06m 440GSM", category: "roll", basePrice: 3200 },
    "clear-gloss-roll-1-35": { name: "Clear Gloss Roll 1.35m", category: "roll", basePrice: 2800 },

    // Board Substrates
    "corex-5mm": { name: "Corex Board 5mm", category: "board", basePrice: 1800 },
    "aluco-3mm-black": { name: "Alucobond 3mm Black", category: "board", basePrice: 4500 },
    "forex-3mm": { name: "Forex Board 3mm", category: "board", basePrice: 2200 },
    "persepex-clear": { name: "Perspex Clear", category: "board", basePrice: 3200 },

    // Aluminium Products
    "aluminium-big-cutter": { name: "Aluminium Big Cutter", category: "unit", basePrice: 8500 },
    "aluminium-normal-rollup": { name: "Aluminium Normal Rollup", category: "unit", basePrice: 12500 },
    "silver-big-cutter": { name: "Silver Big Cutter", category: "unit", basePrice: 9200 },

    // Hardware & Tools
    "scissors": { name: "Professional Scissors", category: "unit", basePrice: 450 },
    "big-knife": { name: "Big Cutter Knife", category: "unit", basePrice: 650 },
    "eyelets-small-pckt": { name: "Eyelets Small Pack", category: "unit", basePrice: 850 },

    // Signage Accessories
    "snapper-frame-a0": { name: "Snapper Frame A0", category: "unit", basePrice: 12500 },
    "snapper-frame-a1": { name: "Snapper Frame A1", category: "unit", basePrice: 8500 },
    "pop-up-3-by-3": { name: "Pop-up Stand 3x3", category: "unit", basePrice: 45000 },
    "x-stand": { name: "X-Stand Display", category: "unit", basePrice: 6800 },

    // Promotional Items
    "lanyard-big-grey": { name: "Big Grey Lanyard", category: "unit", basePrice: 250 },
    "note-book-a4-gold": { name: "A4 Gold Notebook", category: "unit", basePrice: 650 },
    "pen-executive": { name: "Executive Pen", category: "unit", basePrice: 350 }
};

interface QuotationItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    description?: string;
}

interface QuotationRequest {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    industry: string;
    companySize: string;
    materials: string[];
    monthlyVolume: string;
    deliveryFrequency: string;
    budgetRange: string;
    timeline: string;
    paymentTerms: string;
    specialRequirements: string;
    items: QuotationItem[];
}

export async function POST(request: NextRequest) {
    try {
        const body: QuotationRequest = await request.json();

        // Generate quotation number
        const quotationNumber = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Calculate pricing
        const subtotal = body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const vat = subtotal * 0.16; // 16% VAT
        const deliveryFee = body.deliveryFrequency === 'weekly' ? 5000 :
            body.deliveryFrequency === 'bi-weekly' ? 3000 :
                body.deliveryFrequency === 'monthly' ? 2000 : 0;
        const total = subtotal + vat + deliveryFee;

        // Calculate discount based on volume
        let discount = 0;
        if (body.monthlyVolume === '50k-200k') discount = subtotal * 0.05;
        else if (body.monthlyVolume === '200k-500k') discount = subtotal * 0.10;
        else if (body.monthlyVolume === '500k+') discount = subtotal * 0.15;

        const finalTotal = total - discount;

        // Generate PDF invoice
        const pdfBuffer = await generateInvoicePDF({
            ...body,
            quotationNumber,
            subtotal,
            vat,
            deliveryFee,
            discount,
            total: finalTotal,
            date: new Date().toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        });

        // Send email with invoice
        await sendQuotationEmail(body.email, body.contactPerson, quotationNumber, pdfBuffer);

        // Send notification to admin
        await sendAdminNotification(body, quotationNumber);

        return NextResponse.json({
            success: true,
            quotationNumber,
            total: finalTotal,
            pdfUrl: `/api/quotation/download/${quotationNumber}`,
            message: 'Quotation submitted successfully. Check your email for the invoice.'
        });

    } catch (error) {
        console.error('Quotation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process quotation' },
            { status: 500 }
        );
    }
}

async function generateInvoicePDF(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).font('Helvetica-Bold')
            .fillColor('#1e40af')
            .text('ALMON PRODUCTS LTD', 50, 50);

        doc.fontSize(10).font('Helvetica')
            .fillColor('#6b7280')
            .text('Enterprise Industrial Solutions', 50, 80)
            .text('P.O. Box 12345-00100, Nairobi', 50, 95)
            .text('Tel: +254 700 000 000 | Email: enterprise@almonproducts.com', 50, 110);

        // Quotation Title
        doc.fontSize(18).font('Helvetica-Bold')
            .fillColor('#111827')
            .text(`QUOTATION: ${data.quotationNumber}`, 50, 150);

        // Client Info
        doc.fontSize(12).font('Helvetica-Bold')
            .fillColor('#374151')
            .text('BILL TO:', 50, 200);

        doc.fontSize(10).font('Helvetica')
            .fillColor('#4b5563')
            .text(data.companyName, 50, 220)
            .text(data.contactPerson, 50, 235)
            .text(data.email, 50, 250)
            .text(data.phone, 50, 265);

        // Quotation Details
        doc.fontSize(10)
            .text(`Date: ${data.date}`, 350, 200)
            .text(`Valid Until: ${data.expiryDate}`, 350, 215)
            .text(`Payment Terms: ${data.paymentTerms}`, 350, 230)
            .text(`Delivery: ${data.deliveryFrequency}`, 350, 245);

        // Table Header
        const tableTop = 300;
        doc.fontSize(10).font('Helvetica-Bold')
            .fillColor('#ffffff')
            .rect(50, tableTop, 500, 25).fill('#1e40af');

        doc.text('Description', 60, tableTop + 8);
        doc.text('Quantity', 300, tableTop + 8);
        doc.text('Unit Price', 380, tableTop + 8);
        doc.text('Total', 450, tableTop + 8);

        // Table Rows
        let y = tableTop + 35;
        data.items.forEach((item: any, index: number) => {
            const product = products[item.productId as keyof typeof products] || { name: item.productId };
            const itemTotal = item.quantity * item.unitPrice;

            doc.fontSize(9).font('Helvetica')
                .fillColor(index % 2 === 0 ? '#111827' : '#374151')
                .text(product.name, 60, y, { width: 220 });
            doc.text(item.quantity.toString(), 300, y);
            doc.text(`KSh ${item.unitPrice.toLocaleString()}`, 380, y);
            doc.text(`KSh ${itemTotal.toLocaleString()}`, 450, y);

            y += 20;
        });

        // Summary
        const summaryTop = y + 30;
        doc.fontSize(10).font('Helvetica')
            .fillColor('#374151')
            .text('Subtotal:', 380, summaryTop)
            .text(`KSh ${data.subtotal.toLocaleString()}`, 450, summaryTop)

            .text('VAT (16%):', 380, summaryTop + 20)
            .text(`KSh ${data.vat.toLocaleString()}`, 450, summaryTop + 20)

            .text('Delivery Fee:', 380, summaryTop + 40)
            .text(`KSh ${data.deliveryFee.toLocaleString()}`, 450, summaryTop + 40)

            .text('Volume Discount:', 380, summaryTop + 60)
            .text(`KSh ${data.discount.toLocaleString()}`, 450, summaryTop + 60)

            .font('Helvetica-Bold')
            .text('TOTAL:', 380, summaryTop + 90)
            .text(`KSh ${data.total.toLocaleString()}`, 450, summaryTop + 90, { underline: true });

        // Terms and Conditions
        doc.fontSize(9).font('Helvetica')
            .fillColor('#6b7280')
            .text('Terms & Conditions:', 50, summaryTop + 140)
            .text('1. Prices are valid for 30 days from date of quotation', 50, summaryTop + 155)
            .text('2. Minimum order value: KSh 10,000', 50, summaryTop + 170)
            .text('3. Delivery within 3-5 business days for Nairobi', 50, summaryTop + 185)
            .text('4. Payment: 50% deposit, 50% on delivery', 50, summaryTop + 200)
            .text('5. VAT inclusive where applicable', 50, summaryTop + 215);

        // Footer
        doc.fontSize(8)
            .text('Thank you for choosing Almon Products Ltd. For enterprise support, contact enterprise@almonproducts.com',
                50, 750, { align: 'center' });

        doc.end();
    });
}

async function sendQuotationEmail(to: string, name: string, quotationNumber: string, pdfBuffer: Buffer) {
    try {
        await resend.emails.send({
            from: 'Enterprise Quotations <quotations@almonproducts.com>',
            to: [to],
            subject: `Your Quotation ${quotationNumber} - Almon Products Ltd`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; max-width: 600px; margin: 0 auto; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
                .button { background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                .highlight { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Your Enterprise Quotation</h1>
                <p>Quotation Number: ${quotationNumber}</p>
            </div>
            
            <div class="content">
                <p>Dear ${name},</p>
                
                <p>Thank you for requesting a quotation from Almon Products Ltd. We appreciate your interest in our enterprise solutions.</p>
                
                <div class="highlight">
                    <h3>Quotation Details:</h3>
                    <p><strong>Quotation Number:</strong> ${quotationNumber}</p>
                    <p><strong>Date Issued:</strong> ${new Date().toLocaleDateString('en-KE')}</p>
                    <p><strong>Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE')}</p>
                </div>
                
                <p>We have attached a detailed PDF invoice for your review. Our enterprise sales team will contact you within 24 hours to discuss your requirements further.</p>
                
                <p>For immediate assistance, please call our enterprise support line:</p>
                <p><strong>📞 +254 700 000 000</strong></p>
                
                <p>Best regards,<br>
                Enterprise Solutions Team<br>
                Almon Products Ltd</p>
            </div>
            
            <div class="footer">
                <p>Almon Products Ltd | P.O. Box 12345-00100, Nairobi</p>
                <p>Tel: +254 700 000 000 | Email: enterprise@almonproducts.com</p>
                <p>© ${new Date().getFullYear()} Almon Products Ltd. All rights reserved.</p>
            </div>
        </body>
        </html>
      `,
            attachments: [{
                filename: `Quotation-${quotationNumber}.pdf`,
                content: pdfBuffer.toString('base64'),
                contentType: 'application/pdf'
            }]
        });
    } catch (error) {
        console.error('Email sending error:', error);
    }
}

async function sendAdminNotification(data: any, quotationNumber: string) {
    try {
        await resend.emails.send({
            from: 'Quotation System <noreply@almonproducts.com>',
            to: ['enterprise@almonproducts.com', 'sales@almonproducts.com'],
            subject: `📋 New Enterprise Quotation: ${quotationNumber}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .alert { background: #dcfce7; border: 2px solid #22c55e; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .info-card { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
            </style>
        </head>
        <body>
            <h2>🚀 New Enterprise Quotation Request</h2>
            
            <div class="alert">
                <h3>Quotation Number: ${quotationNumber}</h3>
                <p>Priority: ${data.budgetRange.includes('M') ? 'HIGH PRIORITY' : 'STANDARD'}</p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <strong>Company:</strong><br>
                    ${data.companyName}<br>
                    ${data.industry} | ${data.companySize}
                </div>
                <div class="info-card">
                    <strong>Contact:</strong><br>
                    ${data.contactPerson}<br>
                    ${data.email}<br>
                    ${data.phone}
                </div>
            </div>
            
            <h3>Requirements:</h3>
            <ul>
                <li><strong>Materials:</strong> ${data.materials.join(', ')}</li>
                <li><strong>Monthly Volume:</strong> ${data.monthlyVolume}</li>
                <li><strong>Delivery:</strong> ${data.deliveryFrequency}</li>
                <li><strong>Budget:</strong> ${data.budgetRange}</li>
                <li><strong>Timeline:</strong> ${data.timeline}</li>
                <li><strong>Payment Terms:</strong> ${data.paymentTerms}</li>
            </ul>
            
            ${data.specialRequirements ? `
            <h3>Special Requirements:</h3>
            <p>${data.specialRequirements}</p>
            ` : ''}
            
            <p><strong>Action Required:</strong> Please contact client within 4 hours</p>
            
            <hr>
            <p><em>This is an automated notification from the Quotation System</em></p>
        </body>
        </html>
      `
        });
    } catch (error) {
        console.error('Admin notification error:', error);
    }
}

// Download endpoint
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const quotationNumber = searchParams.get('id');

    if (!quotationNumber) {
        return NextResponse.json(
            { error: 'Quotation number required' },
            { status: 400 }
        );
    }

    // In production, fetch from database
    const sampleData = {
        quotationNumber,
        date: new Date().toLocaleDateString(),
        companyName: "Sample Company",
        total: 50000,
        items: []
    };

    const pdfBuffer = await generateInvoicePDF(sampleData);

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Quotation-${quotationNumber}.pdf"`
        }
    });
}