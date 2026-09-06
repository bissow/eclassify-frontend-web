"use client";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import UnderMaintenance from "@/public/assets/something_went_wrong.svg";

export default function MaintenanceScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
      <CustomImage
        src={UnderMaintenance}
        alt="Maintenance Mode"
        height={255}
        width={255}
      />
      <p className="text-center max-w-[40%]">{t("underMaintenance")}</p>
    </div>
  );
}
