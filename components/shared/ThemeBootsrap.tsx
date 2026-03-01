import Script from "next/script";

export default function ThemeBootstrap() {
  return (
    <Script id="theme-bootstrap" strategy="beforeInteractive">
      {`
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
    `.trim()}
    </Script>
  );
}
