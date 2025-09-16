"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// colors for charts
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f", "#ffbb28"];

export default function Dashboard() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("buyers").select("*");
      if (error) {
        console.error("Error fetching buyers:", error);
        setBuyers([]);
      } else {
        setBuyers(data || []);
      }
      setLoading(false);
    };
    fetchBuyers();
  }, []);

  // Safe counters
  const totalLeads = buyers?.length || 0;
  const activeBuyers = buyers?.filter(b => b.status && !["Dropped", "Converted"].includes(b.status)).length || 0;
  const converted = buyers?.filter(b => b.status === "Converted").length || 0;
  const dropped = buyers?.filter(b => b.status === "Dropped").length || 0;

  // group by helper
  const groupBy = (key: string) => {
    if (!buyers) return [];
    const counts: Record<string, number> = {};
    buyers.forEach(b => {
      const val = b[key] || "Unknown";
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const statusData = groupBy("status");
  const sourceData = groupBy("source");
  const cityData = groupBy("city");

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Leads</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{totalLeads}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active Buyers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{activeBuyers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Converted</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{converted}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Dropped</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{dropped}</p></CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList>
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="source">By Source</TabsTrigger>
          <TabsTrigger value="city">By City</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="p-4">
          {statusData.length === 0 ? (
            <p>No status data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={120} label>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </TabsContent>

        <TabsContent value="source" className="p-4">
          {sourceData.length === 0 ? (
            <p>No source data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </TabsContent>

        <TabsContent value="city" className="p-4">
          {cityData.length === 0 ? (
            <p>No city data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
