import { SiteFooter } from "@/components/SiteFooter";
import { MotionRoot } from "@/components/motion/MotionRoot";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
      <MotionRoot />
    </>
  );
}
