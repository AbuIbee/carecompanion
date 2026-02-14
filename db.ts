import { supabase } from "@/lib/supabase";

export async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Not logged in");
  return data.user.id;
}

export async function listMyPatients() {
  // Patients you are linked to via care_relationships
  const { data, error } = await supabase
    .from("care_relationships")
    .select("patient:patients(id, display_name, date_of_birth, created_at)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // flatten
  return (data ?? [])
    .map((row: any) => row.patient)
    .filter(Boolean);
}

export async function createPatient(input: { display_name: string; date_of_birth?: string }) {
  const userId = await getUserId();

  const { data: patient, error: pErr } = await supabase
    .from("patients")
    .insert({
      created_by: userId,
      display_name: input.display_name,
      date_of_birth: input.date_of_birth ?? null,
    })
    .select()
    .single();

  if (pErr) throw pErr;

  const { error: rErr } = await supabase
    .from("care_relationships")
    .insert({
      patient_id: patient.id,
      caregiver_id: userId,
      role: "primary",
    });

  if (rErr) throw rErr;

  return patient;
}

export async function listNotes(patientId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("id, body, created_at, author_id")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addNote(patientId: string, body: string) {
  const userId = await getUserId();

  const { error } = await supabase.from("notes").insert({
    patient_id: patientId,
    author_id: userId,
    body,
  });

  if (error) throw error;
}
