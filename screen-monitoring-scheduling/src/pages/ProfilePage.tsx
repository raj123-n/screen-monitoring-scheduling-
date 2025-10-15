import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useDatabase } from "@/hooks/useDatabase";
import { toast } from "sonner";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const { userProfile, updateProfile, loading } = useDatabase();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [workSessionDuration, setWorkSessionDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);
  const [weightKg, setWeightKg] = useState<number | undefined>(undefined);
  const [age, setAge] = useState<number | undefined>(undefined);
  const [profession, setProfession] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    setDisplayName(userProfile.displayName || "");
    setEmail(userProfile.email || currentUser?.email || "");
    setWorkSessionDuration(userProfile.preferences?.workSessionDuration ?? 25);
    setBreakDuration(userProfile.preferences?.breakDuration ?? 5);
    setBio(userProfile.bio || "");
    setLocation(userProfile.location || "");
    setPhotoURL(userProfile.photoURL);
    setGender((userProfile.gender as any) || 'prefer_not_to_say');
    setHeightCm(userProfile.heightCm);
    setWeightKg(userProfile.weightKg);
    setAge(userProfile.age);
    setProfession(userProfile.profession || "");
  }, [userProfile, currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName,
        email,
        bio,
        location,
        photoURL,
        gender,
        heightCm: heightCm ?? undefined,
        weightKg: weightKg ?? undefined,
        age: age ?? undefined,
        profession,
        preferences: {
          ...userProfile?.preferences,
          workSessionDuration,
          breakDuration,
        },
      } as any);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    try {
      setUploading(true);
      const path = `profilePhotos/${currentUser.uid}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      try {
        await updateProfile({ photoURL: url } as any);
      } catch {}
      toast.success("Photo uploaded and saved");
    } catch (err) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-start justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          {currentUser?.emailVerified ? (
            <Badge variant="secondary">Email verified</Badge>
          ) : (
            <Badge variant="destructive">Email not verified</Badge>
          )}
        </div>

        <Card>
          <form onSubmit={handleSave}>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>View and edit your personal information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName || currentUser?.email || 'User')}`}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover border"
                />
                <div>
                  <Label htmlFor="photo">Profile Photo</Label>
                  <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={gender} onChange={(e) => setGender(e.target.value as any)}>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g., Software Engineer" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" min={50} max={250} value={heightCm ?? ''} onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" min={20} max={300} value={weightKg ?? ''} onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" min={5} max={120} value={age ?? ''} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)} />
                </div>
              </div>
              
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
              <Button type="submit" disabled={loading || uploading}>Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}


