import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity p-0 h-auto"
          onClick={() => navigate("/dashboard")}
        >
          IntervueAI
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
