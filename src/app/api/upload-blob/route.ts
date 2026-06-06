import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');

    // Upload MP3 to Vercel Blob
    const audioPath = join(process.cwd(), 'public', 'NISAAP-System-Overview.mp3');
    const audioBuffer = await readFile(audioPath);

    const blob = await put('NISAAP-System-Overview.mp3', audioBuffer, {
      access: 'public',
      contentType: 'audio/mpeg',
    });

    // Upload script to Vercel Blob
    const scriptPath = join(process.cwd(), 'public', 'NISAAP-Audio-Script.txt');
    const scriptBuffer = await readFile(scriptPath);

    const scriptBlob = await put('NISAAP-Audio-Script.txt', scriptBuffer, {
      access: 'public',
      contentType: 'text/plain',
    });

    return NextResponse.json({
      success: true,
      audioUrl: blob.url,
      scriptUrl: scriptBlob.url,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
