export const metadata = {
  title: "Solar Design Tool | Solar Owl",
  description:
    "Design your custom solar panel installation. View satellite imagery of your rooftop, auto-generate panel layouts, and calculate energy savings instantly.",
};

export default function SolarDesignLayout({ children }) {
  return (
    <div className="solar-design-root">
      {children}
    </div>
  );
}
