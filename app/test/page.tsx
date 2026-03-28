
"use client"

import { supabase } from "@/lib/supabase/client"

export default function TestPage() {
  async function testSupabase() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")

    console.log("DATA:", data)
    console.log("ERROR:", error)
  }

  return (
    <div className="p-8">
      <button
        onClick={testSupabase}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Test Supabase
      </button>
    </div>
  )
}