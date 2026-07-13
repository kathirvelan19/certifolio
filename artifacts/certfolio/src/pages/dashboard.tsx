import { Navbar } from "@/components/layout/navbar";
import { useListCertificates, useGetCertificateStats, useDeleteCertificate } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { Eye, FileText, ExternalLink, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

function StatsCards() {
  const { data: stats, isLoading, isError } = useGetCertificateStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !stats) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
          <FileText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats.total}</div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats.totalViews}</div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
          <AwardIcon className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-primary truncate">
            {Array.isArray(stats.byCategory) && stats.byCategory.length > 0
              ? [...stats.byCategory].sort((a, b) => b.count - a.count)[0].category 
              : "None"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Array.isArray(stats.byCategory) && stats.byCategory.length > 0
              ? `${[...stats.byCategory].sort((a, b) => b.count - a.count)[0].count} certificates` 
              : "Upload certificates to see stats"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AwardIcon(props: any) {
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

export default function Dashboard() {
  const { data: certificates, isLoading, isError, refetch } = useListCertificates();
  const deleteCertificate = useDeleteCertificate();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) return;
    
    setDeletingId(id);
    deleteCertificate.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Certificate deleted",
            description: "The certificate has been successfully removed.",
          });
          refetch();
          queryClient.invalidateQueries({ queryKey: ["getCertificateStats"] });
          setDeletingId(null);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Delete failed",
            description: "There was an error deleting your certificate. Please try again.",
          });
          setDeletingId(null);
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50/50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Your Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage and track your professional credentials.</p>
          </div>
          <Link href="/upload">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm">
              Add New Certificate
            </Button>
          </Link>
        </div>

        <StatsCards />

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">All Certificates</h2>
        </div>

        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load your certificates. Please try again later.</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="overflow-hidden border-gray-100 shadow-sm">
                <Skeleton className="h-40 w-full rounded-none" />
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : certificates && certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="h-40 bg-gray-100 relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
                  {cert.fileType?.includes('image') ? (
                    <img src={`/api/storage${cert.fileUrl}`} alt={cert.title} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-12 w-12 text-gray-300 mb-2" />
                      <span className="text-sm font-medium">PDF Document</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-primary shadow-sm flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {cert.viewCount}
                  </div>
                </div>
                
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg text-primary line-clamp-1 mb-1 group-hover:text-accent transition-colors" title={cert.title}>{cert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{cert.issuer}</p>
                  
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {cert.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(cert.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                  <Link href={`/certificate/${cert.id}`} className="text-sm font-medium text-primary hover:text-accent flex items-center transition-colors">
                    View Details <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(cert.id)}
                    disabled={deletingId === cert.id}
                  >
                    {deletingId === cert.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white border-dashed border-2 border-gray-200 shadow-none text-center py-16">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-primary mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">No certificates yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Upload your first certificate to start building your professional portfolio.
              </p>
              <Link href="/upload">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Upload Certificate
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
