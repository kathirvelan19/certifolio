import { useGetPortfolio } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { MapPin, Link as LinkIcon, Github, Linkedin, Briefcase, FileText, Calendar, Eye, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function PortfolioView() {
  const { username } = useParams();
  
  const { data: portfolio, isLoading, isError } = useGetPortfolio(username || "", {
    query: {
      enabled: !!username,
      queryKey: ["getPortfolio", username]
    }
  });

  if (isError) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-slate-50/50">
        <PublicHeader />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertTitle>Portfolio Not Found</AlertTitle>
            <AlertDescription>
              We couldn't find a portfolio for "{username}". They may not exist or haven't set up their profile yet.
            </AlertDescription>
          </Alert>
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { user, certificates } = portfolio || {};

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50/50">
      <PublicHeader />
      
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-4 flex-1 w-full max-w-xl">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ) : user ? (
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg ring-1 ring-gray-100">
                <AvatarImage src={user.profileImageUrl || undefined} alt={user.name || user.username} />
                <AvatarFallback className="text-4xl bg-primary text-white font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-primary mb-1">
                  {user.name || user.username}
                </h1>
                <p className="text-muted-foreground font-medium mb-4">@{user.username}</p>
                
                {user.bio && (
                  <p className="text-gray-700 max-w-2xl mb-6 leading-relaxed">
                    {user.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-sm font-medium">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors flex items-center gap-1.5 text-sm font-medium">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {user.leetcode && (
                    <a href={user.leetcode} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#FFA116] transition-colors flex items-center gap-1.5 text-sm font-medium">
                      <Briefcase className="h-4 w-4" /> LeetCode
                    </a>
                  )}
                  {user.resumeUrl && (
                    <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                      <FileText className="h-4 w-4" /> View Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">Verified Certificates</h2>
          <p className="text-muted-foreground mt-1">
            {certificates?.length || 0} credentials showcased
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden border-gray-100 shadow-sm">
                <Skeleton className="h-40 w-full rounded-none" />
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-5 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : certificates && certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col hover:-translate-y-1">
                <Link href={`/certificate/${cert.id}`} className="block flex-1 flex flex-col cursor-pointer">
                  <div className="h-40 bg-gray-100 relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
                    {cert.fileType?.includes('image') ? (
                      <img src={`/api/storage${cert.fileUrl}`} alt={cert.title} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <span className="text-sm font-medium">PDF Document</span>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-primary line-clamp-2 mb-1 group-hover:text-accent transition-colors" title={cert.title}>
                      {cert.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{cert.issuer}</p>
                    
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {cert.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(cert.createdAt), "MMM yyyy")}
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white border-dashed border-2 border-gray-200 shadow-none text-center py-16">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-muted-foreground mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">No certificates yet</h3>
              <p className="text-muted-foreground max-w-sm">
                This user hasn't uploaded any certificates to their portfolio yet.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function Award(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}