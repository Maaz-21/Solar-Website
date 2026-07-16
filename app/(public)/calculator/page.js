"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, IndianRupee, Sun, BatteryCharging, Calendar, Sparkles, ArrowRight, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  getStateTariff,
  getOfflinePSH,
  specificYieldFromPSH,
  buildEnergyReport,
  DEFAULT_PANEL,
} from "@/lib/solar-engine";

// Gross roof area per kW including spacing/setbacks (~8 m² ≈ 86 sq ft).
const SQFT_PER_M2 = 10.764;
const GROSS_M2_PER_KW = 8;

export default function SolarCalculator() {
  const [formData, setFormData] = useState({
    monthlyBill: "",
    state: "",
    roofSize: "",
    subsidy: true,
  });

  const [results, setResults] = useState(null);

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
  ];

  // Same engine as the Solar Design Studio, so both tools always agree:
  //  - tariff defaults per selected state (editable data table)
  //  - solar yield from the state's Peak Sun Hours, not a flat constant
  //  - PM Surya Ghar subsidy slabs (₹30k/kW ≤2kW, ₹18k 3rd kW, cap ₹78k)
  //  - savings capped at what the system actually generates vs. usage
  //  - payback from a 25-year cash flow with panel degradation
  const calculateROI = (e) => {
    e.preventDefault();

    const bill = parseFloat(formData.monthlyBill);
    const roofSqft = parseFloat(formData.roofSize);
    if (!bill || !roofSqft) return;

    const tariff = getStateTariff(formData.state);
    const { psh } = getOfflinePSH({ state: formData.state });
    const specificYield = specificYieldFromPSH(psh); // kWh per kWp per year

    // Size to consumption, then cap by roof space.
    const monthlyUnits = bill / tariff;
    const annualUsage = monthlyUnits * 12;
    const recommendedKW = annualUsage / specificYield;
    const maxSystemByRoof = (roofSqft / SQFT_PER_M2) / GROSS_M2_PER_KW;
    const systemSize = Math.max(Math.round(Math.min(recommendedKW, maxSystemByRoof) * 10) / 10, 0.5);
    const isRoofSufficient = maxSystemByRoof >= recommendedKW;

    const report = buildEnergyReport({
      systemSizeKW: systemSize,
      specificYield,
      yieldSource: "table",
      tariff,
      panelCount: Math.round((systemSize * 1000) / DEFAULT_PANEL.wattage),
      subsidySchemeId: formData.subsidy ? "pm-surya-ghar" : "none",
    });
    if (!report) return;

    // Savings can never exceed the current bill (self-consumption +
    // net-metering credit against usage).
    const generationValue = report.financial.firstYearSavings;
    const billValue = bill * 12;
    const annualSavings = Math.min(generationValue, billValue);
    const coveragePct = Math.min(Math.round((report.annualGeneration / annualUsage) * 100), 100);

    setResults({
      systemSize,
      panelCount: Math.round((systemSize * 1000) / DEFAULT_PANEL.wattage),
      tariff,
      grossCost: report.financial.grossCost,
      subsidyAmount: report.financial.subsidyAmount,
      totalCost: report.financial.netCost,
      annualSavings: Math.round(annualSavings),
      annualGeneration: report.annualGeneration,
      breakEvenYears: report.financial.paybackYears ?? "—",
      lifetimeSavings: report.financial.lifetimeSavings,
      co2Yearly: report.co2SavingsYearlyKg,
      coveragePct,
      isRoofSufficient,
      maxSystemByRoof: Math.round(maxSystemByRoof * 10) / 10,
    });
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-heading flex items-center justify-center gap-3">
            <Calculator className="w-8 h-8 text-green-500" />
            Solar ROI Calculator
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Estimate your solar savings and return on investment in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 md:p-8 shadow-xl"
          >
            <form onSubmit={calculateROI} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Electricity Bill (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="e.g. 2500"
                    value={formData.monthlyBill}
                    onChange={(e) => setFormData({...formData, monthlyBill: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-white"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roof Area (sq. ft)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. 500"
                  value={formData.roofSize}
                  onChange={(e) => setFormData({...formData, roofSize: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Subsidy Eligible?</span>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, subsidy: !formData.subsidy})}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.subsidy ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.subsidy ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Calculate Savings
              </button>
            </form>
          </motion.div>

          {/* Results Display */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {!results ? (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
                <Sun className="w-16 h-16 text-yellow-400 mb-4 opacity-50" />
                <p className="text-lg">Enter your details to see how much you can save with solar.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-green-600 p-6 text-white text-center">
                  <h3 className="text-lg font-medium opacity-90">Recommended System Size</h3>
                  <div className="text-4xl font-bold mt-2">{results.systemSize} kW</div>
                  <div className="text-sm mt-1 opacity-90">
                    ≈ {results.panelCount} panels · covers ~{results.coveragePct}% of your usage
                  </div>
                  {!results.isRoofSufficient && (
                    <div className="mt-2 text-xs bg-red-500/20 py-1 px-2 rounded inline-block border border-red-400/30">
                      Sized to your roof — space limits it to {results.maxSystemByRoof} kW
                    </div>
                  )}
                </div>

                <div className="p-6 grid grid-cols-1 gap-4">
                  <ResultCard
                    icon={IndianRupee}
                    label="Net Cost After Subsidy"
                    value={`₹${results.totalCost.toLocaleString("en-IN")}`}
                    subtext={
                      results.subsidyAmount > 0
                        ? `₹${results.grossCost.toLocaleString("en-IN")} − ₹${results.subsidyAmount.toLocaleString("en-IN")} PM Surya Ghar subsidy`
                        : "Without subsidy"
                    }
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                  />

                  <ResultCard
                    icon={BatteryCharging}
                    label="First-Year Savings"
                    value={`₹${results.annualSavings.toLocaleString("en-IN")}`}
                    subtext={`~${results.annualGeneration.toLocaleString("en-IN")} kWh/yr @ ₹${results.tariff}/kWh (${formData.state || "your state"})`}
                    color="text-green-600"
                    bgColor="bg-green-50"
                  />

                  <ResultCard
                    icon={Calendar}
                    label="Payback Period"
                    value={`${results.breakEvenYears} Years`}
                    subtext={`₹${results.lifetimeSavings.toLocaleString("en-IN")} saved over 25 years`}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                  />

                  <ResultCard
                    icon={Leaf}
                    label="CO₂ Avoided"
                    value={`${results.co2Yearly.toLocaleString("en-IN")} kg/yr`}
                    subtext="Equivalent to planting ~50 trees a year"
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                  />
                </div>

                <div className="px-6 pb-6 space-y-4">
                  <Link
                    href="/solar-design"
                    className="btn-hero-primary w-full justify-center py-3.5! text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get exact numbers on your real roof
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-xs text-gray-400 text-center">
                    *Same calculation engine as our Design Studio. Estimates use your
                    state&apos;s average tariff and solar resource — actual generation
                    depends on roof orientation, shading and equipment.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  </>
  );
}

function ResultCard({ icon: Icon, label, value, subtext, color, bgColor }) {
  return (
    <div className="flex items-center p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${bgColor} ${color} mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{subtext}</p>
      </div>
    </div>
  );
}
