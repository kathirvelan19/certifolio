import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGetMyProfile, useUpdateMyProfile } from "@workspace/api-client-react";
import { Github, Linkedin, Briefcase, FileText, User, Camera, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@workspace/object-storage-web";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient"; // Assume this exists or use useQueryClient

export default function ProfileEdit() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
    github: "",
    linkedin: "",
    leetcode: "",
    resumeUrl: "",
    profileImageUrl: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const initializedRef = useRef(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile && !initializedRef.current) {
      setFormData({
        username: profile.username || "",
        name: profile.name || "",
        bio: profile.bio || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        leetcode: profile.leetcode || "",
        resumeUrl: profile.resumeUrl || "",
        profileImageUrl: profile.profileImageUrl || ""
      });
      initializedRef.current = true;
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setFormData(prev => ({ ...prev, profileImageUrl: response.objectPath }));
      toast({
        title: "Image uploaded",
        description: "Profile image uploaded successfully. Don't forget to save your changes.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your profile image.",
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.includes('image')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG).",
        });
        return;
      }
      uploadFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    updateProfile.mutate(
      { data: formData },
      {
        onSuccess: (updatedProfile) => {
          setIsSaving(false);
          toast({
            title: "Profile updated",
            description: "Your profile has been successfully saved.",
          });
          // Update cache
          queryClient.setQueryData(["getMyProfile"], updatedProfile);
        },
        onError: () => {
          setIsSaving(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update profile. Username might be taken.",
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50/50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-10 w-48 mb-8" />
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-32 w-32 rounded-full mb-8" />
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50/50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your public portfolio appearance and links.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Info */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1 bg-primary w-full"></div>
              <CardHeader className="px-6 py-6 border-b border-gray-50 bg-white">
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Your public identity on Certfolio</CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-md ring-1 ring-gray-100">
                        <AvatarImage src={formData.profileImageUrl ? `/api/storage${formData.profileImageUrl}` : undefined} />
                        <AvatarFallback className="text-4xl bg-indigo-50 text-primary">
                          <User className="h-12 w-12" />
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                      >
                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-8 w-8" />}
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageChange}
                        disabled={isUploading || isSaving}
                      />
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      JPG, PNG max 2MB
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 w-full">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          name="name"
                          placeholder="Jane Doe" 
                          value={formData.name}
                          onChange={handleChange}
                          disabled={isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            certfolio.com/u/
                          </span>
                          <Input 
                            id="username" 
                            name="username"
                            className="rounded-l-none" 
                            placeholder="janedoe"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea 
                        id="bio" 
                        name="bio"
                        placeholder="Tell recruiters about your background, skills, and goals..." 
                        className="min-h-[120px] resize-y"
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={isSaving}
                      />
                      <p className="text-xs text-muted-foreground">
                        Keep it brief and professional. This appears at the top of your portfolio.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="px-6 py-6 border-b border-gray-50 bg-white">
                <CardTitle className="text-lg">Social & Professional Links</CardTitle>
                <CardDescription>Connect your other profiles to your portfolio</CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-[#0A66C2]" /> LinkedIn
                    </Label>
                    <Input 
                      id="linkedin" 
                      name="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/..." 
                      value={formData.linkedin}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-2">
                      <Github className="h-4 w-4" /> GitHub
                    </Label>
                    <Input 
                      id="github" 
                      name="github"
                      type="url"
                      placeholder="https://github.com/..." 
                      value={formData.github}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leetcode" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[#FFA116]" /> LeetCode
                    </Label>
                    <Input 
                      id="leetcode" 
                      name="leetcode"
                      type="url"
                      placeholder="https://leetcode.com/..." 
                      value={formData.leetcode}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resumeUrl" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-accent" /> Resume Link
                    </Label>
                    <Input 
                      id="resumeUrl" 
                      name="resumeUrl"
                      type="url"
                      placeholder="Link to Google Drive / Dropbox PDF" 
                      value={formData.resumeUrl}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-white min-w-[150px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}