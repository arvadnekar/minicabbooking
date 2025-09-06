import Contact from "@/components/contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:'Contact Us'
};

export default async function ContactPage(){
    return (
        <Contact />
    )
}