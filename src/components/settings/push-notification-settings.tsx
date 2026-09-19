"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PushNotificationSettingsProps {
  vapidPublicKey?: string;
}

export function PushNotificationSettings({ vapidPublicKey }: PushNotificationSettingsProps) {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const [isUpdating, setIsUpdating] = useState(false);
  const [notifyStreak, setNotifyStreak] = useState(true);
  const [notifyProgress, setNotifyProgress] = useState(true);
  const [notifyAssignments, setNotifyAssignments] = useState(true);

  async function handleToggle() {
    if (!vapidPublicKey) return;

    setIsUpdating(true);

    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe(vapidPublicKey);
      }
    } finally {
      setIsUpdating(false);
    }
  }

  if (!isSupported) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications on your device even when NEOT is closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Push Notifications</Label>
            <p className="text-xs text-muted-foreground">
              {isSubscribed ? "You will receive push notifications." : "Enable to receive push notifications."}
            </p>
          </div>
          <Button
            onClick={handleToggle}
            disabled={isUpdating || isLoading || !vapidPublicKey}
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            className="gap-2"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            {isSubscribed ? "Disable" : "Enable"}
          </Button>
        </div>

        {isSubscribed && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label>Streak Reminders</Label>
                <p className="text-xs text-muted-foreground">Get reminded to maintain your learning streak.</p>
              </div>
              <Switch checked={notifyStreak} onCheckedChange={setNotifyStreak} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Progress Updates</Label>
                <p className="text-xs text-muted-foreground">Receive updates on your course progress.</p>
              </div>
              <Switch checked={notifyProgress} onCheckedChange={setNotifyProgress} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Assignment Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified about new assignments and deadlines.</p>
              </div>
              <Switch checked={notifyAssignments} onCheckedChange={setNotifyAssignments} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
