export interface QuotationItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    description?: string;
}

export interface QuotationRequest {
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

export interface QuotationResponse {
    success: boolean;
    quotationNumber: string;
    total: number;
    pdfUrl: string;
    message: string;
}

// Sample product data for quotation builder
export const quotationProducts = {
    roll: [
        { id: "frontlit-banner-1-5-m-440gsm", name: "Frontlit Banner 1.5m 440GSM", price: 4500 },
        { id: "frontlit-banner-2-7-m-440gsm", name: "Frontlit Banner 2.7m 440GSM", price: 7800 },
        { id: "black-back-1-06-440gsm", name: "Black Back Banner 1.06m 440GSM", price: 3200 },
        { id: "clear-gloss-roll-1-35", name: "Clear Gloss Roll 1.35m", price: 2800 },
        { id: "one-way-vision-1-35", name: "One Way Vision 1.35m", price: 5200 },
    ],
    board: [
        { id: "corex-5mm", name: "Corex Board 5mm", price: 1800 },
        { id: "aluco-3mm-black", name: "Alucobond 3mm Black", price: 4500 },
        { id: "forex-3mm", name: "Forex Board 3mm", price: 2200 },
        { id: "persepex-clear", name: "Perspex Clear", price: 3200 },
        { id: "abs-0-9", name: "ABS Board 0.9mm", price: 1900 },
    ],
    unit: [
        { id: "aluminium-big-cutter", name: "Aluminium Big Cutter", price: 8500 },
        { id: "snapper-frame-a0", name: "Snapper Frame A0", price: 12500 },
        { id: "pop-up-3-by-3", name: "Pop-up Stand 3x3", price: 45000 },
        { id: "lanyard-big-grey", name: "Big Grey Lanyard", price: 250 },
        { id: "pen-executive", name: "Executive Pen", price: 350 },
    ]
};

export async function submitQuotation(request: QuotationRequest): Promise<QuotationResponse> {
    try {
        const response = await fetch('/api/quotation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error('Failed to submit quotation');
        }

        return await response.json();
    } catch (error) {
        console.error('Quotation submission error:', error);
        throw error;
    }
}

export async function downloadQuotation(quotationNumber: string): Promise<void> {
    try {
        const response = await fetch(`/api/quotation?id=${quotationNumber}`);

        if (!response.ok) {
            throw new Error('Failed to download quotation');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quotation-${quotationNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}