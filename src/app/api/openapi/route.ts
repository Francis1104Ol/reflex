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

    "/api/deliveries/{id}/status": {
      patch: {
        tags: ["Deliveries"],
        summary: "Update delivery status",
        description:
          "Updates the current status of a delivery.",

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
                $ref: "#/components/schemas/UpdateStatus",
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Status updated successfully",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Delivery",
                },
              },
            },
          },

          "400": {
            description: "Invalid status",
          },

          "401": {
            description: "Unauthorized",
          },

          "404": {
            description: "Delivery not found",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Delivery: {
        type: "object",

        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "8b7c3e3a-7b4a-4a5f-9d2b-123456789abc",
          },

          reference: {
            type: "string",
            example: "RX-123456",
          },

          customer_name: {
            type: "string",
            example: "James Kamau",
          },

          customer_phone: {
            type: "string",
            example: "0712345678",
          },

          address: {
            type: "string",
            example: "Westlands, Nairobi",
          },

          item_description: {
            type: "string",
            example: "Samsung Galaxy A55",
          },

          status: {
            type: "string",
            enum: [
              "PENDING",
              "ASSIGNED",
              "PICKED_UP",
              "IN_TRANSIT",
              "DELIVERED",
            ],
            example: "PENDING",
          },

          rider_id: {
            type: "string",
            format: "uuid",
            nullable: true,
            example: "c8f5b3a2-9c44-4c7a-8a12-123456789abc",
          },
        },
      },

      CreateDelivery: {
        type: "object",

        required: [
          "customer_name",
          "customer_phone",
          "address",
          "item_description",
        ],

        properties: {
          customer_name: {
            type: "string",
            example: "James Kamau",
          },

          customer_phone: {
            type: "string",
            example: "0712345678",
          },

          address: {
            type: "string",
            example: "Westlands, Nairobi",
          },

          item_description: {
            type: "string",
            example: "Samsung Galaxy A55",
          },
        },
      },

      AssignRider: {
        type: "object",

        required: ["rider_id"],

        properties: {
          rider_id: {
            type: "string",
            format: "uuid",
            example: "c8f5b3a2-9c44-4c7a-8a12-123456789abc",
          },
        },
      },

      UpdateStatus: {
        type: "object",

        required: ["status"],

        properties: {
          status: {
            type: "string",

            enum: [
              "PENDING",
              "ASSIGNED",
              "PICKED_UP",
              "IN_TRANSIT",
              "DELIVERED",
            ],

            example: "PICKED_UP",
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}