import fs from 'fs';
import path from 'path';
// @ts-ignore
const imagesToPdf = require('images-to-pdf');

export class EvidenceHelper {
    static async generatePDF(testName: string, evidenceDir?: string) {
        const safeTestName = testName.replace(/[^a-z0-9]/gi, '_');
        const targetDir = evidenceDir || path.join(process.cwd(), 'evidence', safeTestName);

        if (!fs.existsSync(targetDir)) {
            return;
        }

        const files = fs.readdirSync(targetDir)
            .filter(file => file.endsWith('.png'))
            .map(file => path.join(targetDir, file))
            .sort();

        if (files.length === 0) return;

        // 2. O PDF será salvo DENTRO da subpasta do teste, não na raiz
        const outputPath = path.join(targetDir, `${safeTestName}_Report.pdf`);

        // 3. Limpeza agressiva do 0.pdf para evitar o erro 'undefined'
        const zeroPdfPath = path.join(process.cwd(), '0.pdf');
        
        try {
            if (fs.existsSync(zeroPdfPath)) {
                fs.unlinkSync(zeroPdfPath);
            }
            
            await imagesToPdf(files, outputPath);
            console.log(`✅ PDF generated in: ${targetDir}`);
        } catch (err: any) {
            // Tratamento de erro robusto para concorrência
            const errorMsg = err?.message || 'Concurrent worker access';
            if (errorMsg.includes('0.pdf') || errorMsg.includes('EBUSY')) {
                console.warn(`⚠️ PDF Worker Conflict (0.pdf) ignored for: ${testName}`);
            } else {
                console.error(`❌ Failed to generate PDF for ${testName}:`, errorMsg);
            }
        }
    }
}