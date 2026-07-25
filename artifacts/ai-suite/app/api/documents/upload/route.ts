import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { processDocument, processText } from '@/lib/rag';
import { scrapeUrl } from '@/lib/scraper';
import { extractTextFromFile } from '@/lib/docProcessor';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: Request) {
    try {
        const session = (await getSession()) as { email: string } | null;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const contentType = req.headers.get('content-type') || '';
        let file: File | null = null;
        let url: string | null = null;

        if (contentType.includes('application/json')) {
            const body = await req.json();
            url = body.url;
        } else {
            const formData = await req.formData();
            file = formData.get('file') as File;
            url = formData.get('url') as string;
        }

        if (!file && !url) {
            return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
        }

        // ── URL-based training ─────────────────────────────────────────────────
        if (url) {
            let text = '';
            let title = url;
            const isPdf = url.toLowerCase().endsWith('.pdf');

            try {
                if (isPdf) {
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);
                    text = await extractTextFromFile(buffer, url);
                    title = url.split('/').pop() || url;
                } else {
                    const scraped = await scrapeUrl(url);
                    text = scraped.text;
                    title = scraped.title;
                }
            } catch (err: any) {
                return NextResponse.json({ error: 'Failed to process URL content', details: err.message }, { status: 500 });
            }

            const doc = await db.saveDocument({ userEmail: session.email, name: title || url, status: 'processing', metadata: { source: 'url', url } });
            try {
                await processText(text, title || url, doc.id);
            } catch (procError: unknown) {
                await db.updateDocumentStatus(doc.id, 'error');
                return NextResponse.json({ error: 'URL processing failed', details: (procError as Error).message }, { status: 500 });
            }
            return NextResponse.json({ message: 'URL content processed successfully', document: doc });
        }

        // ── File-based training (local temp storage — no Supabase needed) ─────
        if (file) {
            const fileName = file.name;
            const buffer = Buffer.from(await file.arrayBuffer());

            // Write to a temp file for processing, then delete
            const tmpPath = path.join(os.tmpdir(), `mediageek-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`);
            try {
                fs.writeFileSync(tmpPath, buffer);
            } catch (e) {
                // tmp write failed — proceed with in-memory buffer (still works)
            }

            const doc = await db.saveDocument({ userEmail: session.email, name: fileName || 'Uploaded Document', status: 'processing' });
            try {
                await processDocument(buffer, fileName, doc.id);
            } catch (procError: unknown) {
                await db.updateDocumentStatus(doc.id, 'error');
                return NextResponse.json({ error: 'Document processing failed', details: (procError as Error).message }, { status: 500 });
            } finally {
                // Clean up temp file
                try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch { }
            }
            return NextResponse.json({ message: 'Document uploaded and processed successfully', document: doc });
        }

    } catch (error: unknown) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: (error as Error).message || 'Upload failed' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = (await getSession()) as { email: string } | null;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const documents = await db.listDocuments(session.email);
        return NextResponse.json(documents);
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message || 'Failed to list documents' }, { status: 500 });
    }
}
