import { useGetRecommendations } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DashboardControls } from "@/components/controls";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowDown, 
  ArrowUp, 
  Tag, 
  ShieldAlert, 
  Eye, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function Recommendations() {
  const queryClient = useQueryClient();
  const recommendationsQuery = useGetRecommendations();

  const loading = recommendationsQuery.isLoading || recommendationsQuery.isFetching;
  const recommendations = recommendationsQuery.data || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "Critical") return "border-red-500/50 bg-red-500/5 shadow-sm shadow-red-500/10";
    if (priority === "High") return "border-orange-500/50 bg-orange-500/5 shadow-sm shadow-orange-500/10";
    if (priority === "Medium") return "border-amber-500/50 bg-amber-500/5 shadow-sm shadow-amber-500/10";
    return "border-border bg-card";
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "Critical") return <span className="bg-red-500 text-white px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Critical</span>;
    if (priority === "High") return <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">High</span>;
    if (priority === "Medium") return <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Medium</span>;
    return <span className="bg-muted text-muted-foreground px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{priority}</span>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reduction": return <ArrowDown className="w-5 h-5 text-red-500" />;
      case "increase": return <ArrowUp className="w-5 h-5 text-green-500" />;
      case "pricing": return <Tag className="w-5 h-5 text-blue-500" />;
      case "reinsurance": return <ShieldAlert className="w-5 h-5 text-purple-500" />;
      case "monitoring": return <Eye className="w-5 h-5 text-amber-500" />;
      case "prevention": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Group recommendations by priority
  const critical = recommendations.filter(r => r.priority === "Critical");
  const high = recommendations.filter(r => r.priority === "High");
  const medium = recommendations.filter(r => r.priority === "Medium");

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="pt-2">
          <h1 className="font-bold text-[32px]">Strategic Recommendations</h1>
          <p className="text-muted-foreground mt-1.5 text-[14px]">Actionable insights based on portfolio risk analysis</p>
        </div>
        <DashboardControls loading={loading} onRefresh={handleRefresh} />
      </div>

      {loading ? (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[180px] w-full rounded-xl" />
          <Skeleton className="h-[180px] w-full rounded-xl" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card mt-6">
          <div className="rounded-full bg-muted p-6 mb-4">
            <CheckCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Recommendations</h2>
          <p className="text-muted-foreground">
            Your portfolio is currently operating within acceptable risk parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {critical.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Immediate Action Required
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {critical.map(rec => (
                  <RecommendationCard key={rec.id} rec={rec} getPriorityColor={getPriorityColor} getPriorityBadge={getPriorityBadge} getTypeIcon={getTypeIcon} />
                ))}
              </div>
            </div>
          )}

          {high.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                High Priority Initiatives
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {high.map(rec => (
                  <RecommendationCard key={rec.id} rec={rec} getPriorityColor={getPriorityColor} getPriorityBadge={getPriorityBadge} getTypeIcon={getTypeIcon} />
                ))}
              </div>
            </div>
          )}

          {medium.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Medium Term Adjustments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medium.map(rec => (
                  <RecommendationCard key={rec.id} rec={rec} getPriorityColor={getPriorityColor} getPriorityBadge={getPriorityBadge} getTypeIcon={getTypeIcon} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function RecommendationCard({ rec, getPriorityColor, getPriorityBadge, getTypeIcon }: any) {
  return (
    <div className={`p-5 rounded-xl border ${getPriorityColor(rec.priority)} flex flex-col h-full`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background/50 rounded-lg border border-border/50">
            {getTypeIcon(rec.type)}
          </div>
          <h3 className="font-bold text-lg">{rec.title}</h3>
        </div>
        {getPriorityBadge(rec.priority)}
      </div>
      
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        {rec.description}
      </p>
      
      <div className="mt-auto space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Projected Impact</span>
          <p className="text-sm font-medium">{rec.impact}</p>
        </div>
        
        {rec.affectedWilayas && rec.affectedWilayas.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Target Wilayas</span>
            <div className="flex flex-wrap gap-1.5">
              {rec.affectedWilayas.map((w: string) => (
                <span key={w} className="px-2 py-0.5 bg-background border border-border/50 rounded text-xs">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
