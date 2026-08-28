import { NextRequest, NextResponse } from "next/server";
import { getNearbyFacilities } from "@/lib/services/facilityService";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const lat = parseFloat(searchParams.get("latitude") || searchParams.get("lat") || "13.0827");
  const lng = parseFloat(searchParams.get("longitude") || searchParams.get("lng") || "80.2707");
  const radius = searchParams.get("radius") ? parseInt(searchParams.get("radius")!, 10) : undefined;
  const facilityType = (searchParams.get("facilityType")?.toUpperCase() as any) || "ALL";
  const service = searchParams.get("service") || "";
  const specialty = searchParams.get("specialty") || "";
  const locality = searchParams.get("locality") || "Near You";
  const sortBy = (searchParams.get("sortBy") as any) || "nearest";

  try {
    const result = await getNearbyFacilities({
      lat,
      lng,
      locality,
      initialRadiusKm: 5,
      customRadiusKm: radius,
      facilityType: facilityType === "GOVERNMENT" ? "GOVERNMENT" : facilityType === "PRIVATE" ? "PRIVATE" : "ALL",
      service,
      specialty,
      sortBy,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve nearby healthcare facilities" },
      { status: 500 }
    );
  }
}
