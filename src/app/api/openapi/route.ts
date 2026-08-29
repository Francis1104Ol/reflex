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

     "/api/deliveries/{id}/assign": {
      patch: {
        tags: ["Deliveries"],
        summary: "Assign a rider",
        description:
          "Assigns a registered rider to a delivery and changes its status to ASSIGNED.",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Delivery database UUID",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AssignRider",
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Rider assigned successfully",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Delivery",
                },
              },
            },
          },

          "400": {
            description: "Invalid rider ID",
          },

          "401": {
            description: "Unauthorized",
          },

          "404": {
            description: "Delivery or rider not found",
          },
        },
      },
    },
