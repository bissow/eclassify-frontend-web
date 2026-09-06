import { useTranslation } from "@/lang/useTranslation";
import CustomLink from "@/components/common/CustomLink";
import { cn } from "@/lib/utils";

const TABS = ["selling", "buying"];

const ChatTabs = ({ activeTab }) => {
  const { t } = useTranslation();
  return (
  <div className="flex items-center">
    {TABS.map((tab) => (
      <CustomLink
        key={tab}
        href={`/chat?activeTab=${tab}`}
        scroll={false}
        className={cn(
          "py-4 flex-1 text-center border-b",
          activeTab === tab && "border-primary text-primary"
        )}
      >
        {t(tab)}
      </CustomLink>
    ))}
  </div>
  );
};

export default ChatTabs;
