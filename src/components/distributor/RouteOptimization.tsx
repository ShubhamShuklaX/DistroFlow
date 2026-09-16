import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Truck,
  MapPin,
  Clock,
  Package,
  Phone,
  CheckCircle2,
  Navigation,
  ArrowRight,
} from 'lucide-react';

export const RouteOptimization: React.FC = () => {
  const [routesData, setRoutesData] = useState<Record<string, any[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeZone, setActiveZone] = useState('North');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await api.getRouteOptimization();
      setRoutesData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Calculating optimal delivery sequence...</div>;
  }

  const activeStops = routesData?.[activeZone] || [];
  const totalPackages = activeStops.reduce((sum, s) => sum + s.packageCount, 0);
  const totalDistance = activeStops.reduce((sum, s) => sum + s.estimatedDistanceKm, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Navigation className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Delivery Fleet Route Optimization
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic waypoint clustering for last-mile delivery drop-offs across regional zones.
          </p>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {['North', 'South', 'West', 'Central'].map((z) => (
            <button
              key={z}
              onClick={() => setActiveZone(z)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeZone === z
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {z} Zone Route ({routesData?.[z]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Route Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Planned Drop-Offs
          </span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{activeStops.length} Stores</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Scheduled today</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Cargo Load
          </span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{totalPackages} Packages</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Loaded onto van</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Estimated Route Distance
          </span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{totalDistance.toFixed(1)} km</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Optimized sequence</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Assigned Driver
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">Deepak Rao</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
            Van #MH-02-CX-4491
          </span>
        </div>
      </div>

      {/* Visual Route Timeline & Waypoints */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Waypoints & Drop-Off Sequence ({activeZone} Corridor)
        </h3>

        {activeStops.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No pending dispatches queued in {activeZone} zone today.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-200 dark:before:bg-brand-900">
            {activeStops.map((stop) => (
              <div key={stop.orderId} className="relative flex items-start justify-between gap-4">
                {/* Node icon */}
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[11px] ring-4 ring-white dark:ring-slate-900 shadow-xs">
                  {stop.stopNumber}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {stop.shopName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        #{stop.orderId}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{stop.address}, {stop.city}</span>
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Contact: {stop.ownerName} &bull; {stop.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Drop Time</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {stop.estimatedDeliveryTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Cargo</span>
                      <span className="font-semibold text-brand-600">
                        {stop.packageCount} units
                      </span>
                    </div>
                    <a
                      href={`tel:${stop.phone}`}
                      className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="Call Store"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
