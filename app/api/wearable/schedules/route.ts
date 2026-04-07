import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get('deviceId');

  if (!deviceId) {
    return NextResponse.json(
      { success: false, error: 'deviceId required' },
      { status: 400 }
    );
  }

  try {
    const allPrescriptions = await fetchQuery(api.prescriptions.getAllPrescriptions);
    const allStudents = await fetchQuery(api.students.getAllStudents);
    
    const reminders = allPrescriptions.map((prescription: any) => {
      return {
        time: prescription.time.replace(':', ''),
        med: prescription.title,
        status: prescription.status.toUpperCase(),
      };
    });

    return NextResponse.json({
      deviceID: deviceId,
      reminders: reminders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}