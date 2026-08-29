import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",

  info: {
    title: "Reflex Delivery Operations API",
    version: "1.0.0",
    description:
      "REST API for managing retail delivery requests, rider assignments, and delivery status.",
  },