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
   paths: {
    "/api/deliveries": {
      get: {
        tags: ["Deliveries"],
        summary: "List deliveries",
        description:
          "Returns delivery requests available to the authenticated user.",

        responses: {
          "200": {
            description: "Deliveries retrieved successfully",

            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Delivery",
                  },
                },
              },
            },
          },

          "401": {
            description: "Unauthorized",
          },
        },
      },
      post: {
        tags: ["Deliveries"],
        summary: "Create a delivery request",
        description:
          "Creates a new delivery request for a retailer.",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateDelivery",
              },
            },
          },
        },

        responses: {
          "201": {
            description: "Delivery created successfully",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Delivery",
                },
              },
            },
          },

          "400": {
            description: "Invalid request",
          },

          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
