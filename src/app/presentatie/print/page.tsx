import { BrandPrint } from "@/brand-deck/BrandDeck";
import { findDeckMedia } from "@/brand-deck/media";

/** Every slide stacked in its final state. The PDF is printed from this page. */
export default function Print() {
  return <BrandPrint media={findDeckMedia()} />;
}
