import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle } from "lucide-react";
import CTFoodLogo from "../resources/CTFood_logo.png";

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (password === "123") {
        localStorage.setItem("isAuthenticated", "true");
        onLogin();
      } else {
        setError("Incorrect password. Please try again.");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={CTFoodLogo} 
              alt="CT Food Logo" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter the password to access the Integration Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? "Verifying..." : "Access System"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 