import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteAnalytics from "@/components/SiteAnalytics";
import {
  getPublishedCaseStudies,
  getPublishedPosts,
  getPublishedServiceDetails,
} from "@/lib/data";

/** Public chrome: skip link, nav, footer, analytics (not used under /admin). */
export default async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [posts, cases, serviceRows] = await Promise.all([
    getPublishedPosts(),
    getPublishedCaseStudies(),
    getPublishedServiceDetails(),
  ]);
  const showBlog = (posts?.length ?? 0) >= 1;
  const showWork = (cases?.length ?? 0) >= 1;
  // Footer lists published service pages only (same gate as the detail route).
  const services = (serviceRows ?? [])
    .filter((row) => row.slug)
    .slice(0, 6)
    .map((row) => ({ title: row.title, href: `/services/${row.slug}` }));

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar showBlog={showBlog} showWork={showWork} />
      <div id="main-content" tabIndex={-1} className="pt-[calc(var(--nav-h)+env(safe-area-inset-top,0px))] focus:outline-none">
        {children}
      </div>
      <Footer showBlog={showBlog} showWork={showWork} services={services} />
      <SiteAnalytics />
    </>
  );
}
