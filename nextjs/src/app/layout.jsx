import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tyakkai Social - Social Media Management",
  description: "AI-powered social media management for small businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add Bootstrap CSS directly via link tag */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
          crossOrigin="anonymous"
        />
        {/* Make sure our custom CSS loads AFTER Bootstrap to override it */}
        <style>{`
          :root {
            --bs-primaryrgb(197, 178, 34) !important;
            --bs-primary-rgb: 106, 34, 197 !important;
          }
          .bg-primary {
            background-color: #0B7077 !important;
          }
          .text-primary {
            color: #0B7077 !important;
          }
          .btn-primary {
            background-color: #0B7077 !important;
            border-color: #0B7077 !important;
          }
          .btn-outline-primary {
            color: #0B7077 !important;
            border-color: #0B7077 !important;
          }
          .btn-outline-primary:hover {
            background-color: #0B7077 !important;
            color: white !important;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        {children}

        {/* Add Bootstrap JS directly via script tag */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
