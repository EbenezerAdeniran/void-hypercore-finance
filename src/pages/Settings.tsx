import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/use-theme";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name is too short").max(120, "Name is too long"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((vals) => vals.new_password === vals.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { full_name: "" } });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { new_password: "", confirm_password: "" } });

  useEffect(() => {
    document.title = "Settings | ThriftPay";
  }, []);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data, error } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single();
      if (!error && data) {
        profileForm.reset({ full_name: data.full_name ?? "" });
      }
    })();
  }, [user]);

  const onSubmitProfile = async (vals: ProfileForm) => {
    try {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").update({ full_name: vals.full_name }).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Profile updated", description: "Your display name was saved." });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? "Try again" });
    }
  };

  const onSubmitPassword = async (vals: PasswordForm) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: vals.new_password });
      if (error) throw error;
      toast({ title: "Password changed", description: "Use your new password next time." });
      passwordForm.reset();
    } catch (e: any) {
      toast({ title: "Password change failed", description: e?.message ?? "Try again" });
    }
  };

  return (
    <main className="min-h-screen void-gradient px-6 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, security and preferences</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your display information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" placeholder="e.g. Ada Lovelace" {...profileForm.register("full_name")}/>
                {profileForm.formState.errors.full_name && (
                  <p className="text-destructive text-sm">{profileForm.formState.errors.full_name.message}</p>
                )}
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New password</Label>
                <Input id="new_password" type="password" {...passwordForm.register("new_password")} />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-destructive text-sm">{passwordForm.formState.errors.new_password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm password</Label>
                <Input id="confirm_password" type="password" {...passwordForm.register("confirm_password")} />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-destructive text-sm">{passwordForm.formState.errors.confirm_password.message}</p>
                )}
              </div>
              <Button type="submit">Change password</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Switch between light and dark mode</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Current: {theme}</p>
            </div>
            <Button variant="outline" onClick={toggle}>Toggle theme</Button>
          </CardContent>
        </Card>

        <Separator />
        <p className="text-xs text-muted-foreground">Tip: Keep your account secure by using a strong, unique password.</p>
      </div>
    </main>
  );
}
