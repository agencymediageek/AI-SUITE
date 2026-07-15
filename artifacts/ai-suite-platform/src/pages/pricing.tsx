import { AppLayout } from "@/components/layout/app-layout";
import { useListPlans, useSubscribeToPlan } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe } from "@workspace/api-client-react";
import { toast } from "sonner";

export default function Pricing() {
  const { data: plans, isLoading } = useListPlans();
  const { data: user } = useGetMe();
  const subscribeMutation = useSubscribeToPlan();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await subscribeMutation.mutateAsync({ data: { planId } });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.success("Subscribed successfully!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to subscribe");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-12 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Simple, predictable pricing</h1>
          <p className="text-xl text-muted-foreground">
            Get access to 100+ AI tools and premium models. Choose the plan that fits your needs.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-xl" />)}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isCurrentPlan = user?.planId === plan.id;
              const isPopular = plan.isPopular;

              return (
                <Card 
                  key={plan.id} 
                  className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg shadow-primary/20 scale-105 z-10' : 'border-border/50'}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-primary text-primary-foreground uppercase tracking-widest text-[10px] font-bold px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="mt-2 h-10">{plan.description}</CardDescription>
                    <div className="mt-6 flex items-baseline justify-center gap-x-2">
                      <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                      <span className="text-sm font-semibold leading-6 text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 mb-6 bg-muted/50 p-3 rounded-lg justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold">{plan.tokenAllowance.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">tokens / mo</span>
                    </div>
                    <ul className="space-y-3 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex gap-x-3">
                          <Check className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-8 pb-8">
                    <Button 
                      className="w-full" 
                      variant={isPopular ? "default" : "outline"}
                      disabled={isCurrentPlan || subscribeMutation.isPending}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {isCurrentPlan ? "Current Plan" : subscribeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No pricing plans available at the moment.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
