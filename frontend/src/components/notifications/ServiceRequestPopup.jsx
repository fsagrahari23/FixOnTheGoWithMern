import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  AlertTriangle,
  Clock,
  User,
  Wrench,
  Navigation,
  X,
  CheckCircle,
} from "lucide-react";
import { dismissPopup } from "../../store/slices/notificationSlice";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

export function ServiceRequestPopup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { popupNotifications } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);

  // Filter for service request notifications (mechanics only)
  const serviceRequests = popupNotifications.filter(
    (n) => n.type === "service-request" && user?.role === "mechanic"
  );

  const [currentRequest, setCurrentRequest] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Show popup for the most recent service request
  useEffect(() => {
    if (serviceRequests.length > 0 && !currentRequest) {
      setCurrentRequest(serviceRequests[0]);
      setIsOpen(true);
      setCountdown(30);
    }
  }, [serviceRequests]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !currentRequest) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, currentRequest]);

  const handleDismiss = () => {
    if (currentRequest) {
      dispatch(dismissPopup(currentRequest._id));
    }
    setCurrentRequest(null);
    setIsOpen(false);
  };

  const handleAccept = () => {
    if (currentRequest?.data?.link) {
      navigate(currentRequest.data.link);
    }
    handleDismiss();
  };

  if (!currentRequest) return null;

  const { data } = currentRequest;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        {/* Urgent indicator */}
        {data?.isPriority && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
        )}

        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                data?.isPriority
                  ? "bg-red-500/20 text-red-500"
                  : "bg-orange-500/20 text-orange-500"
              )}
            >
              {data?.isPriority ? (
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              ) : (
                <Wrench className="w-6 h-6" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {currentRequest.title}
                {data?.isPriority && (
                  <Badge variant="destructive" className="ml-2">
                    PRIORITY
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{currentRequest.message}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Problem Category */}
          {data?.problemCategory && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Issue Type</p>
                <p className="font-medium">{data.problemCategory}</p>
              </div>
            </div>
          )}

          {/* Distance and Location */}
          <div className="grid grid-cols-2 gap-3">
            {data?.distance && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Navigation className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-medium">{data.distance} km</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Time Left</p>
                <p
                  className={cn(
                    "font-medium tabular-nums",
                    countdown <= 10 && "text-red-500"
                  )}
                >
                  {countdown}s
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {data?.address && (
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm">{data.address}</p>
              </div>
            </div>
          )}

          {/* Countdown progress bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute top-0 left-0 h-full transition-all duration-1000 rounded-full",
                countdown > 20
                  ? "bg-green-500"
                  : countdown > 10
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${(countdown / 30) * 100}%` }}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            className={cn(
              "flex-1",
              data?.isPriority && "bg-red-500 hover:bg-red-600"
            )}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            View & Accept
          </Button>
        </DialogFooter>

        {/* Remaining requests indicator */}
        {serviceRequests.length > 1 && (
          <p className="text-xs text-center text-muted-foreground">
            +{serviceRequests.length - 1} more service request
            {serviceRequests.length > 2 ? "s" : ""} waiting
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ServiceRequestPopup;
