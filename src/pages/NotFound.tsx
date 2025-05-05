
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Auto-navigate to dashboard or login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentUser, navigate]);
  
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-ps2-primary p-6 flex justify-center">
          <AlertTriangle size={64} className="text-white" />
        </div>
        
        <div className="p-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-xl font-medium text-gray-700 mb-4">Page Not Found</h2>
          
          <p className="text-gray-600 mb-6">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={16} />
              Go Back
            </Button>
            
            <Link to={currentUser ? "/dashboard" : "/login"}>
              <Button className="flex items-center gap-2 w-full">
                <Home size={16} />
                {currentUser ? "Return to Dashboard" : "Go to Login"}
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            You will be automatically redirected in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
