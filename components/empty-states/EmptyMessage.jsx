'use client';
import NoDataFound from "@/public/assets/no_data_found_illustrator.svg";
import CustomImage from "@/components/common/CustomImage";
import { useTranslation } from "@/lang/useTranslation";

const EmptyMessage = ({ message }) => {
    const { t } = useTranslation();
    return (
        <div className="text-center flex flex-col items-center justify-center gap-2 h-[50vh]">
            <div>
                <CustomImage src={NoDataFound} alt="no_img" width={200} height={200} />
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-medium text-primary">
                    {message}
                </h3>
                <p>{t("sorryTryAnotherWay")}</p>
            </div>
        </div>
    );
};

export default EmptyMessage;
