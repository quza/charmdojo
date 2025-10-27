'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Trash2, Save, Lock, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PasswordStrengthIndicator } from '@/components/profile/PasswordStrengthIndicator';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  // Name state
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Initialize display name from user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.name || '');
    }
  }, [user]);

  const handleBack = () => {
    router.push('/main-menu');
  };

  // Avatar handlers
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      toast.success('Avatar updated successfully!');

      // Reset states
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Refresh the page to show new avatar
      window.location.reload();
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user?.user_metadata?.avatar_url) return;

    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setRemovingAvatar(true);
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove avatar');
      }

      toast.success('Avatar removed successfully!');

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Avatar removal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove avatar');
    } finally {
      setRemovingAvatar(false);
    }
  };

  // Name handlers
  const handleNameSave = async () => {
    setNameError('');

    if (!displayName || displayName.trim().length === 0) {
      setNameError('Name cannot be empty');
      return;
    }

    if (displayName.length > 100) {
      setNameError('Name must be less than 100 characters');
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_'.]+$/.test(displayName)) {
      setNameError('Name contains invalid characters');
      return;
    }

    setSavingName(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to update name');
      }

      toast.success('Display name updated successfully!');

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Name update error:', error);
      setNameError(error instanceof Error ? error.message : 'Failed to update name');
      toast.error(error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  // Password handlers
  const handlePasswordChange = async () => {
    setPasswordError('');

    // Validate fields
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one number');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully!');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04060c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e15f6e] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-[#04060c] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#e15f6e]">Edit Profile</h1>
            <p className="text-sm text-white/70">Update your profile information</p>
          </div>
        </div>

        {/* Avatar Section */}
        <Card className="border-[#e15f6e]/20 bg-gradient-to-br from-[#04060c] to-[#0a0d1a]">
          <CardHeader>
            <CardTitle className="text-[#e15f6e]">Profile Avatar</CardTitle>
            <CardDescription className="text-white/70">
              Upload a profile picture (max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <Avatar className="size-24 border-2 border-[#e15f6e]">
                <AvatarImage
                  src={avatarPreview || user.user_metadata?.avatar_url}
                  alt={userName}
                />
                <AvatarFallback className="bg-gradient-to-r from-[#f53049] to-[#f22a5a] text-2xl text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-1 flex-wrap gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                
                {avatarFile ? (
                  <>
                    <Button
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="bg-[#e15f6e] hover:bg-[#e15f6e]/90"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 size-4" />
                          Save Avatar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      variant="outline"
                      disabled={uploadingAvatar}
                      className="border-[#e15f6e]/30 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-[#e15f6e]/30 text-white hover:bg-white/10"
                    >
                      <Upload className="mr-2 size-4" />
                      Upload New
                    </Button>
                    
                    {user.user_metadata?.avatar_url && (
                      <Button
                        onClick={handleAvatarRemove}
                        disabled={removingAvatar}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        {removingAvatar ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 size-4" />
                            Remove
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Name Section */}
        <Card className="border-[#e15f6e]/20 bg-gradient-to-br from-[#04060c] to-[#0a0d1a]">
          <CardHeader>
            <CardTitle className="text-[#e15f6e]">Display Name</CardTitle>
            <CardDescription className="text-white/70">
              This is how your name will be displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Name
              </Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setNameError('');
                }}
                placeholder="Enter your name"
                className="border-[#e15f6e]/30 bg-[#04060c] text-white placeholder:text-white/50"
                maxLength={100}
              />
              {nameError && <p className="text-sm text-red-400">{nameError}</p>}
            </div>

            <Button
              onClick={handleNameSave}
              disabled={savingName || displayName === (user.user_metadata?.name || '')}
              className="bg-[#e15f6e] hover:bg-[#e15f6e]/90"
            >
              {savingName ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="border-[#e15f6e]/20 bg-gradient-to-br from-[#04060c] to-[#0a0d1a]">
          <CardHeader>
            <CardTitle className="text-[#e15f6e]">Change Password</CardTitle>
            <CardDescription className="text-white/70">
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-white">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter current password"
                className="border-[#e15f6e]/30 bg-[#04060c] text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-white">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter new password"
                className="border-[#e15f6e]/30 bg-[#04060c] text-white placeholder:text-white/50"
              />
            </div>

            {newPassword && (
              <PasswordStrengthIndicator password={newPassword} />
            )}

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Confirm new password"
                className="border-[#e15f6e]/30 bg-[#04060c] text-white placeholder:text-white/50"
              />
            </div>

            {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}

            <Button
              onClick={handlePasswordChange}
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="bg-[#e15f6e] hover:bg-[#e15f6e]/90"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 size-4" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

