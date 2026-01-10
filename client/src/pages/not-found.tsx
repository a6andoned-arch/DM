import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto glass-panel border-white/10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-300">
            It seems you have wandered into the void. This path does not exist in the current timeline.
          </p>
          
          <div className="mt-6">
            <Link href="/">
               <Button className="w-full bg-primary text-black hover:bg-white">Return to the Light</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
