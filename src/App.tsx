import { Route, Routes } from "react-router-dom";

import StorefrontPage from "@/storefront/page";
import TrackOrderAnimated from "@/order-tracking/page";
import PrivacyConsentPage from "@/privacy-consent/page";
import PrivacyPolicyPage from "@/privacy-policy/page";
import TermsOfServicePage from "@/terms-of-service/page";
import QuotationPage from "@/Quotation/page";
import SupportPage from "@/Support/page";
import EnterprisePage from "@/Enterprise/page";
import ProductPage from "@/Products/page";
import ResourcesPage from "@/resources/page";

function App() {
  return (
    <Routes>
      <Route element={<StorefrontPage />} path="/" />
      <Route path="/order-tracking" element={<TrackOrderAnimated />} />
      <Route path="/privacy-consent" element={<PrivacyConsentPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/Quotation" element={<QuotationPage />} />
      <Route path="/Support" element={<SupportPage />} />
      <Route path="/Enterprise" element={<EnterprisePage />} />
      <Route path="/Products" element={<ProductPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
    </Routes>
  );
}

export default App;
