import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteAnalytics from "@/components/SiteAnalytics";
import {
  getPublishedCaseStudies,
  getPublishedPosts,
} from "@/lib/data";

/** Public chrome: skip link, nav, footer, analytics (not used under /admin). */
export default async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [posts, cases] = await Promise.all([
    getPublishedPosts(),
    getPublishedCaseStudies(),
  ]);
  const showBlog = (posts?.length ?? 0) >= 1;
  const showWork = (cases?.length ?? 0) >= 1;

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar showBlog={showBlog} showWork={showWork} />
      <div id="main-content" tabIndex={-1} className="pt-16 focus:outline-none">
        {children}
      </div>
      <Footer showBlog={showBlog} showWork={showWork} />
      <SiteAnalytics />
    </>
  );
}
