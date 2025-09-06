'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportsPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500 mb-4">
              Generate comprehensive reports for your fleet operations.
            </p>
            <Button>Generate Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}