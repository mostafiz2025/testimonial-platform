import WallView from "@/components/public/WallView";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WallView slug={slug} embed />;
}
