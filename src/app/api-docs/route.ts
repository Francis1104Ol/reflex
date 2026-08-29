import { ApiReference } from "@scalar/nextjs-api-reference";

const config = {
  url: "/api/openapi",
  theme: "purple" as const,
};

export async function GET() {
  return ApiReference(config)();
}