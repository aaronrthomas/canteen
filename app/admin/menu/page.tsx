'use client';
// Admin menu page — reuses the same staff menu management component
// but with admin token (which has full access already)
import StaffMenuPage from '@/app/staff/menu/page';
export default function AdminMenuPage() {
  return <StaffMenuPage />;
}
