import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetUserProfile, useUpdateUserProfile, useGetAiUsage } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { getGetUserProfileQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { User, Key, Zap, Save, CheckCircle2, Copy } from "lucide-react";

export default function Account() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: usage, isLoading: usageLoading } = useGetAiUsage();
  
  const updateMutation = useUpdateUserProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ data: { name, email } });
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  const apiKey = `sk_test_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("API key copied to clipboard");
  };

  const usagePercent = usage && usage.tokenBalance > 0 
    ? Math.min(100, Math.round((usage.tokensUsed / (usage.tokensUsed + usage.tokenBalance)) * 100)) 
    : 0;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, token usage, and API keys.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Profile Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background" />
                    </div>
                  </form>
                )}
              </CardContent>
              <CardFooter className="border-t border-border/50 bg-muted/20 pt-4 flex justify-between">
                <span className="text-xs text-muted-foreground">Member since {profile ? new Date(profile.createdAt).toLocaleDateString() : '...'}</span>
                <Button type="submit" form="profile-form" disabled={updateMutation.isPending || profileLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-accent" /> API Access
                </CardTitle>
                <CardDescription>Use this key to access AI Suite via the API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 border border-border rounded-lg relative overflow-hidden group">
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-muted/50 to-transparent pointer-events-none" />
                    <code className="text-sm font-mono text-muted-foreground break-all">
                      sk_test_••••••••••••••••••••••••••••
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopyKey} className="w-full">
                      {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy API Key
                    </Button>
                    <Button variant="secondary" className="w-full">Regenerate Key</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-card border-primary/20 shadow-md shadow-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Subscription</CardTitle>
                {profileLoading ? <Skeleton className="h-6 w-24 mt-2" /> : (
                  <div className="mt-2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold tracking-wider uppercase">
                      {profile?.planName || "Free Plan"}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Tokens Used</span>
                      <span className="font-mono font-medium">
                        {usageLoading ? "..." : usage?.tokensUsed.toLocaleString()} / {usageLoading ? "..." : (usage?.tokensUsed! + usage?.tokenBalance!).toLocaleString()}
                      </span>
                    </div>
                    <Progress value={usagePercent} className="h-2 bg-muted" indicatorClassName={usagePercent > 80 ? "bg-destructive" : "bg-primary"} />
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                      {usageLoading ? "..." : usage?.tokenBalance.toLocaleString()} tokens remaining
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Generations</span>
                      <span className="font-mono font-medium">{profile?.totalGenerations?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = "/pricing"}>
                  Upgrade Plan
                </Button>
              </CardFooter>
            </Card>

            {usage?.topTools && usage.topTools.length > 0 && (
              <Card className="bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Most Used Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {usage.topTools.slice(0, 3).map((tool, idx) => (
                      <div key={tool.toolId} className="flex items-center justify-between text-sm">
                        <span className="truncate pr-2">{idx + 1}. {tool.label}</span>
                        <span className="font-mono text-muted-foreground">{tool.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
