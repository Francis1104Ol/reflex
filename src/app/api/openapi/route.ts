import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",

  info: {
    title: "Reflex Delivery Operations API",
    version: "1.0.0",
    description:
      "REST API for managing retail delivery requests, rider assignments, and delivery status.",
  },
  servers: [
    {
      url: "https://reflex-dbahe9o4p-the-nation.vercel.app",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Deliveries",
      description: "Create, view, assign, and update deliveries.",
    },
  ],