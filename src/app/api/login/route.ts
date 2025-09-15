import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data, error } = await supabase
    .from("owners")
    .select("id, fullname, email, role, password, displayimage")
    .eq("email", email)
    .single();

  if (error || !data || data.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Don’t return password to client
  const { password: _, ...user } = data;

  return NextResponse.json({ data: user });
}