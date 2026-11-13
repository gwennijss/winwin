import { Suspense } from "react";
import { BrandDeck } from "@/brand-deck/BrandDeck";
import { findDeckMedia } from "@/brand-deck/media";
import { slugs } from "@/brand-deck/slugs";

export function generateStaticParams() {
  return [{ slide: [] }, ...slugs.map((slug) => ({ slide: [slug] }))];
}

type Props = PageProps<"/presentatie/[[...slide]]">;

async function Resolved({ params }: Pick<Props, "params">) {
  const { slide } = await params;
  return <BrandDeck initialSlug={slide?.[0]} media={findDeckMedia()} />;
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 bg-[#252526]" />}>
      <Resolved params={params} />
    </Suspense>
  );
}
