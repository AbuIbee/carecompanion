import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addNote, listNotes } from "@/lib/db";

export default function PatientTimeline() {
  const { id } = useParams();
  const patientId = id as string;

  const [notes, setNotes] = useState<any[]>([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    (async () => {
      const n = await listNotes(patientId);
      setNotes(n);
    })();
  }, [patientId]);

  const onAdd = async () => {
    if (!body.trim()) return;
    await addNote(patientId, body.trim());
    setBody("");
    setNotes(await listNotes(patientId));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a note…"
        />
        <button className="px-4 py-2 rounded-lg border" onClick={onAdd}>
          Add Note
        </button>
      </div>

      <div className="space-y-3">
        {notes.map((n) => (
          <div key={n.id} className="border rounded-xl p-4 bg-white">
            <div className="text-sm opacity-70">
              {new Date(n.created_at).toLocaleString()}
            </div>
            <div className="mt-2 whitespace-pre-wrap">{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
