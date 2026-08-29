import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
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

  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      id,
      reference,
      customer_name,
      customer_phone,
      address,
      item_description,
      status,
      retailer_id,
      rider_id,
      created_at,
      updated_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
  });
}

export async function POST(request: NextRequest) {
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

  const body = await request.json();

  const {
    customer_name,
    customer_phone,
    address,
    item_description,
  } = body;

  if (
    !customer_name ||
    !customer_phone ||
    !address ||
    !item_description
  ) {
    return NextResponse.json(
      {
        error:
          "customer_name, customer_phone, address and item_description are required",
      },
      { status: 400 }
    );
  }

  const reference = `RX-${Date.now()
    .toString()
    .slice(-6)}`;

  const { data, error } = await supabase
    .from("deliveries")
    .insert({
      reference,
      customer_name,
      customer_phone,
      address,
      item_description,
      status: "PENDING",
      retailer_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Delivery created successfully",
      data,
    },
    { status: 201 }
  );
}