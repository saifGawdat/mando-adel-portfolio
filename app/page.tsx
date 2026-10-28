import Site from "@/components/Site";
import { getSiteContent } from "@/lib/works";

export const dynamic = "force-dynamic";

export default async function Page() {
  const site = await getSiteContent();
  return <Site site={site} />;
}
