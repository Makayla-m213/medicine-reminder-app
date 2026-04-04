'use client';

import { Id } from "@/convex/_generated/dataModel";

// This matches your Convex schema
interface ConvexPrescription {
  _id: Id<"prescriptions">;
  title: string;
  dosage: string;
  time: string;
  status: "pending" | "completed" | "missed";
  dateLogged: string;
}

interface PrescriptionTimelineProps {
  prescriptions: ConvexPrescription[] | undefined;
}

export default function PrescriptionTimeline({ prescriptions }: PrescriptionTimelineProps) {
  // Handle loading/empty states
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Medicine History</h2>
        <p className="text-gray-500 text-center py-8">No prescriptions yet</p>
      </div>
    );
  }

  const sortedPrescriptions = [...prescriptions].sort((a, b) => {
    return new Date(a.dateLogged).getTime() - new Date(b.dateLogged).getTime();
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Medicine History</h2>

      <div className="space-y-4">
        {sortedPrescriptions.map((prescription, index) => (
          <div key={prescription._id} className="flex gap-4">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  prescription.status === 'completed'
                    ? 'bg-green-500'
                    : prescription.status === 'pending'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              ></div>
              {index < sortedPrescriptions.length - 1 && (
                <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">
                  {prescription.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    prescription.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : prescription.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {prescription.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Dosage: {prescription.dosage}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Scheduled: {prescription.time}
              </p>
              {prescription.status === 'completed' && (
                <p className="text-xs text-gray-500">
                  Taken on {new Date(prescription.dateLogged).toLocaleDateString()}
                </p>
              )}
              {prescription.status === 'missed' && (
                <p className="text-xs text-red-600 font-medium">
                  Not taken by {prescription.time}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}