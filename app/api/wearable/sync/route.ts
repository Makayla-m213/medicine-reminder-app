import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceID, studentId, reminders } = body;

    // Validate required fields
    if (!deviceID) {
      return NextResponse.json(
        { success: false, error: 'deviceID required' },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'studentId required' },
        { status: 400 }
      );
    }

    if (!reminders || !Array.isArray(reminders) || reminders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'reminders array required' },
        { status: 400 }
      );
    }

    let recordsInserted = 0;

    for (const reminder of reminders) {
      try {
        // Validate reminder fields
        if (!reminder.time || !reminder.med || !reminder.status) {
          console.error('Missing fields in reminder:', reminder);
          continue;
        }

        // Map device status to your status format
        let prescriptionStatus: 'pending' | 'completed' | 'missed' = 'pending';
        if (reminder.status === 'TAKEN') prescriptionStatus = 'completed';
        if (reminder.status === 'SKIPPED') prescriptionStatus = 'missed';

        // Format time from "1000" to "10:00"
        const formattedTime = `${reminder.time.slice(0,2)}:${reminder.time.slice(2,4)}`;

        // INSERT new prescription record
        await fetchMutation(api.prescriptions.addPrescription, {
          studentId: studentId,
          title: reminder.med,
          dosage: "from_wearable",
          time: formattedTime,
          status: prescriptionStatus,
          dateLogged: new Date().toISOString(),
        });
        
        recordsInserted++;
      } catch (err) {
        console.error('Error inserting prescription:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${recordsInserted} prescription records inserted successfully`,
      recordsInserted,
      studentId,
      deviceID,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    );
  }
}