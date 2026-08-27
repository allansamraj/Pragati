import { NextRequest, NextResponse } from "next/server";
import { getNearbyFacilities } from "@/lib/services/facilityService";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const lat = parseFloat(searchParams.get("latitude") || searchParams.get("lat") || "21.3734");
  const lng = parseFloat(searchParams.get("longitude") || searchParams.get("lng") || "74.2404");
  const radius = searchParams.get("radius") ? parseInt(searchParams.get("radius")!, 10) : 10;
  const facilityType = (searchParams.get("facilityType")?.toUpperCase() as any) || "ALL";
  const service = searchParams.get("service") || "";
  const specialty = searchParams.get("specialty") || "";
  const locality = searchParams.get("locality") || "Near You";

  try {
    const result = await getNearbyFacilities({
      lat,
      lng,
      locality,
      initialRadiusKm: radius,
      facilityType: facilityType === "GOVERNMENT" ? "GOVERNMENT" : facilityType === "PRIVATE" ? "PRIVATE" : "ALL",
      service,
      specialty,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve nearby healthcare facilities" },
      { status: 500 }
    );
  }
}
