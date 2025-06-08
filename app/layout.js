import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Outfit } from "next/font/google";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";
import { UserDetailProvider } from "./_context/UserDetailContext";

export const metadata = {
  title: "📚 StudyGenie",
  description: "Generative AI Study Material Generator",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
    },
  },
  manifest: "/manifest.json",
  themeColor: "#4F46E5",
};

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{ baseTheme: outfit.className }}
      dynamic={true}
    >
      <UserDetailProvider>
        <html lang="en">
          <body className={outfit.className}>
            <Provider>{children}</Provider>
            <Toaster />
          </body>
        </html>
      </UserDetailProvider>
    </ClerkProvider>
  );
}
