import { addDatabaseIndexes } from '@/configs/migrations';
import { NextResponse } from 'next/server';

// This endpoint should be protected in production
export async function POST(req) {
  try {
    // In production, you would add authentication here
    // For example, check for an admin token
    
    const result = await addDatabaseIndexes();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database migrations completed successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}