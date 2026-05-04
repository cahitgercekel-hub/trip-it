import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, MapPin, Settings2, Rocket } from "lucide-react";
import { Button } from "./ui/button";
import { usePlanner } from "@/context/PlannerContext";
import { cn } from "@/lib/utils";

export function TutorialModal({ dark = false }: { dark?: boolean }) {
  const { t } = usePlanner();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          className={cn(
            "w-9 h-9 flex items-center justify-center shadow-sm",
            dark 
              ? "bg-primary/10 border-2 border-black rounded-lg" 
              : "bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/40 rounded-full transition-all group"
          )}
        >
          <Info className={cn(
            "w-5 h-5",
            dark ? "text-black" : "text-white group-hover:scale-110 transition-transform"
          )} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {t('tutorialTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex gap-4">
            <div className="bg-primary/10 p-2 rounded-lg h-fit">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{t('tutorialStep1Title')}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t('tutorialStep1Desc')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-primary/10 p-2 rounded-lg h-fit">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{t('tutorialStep2Title')}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t('tutorialStep2Desc')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-primary/10 p-2 rounded-lg h-fit">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{t('tutorialStep3Title')}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t('tutorialStep3Desc')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
