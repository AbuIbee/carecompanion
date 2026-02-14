import { useApp } from "@/store/AppContext";
import { useAllPatients } from "@/hooks/useSelectedPatient";
import { useEffect, useState } from "react";
import { listMyPatients, createPatient } from "@/lib/db";

import {
  Users,
  AlertTriangle,
  Pill,
  Heart,
  Calendar,
  ChevronRight,
  Plus,
  Activity,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

interface MultiPatientDashboardProps {
  onSelectPatient: (patientId: string) => void;
}

export default function MultiPatientDashboard({
  onSelectPatient,
}: MultiPatientDashboardProps) {
  const { state } = useApp();

  // ✅ Keep your existing mock data for now so the rest of the dashboard doesn't break
  const allPatients = useAllPatients();

  // ✅ NEW: Supabase-backed patients list
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const rows = await listMyPatients();
        setPatients(rows);
      } catch (e) {
        console.error("Failed to load patients", e);
      } finally {
        setLoadingPatients(false);
      }
    })();
  }, []);

  const onAddPatient = async () => {
    try {
      const p = await createPatient({ display_name: "New Patient" });
      setPatients((prev) => [p, ...prev]);
    } catch (e) {
      console.error("Failed to create patient", e);
    }
  };

  // Existing aggregated stats (mock)
  const totalPatients = allPatients.length;
  const totalAlerts = allPatients.reduce(
    (sum, p) => sum + p.alerts.filter((a) => !a.isRead).length,
    0
  );
  const redAlerts = allPatients.reduce(
    (sum, p) =>
      sum +
      p.safetyAlerts.filter((a) => a.category === "red" && !a.isResolved).length,
    0
  );
  const yellowAlerts = allPatients.reduce(
    (sum, p) =>
      sum +
      p.safetyAlerts.filter(
        (a) => a.category === "yellow" && !a.isResolved
      ).length,
    0
  );
  const pendingMedications = allPatients.reduce(
    (sum, p) => sum + p.medicationLogs.filter((m) => m.status === "pending").length,
    0
  );

  const getStatusIndicator = (patientData: typeof allPatients[0]) => {
    const hasRed = patientData.safetyAlerts.some(
      (a) => a.category === "red" && !a.isResolved
    );
    const hasYellow = patientData.safetyAlerts.some(
      (a) => a.category === "yellow" && !a.isResolved
    );

    if (hasRed)
      return (
        <span className="px-2 py-1 bg-gentle-coral/10 text-gentle-coral text-xs rounded-full font-medium">
          Needs Attention
        </span>
      );
    if (hasYellow)
      return (
        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
          Monitor
        </span>
      );
    return (
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
        Stable
      </span>
    );
  };

  const getPriorityColor = (patientData: typeof allPatients[0]) => {
    const hasRed = patientData.safetyAlerts.some(
      (a) => a.category === "red" && !a.isResolved
    );
    const hasYellow = patientData.safetyAlerts.some(
      (a) => a.category === "yellow" && !a.isResolved
    );
    const hasAlerts = patientData.alerts.some((a) => !a.isRead);

    if (hasRed) return "border-l-4 border-l-gentle-coral";
    if (hasYellow || hasAlerts) return "border-l-4 border-l-amber-400";
    return "border-l-4 border-l-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-warm-bronze to-warm-bronze/80 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {state.currentUser?.firstName}
        </h1>
        <p className="text-white/80 text-lg">
          You have {totalPatients} patients under your care
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-soft-taupe"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-medium-gray text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-charcoal">{totalPatients}</p>
            </div>
            <div className="w-12 h-12 bg-warm-bronze/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-warm-bronze" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-soft-taupe"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-medium-gray text-sm">Urgent Alerts</p>
              <p
                className={`text-3xl font-bold ${
                  redAlerts > 0 ? "text-gentle-coral" : "text-charcoal"
                }`}
              >
                {redAlerts}
              </p>
            </div>
            <div className="w-12 h-12 bg-gentle-coral/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-gentle-coral" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-soft-taupe"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-medium-gray text-sm">Monitor Alerts</p>
              <p
                className={`text-3xl font-bold ${
                  yellowAlerts > 0 ? "text-amber-600" : "text-charcoal"
                }`}
              >
                {yellowAlerts}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-soft-taupe"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-medium-gray text-sm">Pending Meds</p>
              <p
                className={`text-3xl font-bold ${
                  pendingMedications > 0 ? "text-amber-600" : "text-charcoal"
                }`}
              >
                {pendingMedications}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ✅ NEW: Supabase Patients Grid (MVP) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-charcoal">Your Patients (Database)</h2>
          <button
            onClick={onAddPatient}
            className="flex items-center gap-2 px-4 py-2 bg-warm-bronze text-white rounded-xl hover:bg-warm-bronze/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>

        {loadingPatients ? (
          <div className="p-4">Loading patients…</div>
        ) : patients.length === 0 ? (
          <div className="p-4 bg-soft-taupe/20 rounded-xl border border-soft-taupe">
            No patients yet. Click <b>Add Patient</b> to create your first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectPatient(p.id)}
                className="bg-white rounded-xl p-6 shadow-sm border border-soft-taupe cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-charcoal">{p.display_name}</h3>
                    <p className="text-sm text-medium-gray">
                      {p.date_of_birth ? `DOB: ${p.date_of_birth}` : "DOB not set"}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-medium-gray" />
                </div>

                <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-soft-taupe/30 hover:bg-soft-taupe/50 rounded-lg transition-colors text-charcoal font-medium text-sm">
                  <span>View Timeline</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Existing Patient Cards Grid (mock) */}
      <div>
        <h2 className="text-xl font-semibold text-charcoal mb-4">
          Your Patients (Mock UI — will be replaced later)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPatients.map((patientData, index) => {
            const unreadAlerts = patientData.alerts.filter((a) => !a.isRead).length;
            const pendingMeds = patientData.medicationLogs.filter((m) => m.status === "pending").length;
            const todayMood = patientData.moodEntries[0];
            const nextAppointment = patientData.appointments[0];

            return (
              <motion.div
                key={patientData.patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectPatient(patientData.patient.id)}
                className={`bg-white rounded-xl p-6 shadow-sm border border-soft-taupe cursor-pointer hover:shadow-md transition-all ${getPriorityColor(
                  patientData
                )}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-soft-taupe flex items-center justify-center overflow-hidden">
                      <span className="text-charcoal font-medium text-lg">
                        {patientData.patient.firstName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal">
                        {patientData.patient.firstName} {patientData.patient.lastName}
                      </h3>
                      <p className="text-sm text-medium-gray capitalize">
                        {patientData.patient.dementiaStage} stage dementia
                      </p>
                    </div>
                  </div>
                  {getStatusIndicator(patientData)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Pill className="w-4 h-4 text-medium-gray" />
                    <span className="text-charcoal">
                      {pendingMeds} pending medication{pendingMeds !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {todayMood && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-medium-gray" />
                      <span className="text-charcoal capitalize">
                        Feeling {todayMood.mood} today
                      </span>
                    </div>
                  )}

                  {nextAppointment && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-medium-gray" />
                      <span className="text-charcoal">
                        Next: {nextAppointment.title} on {nextAppointment.date}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-medium-gray" />
                    <span className="text-charcoal">
                      {patientData.tasks.filter((t) => t.status === "completed").length}/
                      {patientData.tasks.length} tasks today
                    </span>
                  </div>
                </div>

                {unreadAlerts > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-gentle-coral/10 text-gentle-coral text-xs rounded-full font-medium">
                      {unreadAlerts} alert{unreadAlerts !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                <button className="w-full flex items-center justify-center gap-2 py-2 bg-soft-taupe/30 hover:bg-soft-taupe/50 rounded-lg transition-colors text-charcoal font-medium text-sm">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
