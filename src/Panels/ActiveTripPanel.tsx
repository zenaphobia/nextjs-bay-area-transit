import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { memo } from "react";

const ActiveTripPlanel = memo(function ActiveTripPanel() {
  return (
    <Drawer>
      <DrawerTrigger className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="p-4 gap-2 flex items-center bg-background border-foreground/15 border rounded-full">
          <h4>Active Trip</h4>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Current Trip</DrawerTitle>
        </DrawerHeader>
        <div></div>
      </DrawerContent>
    </Drawer>
  );
});

export default ActiveTripPlanel;
