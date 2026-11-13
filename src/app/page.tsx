import { LogoStage } from "@/components/LogoStage";
import { findMedia } from "@/lib/media";

export default function Home() {
  return <LogoStage media={findMedia()} />;
}
