import AboutPage from "@/components/about";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:'About Us'
};

export default async function AboutSection(){
    return (
        <AboutPage />
    )
}