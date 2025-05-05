
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page Not Found | PS2 Estate Nexus";
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-3 rounded-full">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button asChild>
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="#" onClick={() => window.history.back()} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
