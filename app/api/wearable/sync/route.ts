import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery, fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceID, reminders } = body;

    if (!deviceID) {
      return NextResponse.json(
        { success: false, error: 'deviceID required' },
        { status: 400 }
      );
    }

    let recordsProcessed = 0;

    if (reminders && Array.isArray(reminders)) {
      for (const reminder of reminders) {
        try {
          const allPrescriptions = await fetchQuery(api.prescriptions.getAllPrescriptions);
          const matchingPrescription = allPrescriptions.find((p: any) => {
            const formattedTime = p.time.replace(':', '');
            return p.title === reminder.med && formattedTime === reminder.time;
          });

          if (matchingPrescription) {
            let finalStatus: 'pending' | 'completed' | 'missed' = 'pending';
            if (reminder.status === 'TAKEN') finalStatus = 'completed';
            if (reminder.status === 'SKIPPED') finalStatus = 'missed';
            
            await fetchMutation(api.prescriptions.updatePrescriptionStatus, {
              prescriptionId: matchingPrescription._id,
              status: finalStatus,
            });
            recordsProcessed++;
          }
        } catch (err) {
          console.error('Error processing reminder:', err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sync successful',
      recordsProcessed,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    );
  }
}