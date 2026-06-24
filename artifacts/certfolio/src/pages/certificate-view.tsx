import { useGetCertificate } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Award, Calendar, Share2, Download, ExternalLink, ShieldCheck, Building2, Eye, Link as LinkIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function CertificateView() {
  const { id } = useParams();
  const certId = parseInt(id || "0");
  const { toast } = useToast();

  const { data: cert, isLoading, isError } = useGetCertificate(certId, {
    query: {
      enabled: certId > 0,
      queryKey: ["getCertificate", certId]
    }
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Certificate link has been copied to your clipboard.",
    });
  };

  if (isError) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-slate-50/50">
        <PublicHeader />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              This certificate could not be found or you don't have permission to view it.
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

  const isPdf = cert?.fileType?.includes('pdf');
  const fileUrl = cert?.fileUrl ? `/api/storage${cert.fileUrl}` : '';

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50/50">
      <PublicHeader />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Certificate Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] lg:h-[800px]">
              <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-5 w-5 text-indigo-200" />
                  <span>Verified Credential</span>
                </div>
                {cert && (
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white" asChild>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Full Screen
                    </a>
                  </Button>
                )}
              </div>
              
              <div className="flex-1 bg-gray-100/50 relative overflow-hidden flex items-center justify-center p-4">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : cert ? (
                  isPdf ? (
                    <iframe 
                      src={`${fileUrl}#toolbar=0`} 
                      className="w-full h-full rounded shadow-sm bg-white"
                      title={cert.title}
                    />
                  ) : (
                    <img 
                      src={fileUrl} 
                      alt={cert.title} 
                      className="max-w-full max-h-full object-contain rounded shadow-sm bg-white"
                    />
                  )
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Sidebar - Details */}
          <div className="space-y-6">
            <Card className="border-gray-100 shadow-sm border-t-4 border-t-primary">
              <CardContent className="p-6 sm:p-8">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ) : cert ? (
                  <>
                    <div className="mb-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-4">
                        {cert.category}
                      </span>
                      <h1 className="text-2xl font-bold text-primary mb-2 leading-tight">
                        {cert.title}
                      </h1>
                      <div className="flex items-center text-muted-foreground mt-4">
                        <Building2 className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">{cert.issuer}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Added</span>
                        </div>
                        <span className="font-medium text-foreground">
                          {format(new Date(cert.createdAt), "MMMM d, yyyy")}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Eye className="h-4 w-4 mr-2" />
                          <span>Views</span>
                        </div>
                        <span className="font-medium text-foreground">
                          {cert.viewCount}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-8 space-y-3">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white" asChild>
                        <a href={fileUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3 pt-6 px-6">
                <h3 className="font-semibold text-primary flex items-center">
                  <Share2 className="h-4 w-4 mr-2 text-accent" />
                  Share via QR Code
                </h3>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this code to instantly view and verify this certificate on mobile devices.
                </p>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-inner flex justify-center items-center">
                  <QRCodeSVG 
                    value={typeof window !== 'undefined' ? window.location.href : ''} 
                    size={160}
                    level="Q"
                    includeMargin={true}
                    fgColor="#1e3a8a" // primary color
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </main>
    </div>
  );
}