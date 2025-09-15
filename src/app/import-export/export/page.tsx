// /app/import-export/export/page.tsx
import { Suspense } from 'react';
import BuyersExportPage from './BuyersExportPage ';

export default function ExportPageWrapper() {
  return (
    <Suspense fallback={<div>Loading export page...</div>}>
      <BuyersExportPage />
    </Suspense>
  );
}
