import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();

  if (!body.rider_id) {
    return NextResponse.json(
      { error: "rider_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("deliveries")
    .update({
      rider_id: body.rider_id,
      status: "ASSIGNED",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Rider assigned successfully",
    data,
  });
}