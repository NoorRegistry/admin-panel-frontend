import { Suspense } from "react";
import OrdersScreen from "@/screens/orders";
export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersScreen />
    </Suspense>
  );
}
