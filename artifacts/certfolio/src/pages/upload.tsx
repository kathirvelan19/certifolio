import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpload } from "@workspace/object-storage-web";
import { useCreateCertificate } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { UploadCloud, CheckCircle2, FileText, Loader2, Image as ImageIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Course",
  "Internship",
  "Workshop",
  "Hackathon",
  "Achievement",
  "Degree",
  "Certification"
];

export default function UploadCertificate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCertificate = useCreateCertificate();

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      createCertificate.mutate(
        {
          data: {
            title,
            issuer,
            category,
            fileUrl: response.objectPath,
            fileType: file?.type,
          }
        },
        {
          onSuccess: (cert) => {
            toast({
              title: "Success!",
              description: "Certificate uploaded successfully.",
            });
            setLocation(`/certificate/${cert.id}`);
          },
          onError: (err) => {
            setIsSubmitting(false);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to save certificate metadata. Please try again.",
            });
          }
        }
      );
    },
    onError: (err) => {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !issuer || !category || !file) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill out all fields and select a file.",
      });
      return;
    }

    setIsSubmitting(true);
    uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validation for file type
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or image file.",
        });
        e.target.value = '';
        setFile(null);
        return;
      }
      
      // Auto-fill title from filename if empty
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        // Capitalize words and replace hyphens/underscores with spaces
        const formattedName = nameWithoutExt
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        setTitle(formattedName);
      }
      
      setFile(selectedFile);
    }
  };

  const isFormValid = title.trim() !== "" && issuer.trim() !== "" && category !== "" && file !== null;

  return (
    <div className="min-h-[100dvh] bg-slate-50/50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Add Certificate</h1>
          <p className="text-muted-foreground mt-1">Upload a new certificate to add to your portfolio.</p>
        </div>

        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-primary w-full"></div>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* File Upload Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-primary">1. Upload Document</Label>
                
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-primary/50 bg-indigo-50/50' : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'}`}>
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        {file.type.includes('pdf') ? (
                          <FileText className="h-8 w-8 text-indigo-600" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-indigo-600" />
                        )}
                      </div>
                      <p className="font-medium text-primary mb-1">{file.name}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFile(null)}
                        disabled={isSubmitting}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <UploadCloud className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-medium text-primary mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mb-6">PDF, JPG, PNG (max. 10MB)</p>
                      
                      <Label htmlFor="certificate-file" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                        Select File
                      </Label>
                      <Input 
                        id="certificate-file" 
                        type="file" 
                        accept=".pdf,image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-primary">2. Certificate Details</Label>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="title">Certificate Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Advanced React Patterns" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isSubmitting}
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="issuer">Issuing Organization</Label>
                    <Input 
                      id="issuer" 
                      placeholder="e.g. Frontend Masters" 
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                      disabled={isSubmitting}
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                      <SelectTrigger id="category" className="bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {isSubmitting && (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-primary">
                      {isUploading ? "Uploading file..." : "Saving details..."}
                    </span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={!isFormValid || isSubmitting}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Add to Portfolio
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}