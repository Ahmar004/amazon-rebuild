import { getDepartments } from "@/lib/data/departments";

// Step-5 placeholder: proves the deployed app reaches the seeded database.
// Replaced by the Amazon home page in Slice 2 (docs/design.md section 9).
export default async function Home() {
  const departments = await getDepartments();
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Departments</h1>
      <ul>
        {departments.map((d) => (
          <li key={d.id}>{d.name}</li>
        ))}
      </ul>
    </main>
  );
}
