import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Bed, Footprints, Apple, GlassWater } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BreakAlertDialogProps {
  open: boolean;
  onContinue: () => void;
  onClose?: () => void;
  breakDuration: number;
  autoStartNextWork?: boolean;
  onToggleAutoStart?: (auto: boolean) => void;
}

export function BreakAlertDialog({ open, onContinue, onClose, breakDuration, autoStartNextWork, onToggleAutoStart }: BreakAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) { onClose?.(); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl text-center">Time for a break!</AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2">
            You've been active for a while. It's a great time to rest your eyes and recharge for {Math.floor(breakDuration / 60)} minutes. Here are some suggestions:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary">
            <Footprints className="h-10 w-10 text-primary" />
            <p className="font-semibold">Go for a walk</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary">
            <Apple className="h-10 w-10 text-primary" />
            <p className="font-semibold">Eat a healthy snack</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary">
            <GlassWater className="h-10 w-10 text-primary" />
            <p className="font-semibold">Drink some water</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary">
            <Bed className="h-10 w-10 text-primary" />
            <p className="font-semibold">Rest your eyes</p>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <Label htmlFor="auto-work" className="text-sm">Start next work session automatically after break</Label>
          <Switch id="auto-work" checked={!!autoStartNextWork} onCheckedChange={onToggleAutoStart} />
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onContinue} className="w-full">
            Got it, I'll take a break!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
