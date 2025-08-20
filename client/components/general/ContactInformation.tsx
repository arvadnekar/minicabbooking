'use client';

import { Github, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function ContactInformation(){
    return (
        <>
        <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
        <div className="space-y-6">
              <div className="flex items-center gap-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-medium ">Email</span>
                  <Link href={'mailto:akankshavadnerkar00@gmail.com'}>akankshavadnerkar00@gmail.com</Link>
                </div>
              </div>
              
              <div className="flex items-center gap-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-medium">Phone</span>
                  <Link href={'tel:+1-709-853-5214'}>+1 (709) 853-5211</Link>
                </div>
              </div>
              
              <div className="flex items-center gap-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-medium">Location</span>
                  <span className="text-muted-foreground">Canada</span>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold my-4 ">Follow Me</h3>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
            </div>
            </>
    )
}