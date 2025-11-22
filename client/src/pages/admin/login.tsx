import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/login";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md px-6">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Admin Access</h1>
            <p className="text-muted-foreground text-lg">
              Sign in to manage your portfolio
            </p>
          </div>

          {/* Login Button */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground/70 text-center">
              Authorized access only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
