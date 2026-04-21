import { createBrowserRouter } from "react-router-dom";
import DevPage from "@/app/dev/DevPage";
import LoginPage from "@/modules/auth/pages/LoginPage";
import CampaignSelectPage from "@/modules/campaign/pages/CampaignSelectPage";
import ScannerHubPage from "@/modules/scanner/pages/ScannerHubPage";
import QrScannerPage from "@/modules/scanner/qr/QrScannerPage";
import OcrScannerPage from "@/modules/scanner/ocr/OcrScannerPage";
import ManualEntryPage from "@/modules/scanner/manual/ManualEntryPage";
import LeadReviewPage from "@/modules/lead/pages/LeadReviewPage";
import LeadListPage from "@/modules/lead/pages/LeadListPage";
import LeadDetailPage from "@/modules/lead/pages/LeadDetailPage";
import SyncQueuePage from "@/modules/settings/pages/SyncQueuePage";
import SettingsPage from "@/modules/settings/pages/SettingsPage";

export const router = createBrowserRouter([
  { path: "/__dev", element: <DevPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/campaigns", element: <CampaignSelectPage /> },
  { path: "/", element: <ScannerHubPage /> },
  { path: "/scan/qr", element: <QrScannerPage /> },
  { path: "/scan/ocr", element: <OcrScannerPage /> },
  { path: "/scan/manual", element: <ManualEntryPage /> },
  { path: "/lead/review", element: <LeadReviewPage /> },
  { path: "/leads", element: <LeadListPage /> },
  { path: "/leads/:id", element: <LeadDetailPage /> },
  { path: "/sync", element: <SyncQueuePage /> },
  { path: "/settings", element: <SettingsPage /> },
]);
