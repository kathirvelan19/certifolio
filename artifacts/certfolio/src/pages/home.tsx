import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/public-header";
import { ShieldCheck, Share2, Award, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50/50">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-amber-700 mb-8">
              <Award className="h-4 w-4 mr-2" />
              Your professional credential wallet
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary mb-6 max-w-4xl mx-auto leading-[1.1]">
              Own your achievements. <br className="hidden sm:block" />
              <span className="text-accent">Share them with pride.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Certfolio is the elegant way for students to store, organize, and showcase certificates. Create a professional portfolio recruiters will actually want to look at.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-white shadow-lg w-full sm:w-auto">
                  Start your portfolio <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white w-full sm:w-auto border-gray-200">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary mb-6">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Secure Storage</h3>
                <p className="text-muted-foreground">Upload PDFs or images of your hard-earned certificates. We keep them safe, organized, and easily accessible anytime.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-accent mb-6">
                  <Share2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Instant Sharing</h3>
                <p className="text-muted-foreground">Generate public links and QR codes for individual certificates to attach to your resume or LinkedIn profile.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Beautiful Portfolio</h3>
                <p className="text-muted-foreground">Curate a stunning public profile page showcasing all your verified skills and courses in one impressive view.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <span className="text-primary font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Certfolio</span>
          </div>
          <p className="text-indigo-200 text-sm">
            © {new Date().getFullYear()} Certfolio. Built for students.
          </p>
        </div>
      </footer>
    </div>
  );
}