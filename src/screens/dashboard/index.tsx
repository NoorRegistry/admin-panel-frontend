import StoreDetailsCollapse from "@/components/StoreCollapse";
import { EAdminRole } from "@/types";
import { getAdminRole } from "@/utils/helper";
import StatisticsCards from "./components/Statistics";

function DashboardScreen() {
  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  return (
    <div>
      <StatisticsCards />
      {!isInternalAdmin && (
        <div className="my-8">
          <StoreDetailsCollapse />
        </div>
      )}
    </div>
  );
}

export default DashboardScreen;
